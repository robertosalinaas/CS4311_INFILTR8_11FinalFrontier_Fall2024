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

// Route for file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  logToCSV(`File uploaded: ${req.file.filename}`);

  console.log(`Current directory: ${__dirname}`);

  const pythonScriptPath = path.join(__dirname, 'process_nessus.py');
  console.log(`Looking for Python script at: ${pythonScriptPath}`);

  if (!fs.existsSync(pythonScriptPath)) {
    console.error(`Python script not found at ${pythonScriptPath}`);
    return res.status(500).json({
      filename: req.file.filename,
      message: 'File uploaded but Python script not found',
    });
  }

  const pythonProcess = spawn('python', [pythonScriptPath, req.file.filename]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python script output: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    if (code === 0) {
      const csvDir = path.join(__dirname, 'Process_5');
      fs.readdir(csvDir, (err, files) => {
        if (err) {
          console.error('Error reading CSV directory:', err);
          return res.status(500).json({
            filename: req.file.filename,
            message: 'File processed but error occurred while reading CSV files',
          });
        }
        const csvFiles = files.filter((file) => file.endsWith('.csv'));
        res.json({
          filename: req.file.filename,
          message: 'File uploaded and processed successfully',
          csvFiles: csvFiles,
        });
      });
    } else {
      res.status(500).json({
        filename: req.file.filename,
        message: 'File uploaded but processing failed',
      });
    }
  });
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
  try {
    const result = await session.run('MATCH (p:Project) RETURN p.name AS name');
    const projects = result.records.map((record) => record.get('name'));
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).send(error.message);
  }
});

// Create a new project
app.post('/projects', async (req, res) => {
  const { name } = req.body;
  try {
    await session.run('CREATE (p:Project {name: $name})', { name });
    logToCSV(`Project created: ${name}`);
    res.status(201).send('Project created');
  } catch (error) {
    console.error('Error creating project:', error);
    logToCSV(`Error creating project: ${name}, Error: ${error.message}`);
    res.status(500).send(error.message);
  }
});

// Add allowed IP to a project
app.post('/projects/:projectName/allowed-ip', async (req, res) => {
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
  }
});

// Add off-limit IP to a project
app.post('/projects/:projectName/off-limit-ip', async (req, res) => {
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
  }
});

// Get IPs for a project
app.get('/projects/:projectName/ips', async (req, res) => {
  const { projectName } = req.params;
  console.log(`Fetching IPs for project: ${projectName}`);
  try {
    const result = await session.run(
      'MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_IP|HAS_OFF_LIMIT_IP]->(ip:IP) ' +
        'RETURN ip.address AS address, type(r) AS type',
      { projectName }
    );
    const ips = result.records.map((record) => ({
      address: record.get('address'),
      type: record.get('type'),
    }));
    res.json(ips);
  } catch (error) {
    console.error('Error fetching IPs:', error);
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
