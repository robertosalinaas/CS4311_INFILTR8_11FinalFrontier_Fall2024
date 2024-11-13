const express = require('express');
const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const logger = require('morgan');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();

// Middleware
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

// Ensure Admin User Exists
async function ensureAdminUser() {
  try {
    const adminCheckQuery = `MATCH (u:User {username: 'admin'}) RETURN u`;
    const result = await session.run(adminCheckQuery);

    if (result.records.length === 0) {
      const createAdminQuery = `
        CREATE (u:User {username: 'admin', password: 'admin', role: 'admin', createdAt: timestamp()})
      `;
      await session.run(createAdminQuery);
      console.log('Default admin user created (username: admin, password: admin).');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error ensuring admin user:', error);
  }
}

// Routes

// Login ADMIN route
app.post('/api/admin_login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const query = `
        MATCH (u:User {username: $username, password: $password})
        RETURN u
      `;
      const result = await session.run(query, { username, password });
  
      if (result.records.length > 0) {
        const user = result.records[0].get('u').properties;
  
        // Check if the user is an admin
        if (user.role === 'admin') {
          return res.status(200).json({ message: 'Login successful', user });
        } else {
          return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });





////////////////////////////////////////////////////////////
// login USER route
app.post('/api/user/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      // Check user credentials and create session
      const query = `
          MATCH (u:User {username: $username, password: $password})
          CREATE (s:Session {
              sessionId: randomUUID(),
              createdAt: timestamp(),
              lastActive: timestamp()
          })
          CREATE (u)-[:HAS_SESSION]->(s)
          RETURN u, s
      `;
      const result = await session.run(query, { username, password });

      if (result.records.length > 0) {
          const user = result.records[0].get('u').properties;
          const userSession = result.records[0].get('s').properties;

          // Remove sensitive data
          delete user.password;

          res.status(200).json({ 
              message: 'Login successful',
              user,
              sessionId: userSession.sessionId
          });
      } else {
          res.status(401).json({ message: 'Invalid credentials' });
      }
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Check authentication status
app.get('/api/auth/status', async (req, res) => {
  const sessionId = req.headers.authorization;

  if (!sessionId) {
      return res.status(401).json({ isAuthenticated: false });
  }

  try {
      const query = `
          MATCH (s:Session {sessionId: $sessionId})<-[:HAS_SESSION]-(u:User)
          SET s.lastActive = timestamp()
          RETURN u
      `;
      const result = await session.run(query, { sessionId });

      if (result.records.length > 0) {
          const user = result.records[0].get('u').properties;
          delete user.password;
          res.json({ 
              isAuthenticated: true, 
              user 
          });
      } else {
          res.json({ isAuthenticated: false });
      }
  } catch (error) {
      console.error('Error checking session:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
app.post('/api/auth/logout', async (req, res) => {
  const sessionId = req.headers.authorization;

  if (!sessionId) {
      return res.status(400).json({ error: 'No session ID provided' });
  }

  try {
      const query = `
          MATCH (s:Session {sessionId: $sessionId})
          DETACH DELETE s
      `;
      await session.run(query, { sessionId });
      res.json({ message: 'Logout successful' });
  } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Authentication middleware
const checkAuth = async (req, res, next) => {
  const sessionId = req.headers.authorization;

  if (!sessionId) {
      return res.status(401).json({ error: 'No session ID provided' });
  }

  try {
      const query = `
          MATCH (s:Session {sessionId: $sessionId})<-[:HAS_SESSION]-(u:User)
          SET s.lastActive = timestamp()
          RETURN u
      `;
      const result = await session.run(query, { sessionId });

      if (result.records.length > 0) {
          req.user = result.records[0].get('u').properties;
          next();
      } else {
          res.status(401).json({ error: 'Invalid session' });
      }
  } catch (error) {
      console.error('Error checking authentication:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};
////////////////////////////////////////////////////////////  






////////////////////////////////////////////////////////////
// Project Management Routes
// Get all projects for authenticated user
app.get('/api/projects/reports', checkAuth, async (req, res) => {
  const username = req.user.username;

  try {
      const result = await session.run(
          `
          MATCH (u:User {username: $username})-[:OWNS]->(p:Project)
          OPTIONAL MATCH (p)-[:HAS_REPORT]->(r:Report)
          WITH p, r
          ORDER BY r.createdAt DESC
          WITH p, collect(DISTINCT r) as allReports
          WITH p,
               p.processedDate as processedDate,
               [r in allReports WHERE r.type CONTAINS 'PDF'][0] as pdfReport
          WHERE pdfReport IS NOT NULL
          RETURN {
              id: p.id,
              name: p.name,
              processedDate: processedDate,
              reports: CASE 
                  WHEN pdfReport IS NOT NULL 
                  THEN [{
                      id: pdfReport.id,
                      filename: pdfReport.filename,
                      type: pdfReport.type,
                      createdAt: pdfReport.createdAt,
                      path: pdfReport.path
                  }]
                  ELSE []
              END
          } as project
          ORDER BY processedDate DESC
          `,
          { username }
      );

      const projects = result.records.map(record => {
          const project = record.get('project');
          // Verify we only have one report per type
          const reportTypes = new Set(project.reports.map(r => r.type));
          console.log(`Project ${project.name} has report types:`, reportTypes);
          
          return {
              ...project,
              reports: project.reports.filter((report, index, self) => 
                  index === self.findIndex(r => r.type === report.type)
              )
          };
      });

      console.log('Final processed projects:', JSON.stringify(projects, null, 2));
      res.json(projects);
  } catch (error) {
      console.error('Error fetching projects with reports:', error);
      res.status(500).json({ error: 'Error fetching projects with reports' });
  }
});

//Get all projects
// Get all projects for authenticated user
app.get('/api/projects', checkAuth, async (req, res) => {
  const username = req.user.username;
  
  try {
      const result = await session.run(
          `
          MATCH (u:User {username: $username})-[:OWNS]->(p:Project)
          OPTIONAL MATCH (p)-[:HAS_SCOPE_IP]->(si:IP)
          OPTIONAL MATCH (p)-[:HAS_OFF_LIMIT_IP]->(oi:IP)
          OPTIONAL MATCH (p)-[:ALLOWS_EXPLOIT]->(e:Exploit)
          RETURN p,
                 collect(DISTINCT si) as scopeIPs,
                 collect(DISTINCT oi) as offLimitIPs,
                 collect(DISTINCT e) as allowedExploits
          `,
          { username }
      );

      const projects = result.records.map(record => {
          const project = record.get('p').properties;
          const scopeIPs = record.get('scopeIPs').map(ip => ip.properties);
          const offLimitIPs = record.get('offLimitIPs').map(ip => ip.properties);
          const allowedExploits = record.get('allowedExploits').map(exploit => exploit.properties);

          return {
              ...project,
              scopeIPs: scopeIPs,
              offLimitIPs: offLimitIPs,
              allowedExploits: allowedExploits
          };
      });

      res.json(projects);
  } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Error fetching projects' });
  }
});

// Get single project
app.get('/api/projects/:id', checkAuth, async (req, res) => {
  try {
      const username = req.user.username;
      const projectId = req.params.id;

      const query = `
          MATCH (u:User {username: $username})-[:OWNS]->(p:Project {id: $projectId})
          OPTIONAL MATCH (p)-[:HAS_SCOPE_IP]->(si:IP)
          OPTIONAL MATCH (p)-[:HAS_OFF_LIMIT_IP]->(oi:IP)
          OPTIONAL MATCH (p)-[:ALLOWS_EXPLOIT]->(e:Exploit)
          RETURN p,
                 collect(DISTINCT si) as scopeIPs,
                 collect(DISTINCT oi) as offLimitIPs,
                 collect(DISTINCT e) as allowedExploits
      `;
      const result = await session.run(query, { username, projectId });

      if (result.records.length === 0) {
          return res.status(404).json({ error: 'Project not found or access denied' });
      }

      const record = result.records[0];
      const project = record.get('p').properties;
      const response = {
          id: project.id,
          name: project.name,
          scopeIPs: record.get('scopeIPs').map(ip => ip.properties),
          offLimitIPs: record.get('offLimitIPs').map(ip => ip.properties),
          allowedExploits: record.get('allowedExploits').map(exploit => exploit.properties)
      };

      res.json(response);
  } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project
app.post('/api/projects', checkAuth, async (req, res) => {
  const { name, scopeIPs, offLimitIPs, allowedExploits } = req.body;
  const projectId = uuidv4();

  try {
      const username = req.user.username; // Get the authenticated user's username

      // Create project node and establish ownership
      await session.run(
          `
          MATCH (u:User {username: $username})
          CREATE (p:Project {
              id: $projectId,
              name: $name,
              createdAt: timestamp()
          })
          CREATE (u)-[:OWNS]->(p)
          RETURN p
          `,
          {
              projectId,
              name,
              username
          }
      );

      // Add scope IPs
      if (scopeIPs && scopeIPs.length > 0) {
          await session.run(
              `
              MATCH (p:Project {id: $projectId})
              UNWIND $ips as ip
              CREATE (i:IP {
                  id: ip.id,
                  address: ip.address,
                  type: 'scope'
              })
              CREATE (p)-[:HAS_SCOPE_IP]->(i)
              `,
              {
                  projectId,
                  ips: scopeIPs.map(ip => ({
                      id: uuidv4(),
                      address: ip.address
                  }))
              }
          );
      }

      // Add off-limit IPs
      if (offLimitIPs && offLimitIPs.length > 0) {
          await session.run(
              `
              MATCH (p:Project {id: $projectId})
              UNWIND $ips as ip
              CREATE (i:IP {
                  id: ip.id,
                  address: ip.address,
                  type: 'off-limit'
              })
              CREATE (p)-[:HAS_OFF_LIMIT_IP]->(i)
              `,
              {
                  projectId,
                  ips: offLimitIPs.map(ip => ({
                      id: uuidv4(),
                      address: ip.address
                  }))
              }
          );
      }

      // Add allowed exploits
      if (allowedExploits && allowedExploits.length > 0) {
          await session.run(
              `
              MATCH (p:Project {id: $projectId})
              UNWIND $exploits as exploit
              CREATE (e:Exploit {
                  id: exploit.id,
                  name: exploit.name,
                  type: 'allowed'
              })
              CREATE (p)-[:ALLOWS_EXPLOIT]->(e)
              `,
              {
                  projectId,
                  exploits: allowedExploits.map(exploit => ({
                      id: uuidv4(),
                      name: exploit.name
                  }))
              }
          );
      }

      // Return the complete project data
      const projectData = await session.run(
          `
          MATCH (p:Project {id: $projectId})
          OPTIONAL MATCH (p)-[:HAS_SCOPE_IP]->(si:IP)
          OPTIONAL MATCH (p)-[:HAS_OFF_LIMIT_IP]->(oi:IP)
          OPTIONAL MATCH (p)-[:ALLOWS_EXPLOIT]->(e:Exploit)
          RETURN p,
                 collect(DISTINCT si) as scopeIPs,
                 collect(DISTINCT oi) as offLimitIPs,
                 collect(DISTINCT e) as allowedExploits
          `,
          { projectId }
      );

      const record = projectData.records[0];
      const response = {
          id: record.get('p').properties.id,
          name: record.get('p').properties.name,
          scopeIPs: record.get('scopeIPs').map(ip => ip.properties),
          offLimitIPs: record.get('offLimitIPs').map(ip => ip.properties),
          allowedExploits: record.get('allowedExploits').map(exploit => exploit.properties)
      };

      res.status(201).json(response);
  } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});



// Delete project
app.delete('/api/projects/:id', checkAuth, async (req, res) => {
  try {
      const username = req.user.username;
      const projectId = req.params.id;

      // Verify ownership
      const ownershipCheck = await session.run(
          `
          MATCH (u:User {username: $username})-[:OWNS]->(p:Project {id: $projectId})
          RETURN p
          `,
          { username, projectId }
      );

      if (ownershipCheck.records.length === 0) {
          return res.status(403).json({ error: 'Forbidden' });
      }

      // Delete project
      await session.run(
          `
          MATCH (p:Project {id: $projectId})
          OPTIONAL MATCH (p)-[:HAS_SCOPE_IP]->(si:IP)
          OPTIONAL MATCH (p)-[:HAS_OFF_LIMIT_IP]->(oi:IP)
          OPTIONAL MATCH (p)-[:ALLOWS_EXPLOIT]->(e:Exploit)
          DETACH DELETE p, si, oi, e
          `,
          { projectId }
      );
      res.status(204).send();
  } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
app.put('/api/projects/:id', checkAuth, async (req, res) => {
  const { name, scopeIPs, offLimitIPs, allowedExploits } = req.body;
  const projectId = req.params.id;

  try {
      const username = req.user.username;

      // Verify ownership
      const ownershipCheck = await session.run(
          `
          MATCH (u:User {username: $username})-[:OWNS]->(p:Project {id: $projectId})
          RETURN p
          `,
          { username, projectId }
      );

      if (ownershipCheck.records.length === 0) {
          return res.status(403).json({ error: 'Forbidden' });
      }

      // Update project name
      await session.run(
          `
          MATCH (p:Project {id: $projectId})
          SET p.name = $name
          `,
          { projectId, name }
      );

      // Remove existing IPs and exploits
      await session.run(
          `
          MATCH (p:Project {id: $projectId})
          OPTIONAL MATCH (p)-[:HAS_SCOPE_IP]->(si:IP)
          OPTIONAL MATCH (p)-[:HAS_OFF_LIMIT_IP]->(oi:IP)
          OPTIONAL MATCH (p)-[:ALLOWS_EXPLOIT]->(e:Exploit)
          DETACH DELETE si, oi, e
          `,
          { projectId }
      );

      // Re-add IPs and exploits
      // ... (same logic as in the POST route)

      // Return updated project
      const updatedProject = await session.run(
          `
          MATCH (p:Project {id: $projectId})
          OPTIONAL MATCH (p)-[:HAS_SCOPE_IP]->(si:IP)
          OPTIONAL MATCH (p)-[:HAS_OFF_LIMIT_IP]->(oi:IP)
          OPTIONAL MATCH (p)-[:ALLOWS_EXPLOIT]->(e:Exploit)
          RETURN p,
                 collect(DISTINCT si) as scopeIPs,
                 collect(DISTINCT oi) as offLimitIPs,
                 collect(DISTINCT e) as allowedExploits
          `,
          { projectId }
      );

      const project = updatedProject.records[0];
      const response = {
          id: project.get('p').properties.id,
          name: project.get('p').properties.name,
          scopeIPs: project.get('scopeIPs').map(ip => ip.properties),
          offLimitIPs: project.get('offLimitIPs').map(ip => ip.properties),
          allowedExploits: project.get('allowedExploits').map(exploit => exploit.properties)
      };

      res.json(response);
  } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

////////////////////////////////////////////////////////////  






////////////////////////////////////////////////////////////  
// python stuff
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
  }
});

const upload = multer({ storage: storage });

// Route to upload a Nessus file and process it
app.post('/upload', checkAuth, upload.single('file'), async (req, res) => {
  const { projectId } = req.body;
  const username = req.user.username;

  if (!projectId || !req.file) {
      return res.status(400).send('Project ID and file are required.');
  }

  try {
      // Verify project ownership
      const ownershipCheck = await session.run(
          `
          MATCH (u:User {username: $username})-[:OWNS]->(p:Project {id: $projectId})
          RETURN p
          `,
          { username, projectId }
      );

      if (ownershipCheck.records.length === 0) {
          return res.status(403).json({ error: 'Project not found or access denied' });
      }

      const pythonScriptPath = path.join(__dirname, 'process_nessus.py');
      const csvDirectoryPath = path.join(__dirname, 'Process_5');

      const pythonProcess = spawn('python', [
          pythonScriptPath,
          req.file.filename
      ]);

// In your upload endpoint, after Python process completes:
pythonProcess.on('close', async (code) => {
  if (code !== 0) {
      return res.status(500).send('Error processing file');
  }

  try {
      // First, run generate_report.py to create the PDF
      const reportProcess = spawn('python', [
          path.join(__dirname, 'generate_report.py')
      ]);

      reportProcess.on('close', async (reportCode) => {
          if (reportCode !== 0) {
              console.error('Error generating PDF report');
          }

          // Read CSV files and create Report nodes
          const files = await fs.promises.readdir(csvDirectoryPath);
          const csvFiles = files.filter((file) => file.endsWith('.csv'));
          
          // Create Report nodes for each CSV file and PDF
          for (const csvFile of csvFiles) {
              const reportId = uuidv4();
              await session.run(
                  `
                  MATCH (p:Project {id: $projectId})
                  CREATE (r:Report {
                      id: $reportId,
                      filename: $filename,
                      type: 'Nessus CSV Report',
                      createdAt: toString(datetime().epochMillis),
                      path: $path
                  })
                  CREATE (p)-[:HAS_REPORT]->(r)
                  SET p.processedDate = toString(datetime().epochMillis)
                  RETURN r
                  `,
                  {
                      projectId,
                      reportId,
                      filename: csvFile,
                      path: path.join(csvDirectoryPath, csvFile)
                  }
              );
          }

          // Create a Report node for the PDF
          const pdfReportId = uuidv4();
          const pdfPath = path.join(__dirname, 'Human_Readable_CSV_Report.pdf');
          if (fs.existsSync(pdfPath)) {
              await session.run(
                  `
                  MATCH (p:Project {id: $projectId})
                  CREATE (r:Report {
                      id: $reportId,
                      filename: 'Human_Readable_CSV_Report.pdf',
                      type: 'Nessus PDF Report',
                      createdAt: toString(datetime().epochMillis),
                      path: $path
                  })
                  CREATE (p)-[:HAS_REPORT]->(r)
                  RETURN r
                  `,
                  {
                      projectId,
                      reportId: pdfReportId,
                      path: pdfPath
                  }
              );
          }

          res.json({
              message: 'File uploaded and processed successfully',
              csvFiles: [...csvFiles, 'Human_Readable_CSV_Report.pdf']
          });
      });

      reportProcess.stderr.on('data', (data) => {
          console.error(`PDF Generation Error: ${data}`);
      });

  } catch (error) {
      console.error('Error creating report nodes:', error);
      res.status(500).send('Error creating report nodes');
  }
});

      pythonProcess.stderr.on('data', (data) => {
          console.error(`Python Error: ${data}`);
      });
  } catch (error) {
      console.error('Error in upload:', error);
      res.status(500).send('Error in upload process');
  }
});

// Backend route
// Route to download report files
// Route to download processed CSV files
app.get('/download/:filename', checkAuth, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, filename.endsWith('.pdf') ? '' : 'Process_5', filename);

  // Basic security check to prevent directory traversal
  if (!filename.endsWith('.csv') && !filename.endsWith('.pdf')) {
      return res.status(403).json({ error: 'Invalid file type' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, filename, (err) => {
      if (err) {
          console.error('Error downloading file:', err);
          res.status(500).send('Error downloading file');
      }
  });
});

// Keep your existing report download endpoint for the reports page
app.get('/reports/download/:reportId', checkAuth, async (req, res) => {
  const username = req.user.username;
  const reportId = req.params.reportId;
  
  try {
      console.log('Download request for reportId:', reportId); // Debug log

      const result = await session.run(
          `
          MATCH (u:User {username: $username})-[:OWNS]->(p:Project)-[:HAS_REPORT]->(r:Report {id: $reportId})
          RETURN r.filename as filename, r.path as path, r.type as type
          `,
          { username, reportId }
      );

      console.log('Query result:', result.records); // Debug log

      if (result.records.length === 0) {
          return res.status(404).json({ error: 'Report not found or access denied' });
      }

      const record = result.records[0];
      const filePath = record.get('path');
      const filename = record.get('filename');
      const fileType = record.get('type');

      console.log('File details:', { filePath, filename, fileType }); // Debug log

      // Check if file exists
      if (!fs.existsSync(filePath)) {
          console.error('File not found at path:', filePath);
          return res.status(404).json({ error: 'File not found on server' });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', fileType.includes('PDF') ? 'application/pdf' : 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Stream the file instead of loading it all at once
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
          console.error('Error streaming file:', error);
          if (!res.headersSent) {
              res.status(500).json({ error: 'Error downloading file' });
          }
      });

  } catch (error) {
      console.error('Error in download endpoint:', error);
      res.status(500).json({ error: 'Error processing download request' });
  }
});



////////////////////////////////////////////////////////////





// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const query = `MATCH (u:User) RETURN u`;
    const result = await session.run(query);

    const users = result.records.map((record) => record.get('u').properties);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a user
app.post('/api/users', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'All fields are required (username, password, role).' });
  }

  try {
    const query = `
      CREATE (u:User {username: $username, password: $password, role: $role, createdAt: timestamp()})
      RETURN u
    `;
    const result = await session.run(query, { username, password, role });

    const user = result.records[0]?.get('u').properties;

    if (user) {
      res.status(201).json({ message: 'User created successfully', user });
    } else {
      res.status(500).json({ error: 'Failed to create user.' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user
app.delete('/api/users/:username', async (req, res) => {
  const username = req.params.username;

  try {
      // First, delete all relationships and then delete the user node
      await session.run(
          `
          MATCH (u:User {username: $username})
          OPTIONAL MATCH (u)-[r]-()
          DELETE r
          WITH u
          DELETE u
          `,
          { username }
      );

      res.json({ message: 'User deleted successfully' });
  } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await ensureAdminUser(); // Ensure admin user exists on startup
});

// Gracefully close Neo4j driver connection
process.on('SIGTERM', () => {
  driver.close();
  console.log('Neo4j connection closed.');
  process.exit(0);
});

module.exports = app;
