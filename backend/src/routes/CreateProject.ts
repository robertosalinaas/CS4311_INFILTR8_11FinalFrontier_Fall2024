import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import { authenticateToken } from '../config/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const EXPLOITS = [
    "Unauthenticated port bypass",
    "Default credentials",
    "Missing encryption protocols",
    "Unpatched software exploits",
    "Other"
];

type ExploitType = typeof EXPLOITS[number];

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userUploadDir = path.join(__dirname, '../uploads', req.user?.userId || 'unknown');
        // Create user directory if it doesn't exist
        if (!fs.existsSync(userUploadDir)) {
            fs.mkdirSync(userUploadDir, { recursive: true });
        }
        cb(null, userUploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only .nessus files
        if (path.extname(file.originalname) !== '.nessus') {
            return cb(new Error('Only .nessus files are allowed'));
        }
        cb(null, true);
    }
});

interface CreateProjectRequest {
    name: string;
    projectData: string; 
    nessusFile?: Express.Multer.File;
}

interface ProjectDataPayload {
    scopeIPs: Array<{ id: string; value: string }>;
    offLimitIPs: Array<{ id: string; value: string }>;
    allowedExploits: string[];
    createdAt: string;
}

const create_project = async (req: Request<{}, any, CreateProjectRequest>, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        const parsedProjectData = JSON.parse(req.body.projectData) as ProjectDataPayload;
        const { scopeIPs, offLimitIPs, allowedExploits, createdAt } = parsedProjectData;
        const name = req.body.name;
        const user = req.user;
        const nessusFile = req.file;

        if (!user) {
            res.status(401).json({
                error: 'User not authenticated'
            });
            return;
        }

        // Validate project name
        if (!name) {
            res.status(400).json({
                error: 'Project name is required'
            });
            return;
        }

        // Check for spaces in project name
        if (name.includes(' ')) {
            // Clean up uploaded file if validation fails
            if (nessusFile) {
                fs.unlinkSync(nessusFile.path);
            }
            res.status(400).json({
                error: 'Project name cannot contain spaces'
            });
            return;
        }

        // Validate exploits
        const validExploits = allowedExploits.filter(exploit => 
            EXPLOITS.includes(exploit as ExploitType)
        );

        // Transform IP arrays with explicit typing
        const transformedScopeIPs = scopeIPs.map((ip: { id: string; value: string }) => ip.value);
        const transformedOffLimitIPs = offLimitIPs.map((ip: { id: string; value: string }) => ip.value);

        // Check if project exists
        const checkProject = await session.run(
            `
            MATCH (u:User {userKey: $userKey})-[:OWNS]->(p:Project {name: $name})
            RETURN p
            `,
            { userKey: user.userId, name }
        );

        if (checkProject.records.length > 0) {
            // Delete uploaded file if project creation fails
            if (nessusFile) {
                fs.unlinkSync(nessusFile.path);
            }
            res.status(400).json({
                error: 'Project name already exists'
            });
            return;
        }

        // Create project in database
        const result = await session.run(
            `
            MATCH (u:User {userKey: $userKey})
            CREATE (p:Project {
                id: randomUUID(),
                name: $name,
                nessusFileName: $nessusFileName,
                nessusFilePath: $nessusFilePath,
                scopeIPs: $scopeIPs,
                offLimitIPs: $offLimitIPs,
                allowedExploits: $allowedExploits,
                createdAt: datetime($createdAt),
                createdBy: $userKey
            })
            CREATE (u)-[:OWNS]->(p)
            RETURN p
            `,
            {
                userKey: user.userId,
                name,
                nessusFileName: nessusFile?.originalname || null,
                nessusFilePath: nessusFile?.path || null,
                scopeIPs: transformedScopeIPs,
                offLimitIPs: transformedOffLimitIPs,
                allowedExploits: validExploits,
                createdAt
            }
        );

        const resultData = result.records[0].get('p').properties;
        const responseData = {
            ...resultData
        };

        res.status(201).json({
            message: 'Project created successfully',
            project: responseData
        });

    } catch (error) {
        // Clean up uploaded file if there's an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Failed to create project: ' + error.message
            });
        } else {
            next(error);
        }
    } finally {
        await session.close();
    }
};

// Download route for Nessus files
const download_nessus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        const { projectId } = req.params;
        const user = req.user;

        if (!user) {
            res.status(401).json({
                error: 'User not authenticated'
            });
            return;
        }

        // Check if user owns the project
        const result = await session.run(
            `
            MATCH (u:User {userKey: $userKey})-[:OWNS]->(p:Project {id: $projectId})
            RETURN p.nessusFilePath, p.nessusFileName
            `,
            { userKey: user.userId, projectId }
        );

        if (result.records.length === 0) {
            res.status(404).json({
                error: 'Project not found or access denied'
            });
            return;
        }

        const filePath = result.records[0].get('p.nessusFilePath');
        const fileName = result.records[0].get('p.nessusFileName');

        if (!filePath || !fileName) {
            res.status(404).json({
                error: 'No Nessus file found for this project'
            });
            return;
        }

        // Set proper headers for download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        // Stream the file instead of using res.download
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Handle errors during streaming
        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to stream file'
                });
            }
        });

    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof Error) {
                res.status(500).json({
                    error: 'Failed to download file: ' + error.message
                });
            } else {
                next(error);
            }
        }
    } finally {
        await session.close();
    }
};

// Routes
router.post('/create-project', authenticateToken, upload.single('nessusFile'), create_project);
router.get('/download-nessus/:projectId', authenticateToken, download_nessus);

export default router;