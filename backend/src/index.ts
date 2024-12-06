import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import path from 'path';
import create_account from './routes/CreateAccount';
import reset_password from './routes/ResetPassword';
import sign_in from './routes/SignIn';
import log_out from './routes/LogOut';
import create_project from './routes/CreateProject';
import fetch_projects from './routes/FetchProjects';
import verify_token from './routes/VerifyToken';
import delete_project from './routes/DeleteProject';
import start_analysis from './routes/StartAnalysis';
import storage_usage from './routes/StorageUsage';
import create_excel from './routes/CreateExcel';
import fetch_analyzed_projects from './routes/FetchAnalyzedProjects';
import { driver } from './config/neo4j';

// Server instance that we'll export
export let server: any = null;

// Add this near the top of the file
let SERVER_START_TIME: number;
global.SERVER_START_TIME = Date.now();

// Function to check Python and pip installation
async function checkPythonInstallation(): Promise<boolean> {
    return new Promise((resolve) => {
        const pythonProcess = spawn('python3', ['--version']);
        pythonProcess.on('close', (code) => {
            resolve(code === 0);
        });
    });
}

// Function to install Python packages from requirements.txt
async function installPythonPackages(): Promise<void> {
    const requirementsFilePath = path.join(__dirname, 'requirements.txt');

    console.log('Installing Python packages from requirements.txt...');
    
    return new Promise((resolve, reject) => {
        const pipProcess = spawn('pip3', ['install', '-r', requirementsFilePath]);

        pipProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        pipProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pipProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Successfully installed packages from requirements.txt');
                resolve();
            } else {
                reject(new Error('Failed to install packages from requirements.txt'));
            }
        });
    });
}

// Function to setup Python environment
async function setupPythonEnvironment() {
    try {
        const pythonInstalled = await checkPythonInstallation();
        if (!pythonInstalled) {
            throw new Error('Python3 is not installed. Please install Python3 to continue.');
        }

        await installPythonPackages();
        console.log('Python environment setup completed successfully');
    } catch (error) {
        console.error('Error setting up Python environment:', error);
        process.exit(1);
    }
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded bodies with increased limits
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api', create_account);
app.use('/api', reset_password);
app.use('/api', sign_in);
app.use('/api', log_out);
app.use('/api', verify_token);
app.use('/api', create_project);
app.use('/api', fetch_projects);
app.use('/api', delete_project);
app.use('/api', start_analysis);
app.use('/api', storage_usage);
app.use('/api', create_excel);
app.use('/api', fetch_analyzed_projects);
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error'
    });
});

// Start server with Python environment setup
async function startServer() {
    try {
        await setupPythonEnvironment();
        
        SERVER_START_TIME = Date.now();
        global.SERVER_START_TIME = SERVER_START_TIME;
        
        // Store the server instance
        server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        }).on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, retrying in 10 seconds...`);
                setTimeout(() => {
                    if (server) server.close();
                    startServer();
                }, 10000);
            } else {
                console.error('Server error:', err);
            }
        });

        // Handle graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received: closing HTTP server');
            await driver.close();
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            console.log('SIGINT signal received: closing HTTP server');
            await driver.close();
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', async (error: Error) => {
            console.error('Uncaught Exception:', error);
            await driver.close();
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', async (reason: any, promise: Promise<any>) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            await driver.close();
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Export the server instance
export { app };