import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import neo4j from 'neo4j-driver';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logToCSV } from './log.js';
import multer from 'multer';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
const session = driver.session();

const port = 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, 'nessus_datasets');
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });

// // New route for file upload
// app.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }
//     logToCSV(`File uploaded: ${req.file.filename}`);
//     res.json({ filename: req.file.filename });
// });

// New route for file upload
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
        message: 'File uploaded but Python script not found'
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
              message: 'File processed but error occurred while reading CSV files'
            });
          }
          const csvFiles = files.filter(file => file.endsWith('.csv'));
          res.json({ 
            filename: req.file.filename,
            message: 'File uploaded and processed successfully',
            csvFiles: csvFiles
          });
        });
      } else {
        res.status(500).json({
          filename: req.file.filename,
          message: 'File uploaded but processing failed'
        });
      }
    });
  });
  
  // Add a new route to download CSV files
  app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'Process_5', filename);
    res.download(filePath, (err) => {
      if (err) {
        res.status(500).send('Error downloading file');
      }
    });
  });

app.get('/', async function (req, res) {
    try {
        let movieResult = await session.run('MATCH (m:Movie) RETURN m');
        let movies = movieResult.records.map(record => record.get('m').properties);

        let actorResult = await session.run('MATCH (a:Actor) RETURN a');
        let actors = actorResult.records.map(record => record.get('a').properties);

        res.render('index', { movies: movies, actors: actors });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/projects', async (req, res) => {
    try {
        const result = await session.run('MATCH (p:Project) RETURN p.name AS name');
        const projects = result.records.map(record => record.get('name'));
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send(error.message);
    }
});

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
        logToCSV(`Error adding allowed IP: ${ip} to project: ${projectName}, Error: ${error.message}`);
        res.status(500).send(error.message);
    }
});

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
        logToCSV(`Error adding off-limit IP: ${ip} to project: ${projectName}, Error: ${error.message}`);
        res.status(500).send(error.message);
    }
});

app.get('/projects/:projectName/ips', async (req, res) => {
    const { projectName } = req.params;
    console.log(`Fetching IPs for project: ${projectName}`);
    try {
        const result = await session.run(
            'MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_IP|HAS_OFF_LIMIT_IP]->(ip:IP) ' +
            'RETURN ip.address AS address, type(r) AS type',
            { projectName }
        );
        const ips = result.records.map(record => ({
            address: record.get('address'),
            type: record.get('type')
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export default app;


// var express = require("express");
// var path = require("path");
// var logger = require("morgan");
// var bodyParser = require("body-parser");
// var neo4j = require('neo4j-driver');
// var cors = require('cors');

// var app = express();

// app.use(cors());

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

// var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
// var session = driver.session();

// const port = 3000;

// app.get('/', async function (req, res) {
//     try {
//         let movieResult = await session.run('MATCH (m:Movie) RETURN m');
//         let movies = movieResult.records.map(record => record.get('m').properties);

//         let actorResult = await session.run('MATCH (a:Actor) RETURN a');
//         let actors = actorResult.records.map(record => record.get('a').properties);

//         res.render('index', { movies: movies, actors: actors });
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         res.status(500).send('Error fetching data');
//     }
// });

// app.get('/projects', async (req, res) => {
//     try {
//         const result = await session.run('MATCH (p:Project) RETURN p.name AS name');
//         const projects = result.records.map(record => record.get('name'));
//         res.json(projects);
//     } catch (error) {
//         console.error('Error fetching projects:', error);
//         res.status(500).send(error.message);
//     }
// });

// app.post('/projects', async (req, res) => {
//     const { name } = req.body;
//     try {
//         await session.run('CREATE (p:Project {name: $name})', { name });
//         res.status(201).send('Project created');
//     } catch (error) {
//         console.error('Error creating project:', error);
//         res.status(500).send(error.message);
//     }
// });

// app.post('/projects/:projectName/allowed-ip', async (req, res) => {
//     const { projectName } = req.params;
//     const { ip } = req.body;
//     try {
//         await session.run(
//             'MATCH (p:Project {name: $projectName}) ' +
//             'MERGE (p)-[:HAS_ALLOWED_IP]->(:IP {address: $ip})',
//             { projectName, ip }
//         );
//         res.status(201).send('Allowed IP added');
//     } catch (error) {
//         console.error('Error adding allowed IP:', error);
//         res.status(500).send(error.message);
//     }
// });

// app.post('/projects/:projectName/off-limit-ip', async (req, res) => {
//     const { projectName } = req.params;
//     const { ip } = req.body;
//     try {
//         await session.run(
//             'MATCH (p:Project {name: $projectName}) ' +
//             'MERGE (p)-[:HAS_OFF_LIMIT_IP]->(:IP {address: $ip})',
//             { projectName, ip }
//         );
//         res.status(201).send('Off-limit IP added');
//     } catch (error) {
//         console.error('Error adding off-limit IP:', error);
//         res.status(500).send(error.message);
//     }
// });

// app.get('/projects/:projectName/ips', async (req, res) => {
//     const { projectName } = req.params;
//     console.log(`Fetching IPs for project: ${projectName}`);
//     try {
//         const result = await session.run(
//             'MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_IP|HAS_OFF_LIMIT_IP]->(ip:IP) ' +
//             'RETURN ip.address AS address, type(r) AS type',
//             { projectName }
//         );
//         const ips = result.records.map(record => ({
//             address: record.get('address'),
//             type: record.get('type')
//         }));
//         res.json(ips);
//     } catch (error) {
//         console.error('Error fetching IPs:', error);
//         res.status(500).send(error.message);
//     }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });

// module.exports = app;


// // var express = require("express");
// // var path = require("path");
// // var logger = require("morgan");
// // var bodyParser = require("body-parser");
// // var neo4j = require('neo4j-driver');
// // var cors = require('cors'); // Add this line

// // var app = express();

// // app.use(cors()); // Add this line

// // app.set('views', path.join(__dirname, 'views'));
// // app.set('view engine', 'ejs');

// // app.use(logger('dev'));
// // app.use(bodyParser.json());
// // app.use(bodyParser.urlencoded({ extended: false }));
// // app.use(express.static(path.join(__dirname, 'public')));

// // var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
// // var session = driver.session();

// // const port = 3000; // Ensure this line is present

// // app.get('/', async function (req, res) {
// //     try {
// //         // Fetch movies
// //         let movieResult = await session.run('MATCH (m:Movie) RETURN m');
// //         let movies = movieResult.records.map(record => record.get('m').properties);

// //         // Fetch actors
// //         let actorResult = await session.run('MATCH (a:Actor) RETURN a');
// //         let actors = actorResult.records.map(record => record.get('a').properties);

// //         // Render the template with the fetched data
// //         res.render('index', { movies: movies, actors: actors });
// //     } catch (error) {
// //         console.error('Error fetching data:', error);
// //         res.send('Error fetching data');
// //         res.status(500).send(error);
// //     }
// // });

// // app.get('/projects', async (req, res) => {
// //     try {
// //         const result = await session.run('MATCH (p:Project) RETURN p.name AS name');
// //         const projects = result.records.map(record => record.get('name'));
// //         res.json(projects);
// //     } catch (error) {
// //         console.error('Error fetching projects:', error);
// //         res.status(500).send(error.message);
// //     }
// // });

// // app.post('/projects', async (req, res) => {
// //     const { name } = req.body;
// //     try {
// //         await session.run('CREATE (p:Project {name: $name})', { name });
// //         res.status(201).send('Project created');
// //     } catch (error) {
// //         console.error('Error creating project:', error);
// //         res.status(500).send(error.message);
// //     }
// // });

// // // Route to add a movie
// // app.post('/movie', function (req, res) {
// //     var title = req.body.title;
// //     console.log('POST /movie', title);
// //     session.run('CREATE (m:Movie {title: $title}) RETURN m', { title: title })
// //         .then(function (result) {
// //             console.log('Movie created:', result.records[0].get('m'));
// //             res.send(result.records[0].get('m'));
// //         })
// //         .catch(function (error) {
// //             console.error('Error creating movie:', error);
// //             res.status(500).send(error);
// //         });
// // });

// // // Route to get all IPs for a project
// // app.get('/projects/:projectName/ips', async (req, res) => {
// //     const { projectName } = req.params;
// //     try {
// //         const result = await session.run(
// //             'MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_IP|HAS_OFF_LIMIT_IP]->(ip:IP) ' +
// //             'RETURN ip.address AS address, type(r) AS type',
// //             { projectName }
// //         );
// //         const ips = result.records.map(record => ({
// //             address: record.get('address'),
// //             type: record.get('type')
// //         }));
// //         res.json(ips);
// //     } catch (error) {
// //         console.error('Error fetching IPs:', error);
// //         res.status(500).send(error.message);
// //     }
// // });

// // // Route to add an allowed IP to a project
// // app.post('/projects/:projectName/allowed-ip', async (req, res) => {
// //     const { projectName } = req.params;
// //     const { ip } = req.body;
// //     try {
// //         await session.run(
// //             'MATCH (p:Project {name: $projectName}) ' +
// //             'MERGE (p)-[:HAS_ALLOWED_IP]->(:IP {address: $ip})',
// //             { projectName, ip }
// //         );
// //         res.status(201).send('Allowed IP added');
// //     } catch (error) {
// //         console.error('Error adding allowed IP:', error);
// //         res.status(500).send(error.message);
// //     }
// // });

// // // Route to add an off-limit IP to a project
// // app.post('/projects/:projectName/off-limit-ip', async (req, res) => {
// //     const { projectName } = req.params;
// //     const { ip } = req.body;
// //     try {
// //         await session.run(
// //             'MATCH (p:Project {name: $projectName}) ' +
// //             'MERGE (p)-[:HAS_OFF_LIMIT_IP]->(:IP {address: $ip})',
// //             { projectName, ip }
// //         );
// //         res.status(201).send('Off-limit IP added');
// //     } catch (error) {
// //         console.error('Error adding off-limit IP:', error);
// //         res.status(500).send(error.message);
// //     }
// // });

// // // Route to get all IPs for a project
// // app.get('/projects/:projectName/ips', async (req, res) => {
// //     const { projectName } = req.params;
// //     try {
// //         const result = await session.run(
// //             'MATCH (p:Project {name: $projectName})-[r:HAS_ALLOWED_IP|HAS_OFF_LIMIT_IP]->(ip:IP) ' +
// //             'RETURN ip.address AS address, type(r) AS type',
// //             { projectName }
// //         );
// //         const ips = result.records.map(record => ({
// //             address: record.get('address'),
// //             type: record.get('type')
// //         }));
// //         res.json(ips);
// //     } catch (error) {
// //         console.error('Error fetching IPs:', error);
// //         res.status(500).send(error.message);
// //     }
// // });

// // // Route to add an actor
// // app.post('/actor', function (req, res) {
// //     var name = req.body.name;
// //     console.log('POST /actor', name);
// //     session.run('CREATE (a:Actor {name: $name}) RETURN a', { name: name })
// //         .then(function (result) {
// //             console.log('Actor created:', result.records[0].get('a'));
// //             res.send(result.records[0].get('a'));
// //         })
// //         .catch(function (error) {
// //             console.error('Error creating actor:', error);
// //             res.status(500).send(error);
// //         });
// // });

// // // Route to create ACTED_IN relationship
// // app.post('/acted_in', function (req, res) {
// //     var actorName = req.body.actorName;
// //     var movieTitle = req.body.movieTitle;
// //     console.log('POST /acted_in', actorName, movieTitle);
// //     session.run('MATCH (a:Actor {name: $actorName}), (m:Movie {title: $movieTitle}) CREATE (a)-[:ACTED_IN]->(m) RETURN a, m', { actorName: actorName, movieTitle: movieTitle })
// //         .then(function (result) {
// //             console.log('Relationship created:', result.records);
// //             res.send(result.records);
// //         })
// //         .catch(function (error) {
// //             console.error('Error creating relationship:', error);
// //             res.status(500).send(error);
// //         });
// // });

// // app.listen(port, function() {
// //     console.log(`Server running at http://localhost:${port}`);
// // });

// // module.exports = app;



// // // var express = require("express");
// // // var path = require("path");
// // // var logger = require("morgan");
// // // var bodyParser = require("body-parser");
// // // var neo4j = require('neo4j-driver');
// // // var cors = require('cors'); // Add this line

// // // var app = express();

// // // app.use(cors()); // Add this line

// // // app.set('views', path.join(__dirname, 'views'));
// // // app.set('view engine', 'ejs');

// // // app.use(logger('dev'));
// // // app.use(bodyParser.json());
// // // app.use(bodyParser.urlencoded({ extended: false }));
// // // app.use(express.static(path.join(__dirname, 'public')));

// // // var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
// // // var session = driver.session();

// // // const port = 3000; 

// // // // app.get('/', function (req, res) {
// // // //     res.send('hello world');
// // // //     console.log('GET /');
// // // // });

// // // app.get('/', async function (req, res) {
// // //     try {
// // //         // Fetch movies
// // //         let movieResult = await session.run('MATCH (m:Movie) RETURN m');
// // //         let movies = movieResult.records.map(record => record.get('m').properties);

// // //         // Fetch actors
// // //         let actorResult = await session.run('MATCH (a:Actor) RETURN a');
// // //         let actors = actorResult.records.map(record => record.get('a').properties);

// // //         // Render the template with the fetched data
// // //         res.render('index', { movies: movies, actors: actors });
// // //     } catch (error) {
// // //         console.error('Error fetching data:', error);
// // //         res.send('Error fetching data');
// // //         res.status(500).send(error);
// // //     }
// // // });


// // // app.get('/projects', async (req, res) => {
// // //     try {
// // //       const result = await session.run('MATCH (p:Project) RETURN p.name AS name');
// // //       const projects = result.records.map(record => record.get('name'));
// // //       res.json(projects);
// // //     } catch (error) {
// // //       res.status(500).send(error.message);
// // //     }
// // //   });
  
// // //   app.post('/projects', async (req, res) => {
// // //     const { name } = req.body;
// // //     try {
// // //       await session.run('CREATE (p:Project {name: $name})', { name });
// // //       res.status(201).send('Project created');
// // //     } catch (error) {
// // //       res.status(500).send(error.message);
// // //     }
// // //   });
  
// // //   app.listen(port, () => {
// // //     console.log(`Server running at http://localhost:${port}`);
// // //   });



// // // // Route to add a movie
// // // app.post('/movie', function (req, res) {
// // //     var title = req.body.title;
// // //     console.log('POST /movie', title);
// // //     session.run('CREATE (m:Movie {title: $title}) RETURN m', { title: title })
// // //         .then(function (result) {
// // //             console.log('Movie created:', result.records.get('m'));
// // //             res.send(result.records.get('m'));
// // //         })
// // //         .catch(function (error) {
// // //             console.error('Error creating movie:', error);
// // //             res.status(500).send(error);
// // //         });
// // // });

// // // // Route to add an actor
// // // app.post('/actor', function (req, res) {
// // //     var name = req.body.name;
// // //     console.log('POST /actor', name);
// // //     session.run('CREATE (a:Actor {name: $name}) RETURN a', { name: name })
// // //         .then(function (result) {
// // //             console.log('Actor created:', result.records.get('a'));
// // //             res.send(result.records.get('a'));
// // //         })
// // //         .catch(function (error) {
// // //             console.error('Error creating actor:', error);
// // //             res.status(500).send(error);
// // //         });
// // // });

// // // // Route to create ACTED_IN relationship
// // // app.post('/acted_in', function (req, res) {
// // //     var actorName = req.body.actorName;
// // //     var movieTitle = req.body.movieTitle;
// // //     console.log('POST /acted_in', actorName, movieTitle);
// // //     session.run('MATCH (a:Actor {name: $actorName}), (m:Movie {title: $movieTitle}) CREATE (a)-[:ACTED_IN]->(m) RETURN a, m', { actorName: actorName, movieTitle: movieTitle })
// // //         .then(function (result) {
// // //             console.log('Relationship created:', result.records);
// // //             res.send(result.records);
// // //         })
// // //         .catch(function (error) {
// // //             console.error('Error creating relationship:', error);
// // //             res.status(500).send(error);
// // //         });
// // // });

// // // app.listen(3000, function() {
// // //     console.log("server started on port 3000");
// // // });

// // // module.exports = app;