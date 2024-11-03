const express = require('express');
const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const logger = require('morgan');
const bodyParser = require('body-parser');
const { logToCSV } = require('./log.js');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Neo4j connection
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'nessus_datasets');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route to add exploits to a project vrom json file
app.post('/projects/:projectName/add-exploits', async (req, res) => {
  const { projectName } = req.params;
  const exploitsFile = path.join(__dirname, 'Process_5', 'exploits.json');

  try {
    // Read exploit data
    const exploitData = JSON.parse(fs.readFileSync(exploitsFile, 'utf8'));

    // Check if project exists
    const projectResult = await session.run('MATCH (p:Project {name: $projectName}) RETURN p', { projectName });
    if (projectResult.records.length === 0) {
      return res.status(404).send('Project not found');
    }

    // Add each exploit to the project
    for (const exploit of exploitData) {
      await session.run(
        'MATCH (p:Project {name: $projectName}) ' +
        'MERGE (e:Exploit {name: $name}) ' +
        'MERGE (p)-[:HAS_AVAILABLE_EXPLOIT]->(e)',
        { projectName, name: exploit.name }
      );
    }

    res.status(200).send('Exploits added successfully');
  } catch (error) {
    console.error('Error adding exploits:', error);
    res.status(500).send('Error adding exploits');
  }
});

// Route to upload a Nessus file and process it
app.post('/upload', upload.single('file'), async (req, res) => {
  const { projectName } = req.body;
  if (!projectName || !req.file) return res.status(400).send('Project name and file are required.');

  const filePath = path.join(__dirname, 'nessus_datasets', req.file.filename);
  const pythonScriptPath = path.join(__dirname, 'process_nessus.py');
  const exploitOutputPath = path.join(__dirname, 'Process_5', 'exploits.json');

  try {
    // 1. Create or get the project
    await session.run('MERGE (p:Project {name: $projectName}) RETURN p', { projectName });

    // 2. Run the Python script for file processing
    const pythonProcess = spawn('python', [pythonScriptPath, req.file.filename]);
    pythonProcess.on('close', async (code) => {
      if (code !== 0) return res.status(500).send('Error processing file');

      // 3. Read exploit data from the generated JSON file
      const exploitData = JSON.parse(fs.readFileSync(exploitOutputPath, 'utf8'));
      for (const exploit of exploitData) {
        await session.run(
          'MATCH (p:Project {name: $projectName}) ' +
          'MERGE (e:Exploit {name: $name}) ' +
          'MERGE (p)-[:HAS_AVAILABLE_EXPLOIT]->(e)',
          { projectName, name: exploit.name }
        );
      }

      const csvFiles = files.filter((file) => file.endsWith('.csv'));
      res.json({
        filename: req.file.filename,
        message: 'File uploaded and processed successfully',
        csvFiles: csvFiles,
      });    
    });
  } catch (error) {
    console.error('Error in upload:', error);
    res.status(500).send('Error in upload process');
  }
});


// Route to download CSV files
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'Process_5', filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(500).send('Error downloading file');
    }
  });
});

// Get all projects
app.get('/projects', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Project) RETURN p.name AS name');
    const projects = result.records.map((record) => record.get('name'));
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

// Create a new project with an optional Nessus file reference
app.post('/projects', async (req, res) => {
  const { name, nessusFile = null } = req.body;  // Accept nessusFile as part of the request
  try {
    await session.run(
      'CREATE (p:Project {name: $name, nessusFile: $nessusFile})',
      { name, nessusFile }
    );
    logToCSV(`Project created: ${name} with file reference: ${nessusFile}`);
    res.status(201).send('Project created');
  } catch (error) {
    console.error('Error creating project:', error);
    logToCSV(`Error creating project: ${name}, Error: ${error.message}`);
    res.status(500).send(error.message);
  }
});


// Add allowed IP to a project
app.post('/projects/:projectName/allowed-ip', async (req, res) => {
  const session = driver.session();
  const { projectName } = req.params;
  const { ip } = req.body;
  try {
    await session.run(
      'MATCH (p:Project {name: $projectName}) ' +
      'MERGE (p)-[:HAS_ALLOWED_IP]->(:IP {address: $ip})',
      { projectName, ip }
    );
    logToCSV(`Allowed IP added: ${ip} to project: ${projectName}`);
    res.status(201).send('Allowed IP added');
  } catch (error) {
    console.error('Error adding allowed IP:', error);
    logToCSV(
      `Error adding allowed IP: ${ip} to project: ${projectName}, Error: ${error.message}`
    );
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

// Add off-limit IP to a project
app.post('/projects/:projectName/off-limit-ip', async (req, res) => {
  const session = driver.session();
  const { projectName } = req.params;
  const { ip } = req.body;
  try {
    await session.run(
      'MATCH (p:Project {name: $projectName}) ' +
      'MERGE (p)-[:HAS_OFF_LIMIT_IP]->(:IP {address: $ip})',
      { projectName, ip }
    );
    logToCSV(`Off-limit IP added: ${ip} to project: ${projectName}`);
    res.status(201).send('Off-limit IP added');
  } catch (error) {
    console.error('Error adding off-limit IP:', error);
    logToCSV(
      `Error adding off-limit IP: ${ip} to project: ${projectName}, Error: ${error.message}`
    );
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

// Get IPs for a project
app.get('/projects/:projectName/ips', async (req, res) => {
  const session = driver.session();
  const { projectName } = req.params;
  try {
    const result = await session.run(
      `MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_IP|HAS_OFF_LIMIT_IP]->(ip:IP)
       RETURN id(ip) AS id, ip.address AS address, type(r) AS type`,
      { projectName }
    );
    const ips = result.records.map((record) => ({
      id: record.get('id').toNumber(),
      address: record.get('address'),
      type: record.get('type'),
    }));
    res.json(ips);
  } catch (error) {
    console.error('Error fetching IPs:', error);
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

// Add allowed exploit to a project
app.post('/projects/:projectName/allowed-exploit', async (req, res) => {
  const session = driver.session();
  const { projectName } = req.params;
  const { name } = req.body;
  try {
    await session.run(
      'MATCH (p:Project {name: $projectName}) ' +
      'MERGE (p)-[:HAS_ALLOWED_EXPLOIT]->(:Exploit {name: $name})',
      { projectName, name }
    );
    logToCSV(`Allowed exploit added: ${name} to project: ${projectName}`);
    res.status(201).send('Allowed exploit added');
  } catch (error) {
    console.error('Error adding allowed exploit:', error);
    logToCSV(`Error adding allowed exploit: ${name} to project: ${projectName}, Error: ${error.message}`);
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

// Add off-limit exploit to a project
app.post('/projects/:projectName/off-limit-exploit', async (req, res) => {
  const session = driver.session();
  const { projectName } = req.params;
  const { name } = req.body;
  try {
    await session.run(
      'MATCH (p:Project {name: $projectName}) ' +
      'MERGE (p)-[:HAS_OFF_LIMIT_EXPLOIT]->(:Exploit {name: $name})',
      { projectName, name }
    );
    logToCSV(`Off-limit exploit added: ${name} to project: ${projectName}`);
    res.status(201).send('Off-limit exploit added');
  } catch (error) {
    console.error('Error adding off-limit exploit:', error);
    logToCSV(`Error adding off-limit exploit: ${name} to project: ${projectName}, Error: ${error.message}`);
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

// Get exploits for a project
app.get('/projects/:projectName/exploits', async (req, res) => {
  const session = driver.session();
  const { projectName } = req.params;
  try {
    const result = await session.run(
      'MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_EXPLOIT|HAS_OFF_LIMIT_EXPLOIT]->(exploit:Exploit) ' +
      'RETURN exploit.name AS name, type(r) AS type, id(exploit) AS id',
      { projectName }
    );
    const exploits = result.records.map((record) => ({
      name: record.get('name'),
      id: record.get('id').toNumber(),
      type: record.get('type'),
    }));
    res.json(exploits);
  } catch (error) {
    console.error('Error fetching exploits:', error);
    res.status(500).send(error.message);
  } finally {
    await session.close();
  }
});

// Delete an IP from a project
app.delete('/projects/:projectName/ips/:ipId', async (req, res) => {
  const { projectName, ipId } = req.params;
  try {
    await session.run(
      `MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_IP|HAS_OFF_LIMIT_IP]->(ip:IP)
       WHERE id(ip) = $ipId
       DELETE r, ip`,
      { projectName, ipId: parseInt(ipId) }
    );
    res.status(200).send('IP deleted');
  } catch (error) {
    console.error('Error deleting IP:', error);
    res.status(500).send(error.message);
  } 
});

// Delete an exploit from a project
app.delete('/projects/:projectName/exploits/:exploitId', async (req, res) => {
  const { projectName, exploitId } = req.params;
  try {
    await session.run(
      `MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_EXPLOIT|HAS_OFF_LIMIT_EXPLOIT]->(e:Exploit)
       WHERE id(e) = $exploitId
       DELETE r, e`,
      { projectName, exploitId: parseInt(exploitId) }
    );
    res.status(200).send('Exploit deleted');
  } catch (error) {
    console.error('Error deleting exploit:', error);
    res.status(500).send(error.message);
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Explicitly set the port to 300 as you requested
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Gracefully close the driver connection on app termination
process.on('SIGTERM', () => {
  driver.close();
  process.exit(0);
});

module.exports = app;
