import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import { authenticateToken } from '../config/auth';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { server } from '../index';

const EXPLOITS = [
    "Unauthenticated port bypass",
    "Default credentials",
    "Missing encryption protocols",
    "Unpatched software exploits",
    "Other"
] as const;

interface ProjectProperties {
    id: string;
    name: string;
    nessusFilePath: string;
    nessusFileName: string;
    scopeIPs: string[];
    allowedExploits: string[];
    createdAt: string;
    createdBy: string;
    analysisStatus?: string;
    analysisResult?: string;
    lastAnalysis?: string;
    analysisOutputDir?: string;
}

const router = express.Router();

// Store active analyses
const activeAnalyses = new Map<string, {
    status: 'processing' | 'completed' | 'failed';
    results?: any;
    error?: string;
}>();

const start_analysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let session = driver.session();
    
    try {
        const { projectId } = req.body;
        const user = req.user;

        if (!user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        // Verify project ownership and get project details
        const projectResult = await session.run(
            `
            MATCH (u:User {userKey: $userKey})-[:OWNS]->(p:Project {id: $projectId})
            RETURN p
            `,
            { userKey: user.userId, projectId }
        );

        await session.close();

        if (projectResult.records.length === 0) {
            res.status(404).json({ error: 'Project not found or access denied' });
            return;
        }

        const project = projectResult.records[0].get('p').properties as ProjectProperties;
        
        if (!project.nessusFilePath || !fs.existsSync(project.nessusFilePath)) {
            res.status(400).json({ error: 'Nessus file not found for this project' });
            return;
        }

        // Validate required project properties
        if (!project.scopeIPs || !project.allowedExploits) {
            res.status(400).json({ error: 'Project scope IPs and allowed exploits are required' });
            return;
        }

        const analysisOutputDir = path.join(__dirname, '../analysis_results', user.userId, projectId);
        fs.mkdirSync(analysisOutputDir, { recursive: true });

        // Set initial status
        activeAnalyses.set(projectId, { status: 'processing' });

        // Send initial response
        res.status(200).json({
            message: 'Analysis started',
            status: 'processing'
        });

        const currentServer = server;
        const scriptPath = path.join(__dirname, '../../src/scripts/analize.py');

        // Format the IPs and exploits for the command line
        const scopeIPs = Array.isArray(project.scopeIPs) ? project.scopeIPs.join(',') : '';
        
        // Use default exploits if none are specified, ensuring exact matches
        const defaultExploits = EXPLOITS.join(',');
        const allowedExploits = Array.isArray(project.allowedExploits) && project.allowedExploits.length > 0
            ? project.allowedExploits.map((exploit: string) => exploit.toLowerCase()).join(',')
            : defaultExploits;

        console.log('Debug - Scope IPs:', scopeIPs);
        console.log('Debug - Allowed Exploits:', allowedExploits);

        const pythonProcess = spawn('python3', [
            scriptPath,
            project.nessusFilePath,
            '--output-dir', analysisOutputDir,
            '--allowed-ips', scopeIPs,
            '--allowed-exploits', allowedExploits
        ], {
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let scriptOutput = '';
        let scriptError = '';

        pythonProcess.stdout.on('data', (data) => {
            scriptOutput += data.toString();
            console.log(`Analysis output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            scriptError += data.toString();
            console.error(`Analysis error: ${data}`);
        });

        pythonProcess.on('close', async (code) => {
            if (currentServer !== server) {
                console.log('Server instance changed, skipping database update');
                activeAnalyses.set(projectId, { 
                    status: 'failed', 
                    error: 'Server instance changed during analysis' 
                });
                return;
            }

            if (code === 0) {
                try {
                    const results = {
                        data_with_exploits: fs.readFileSync(path.join(analysisOutputDir, 'data_with_exploits.csv'), 'utf-8'),
                        ranked_entry_points: fs.readFileSync(path.join(analysisOutputDir, 'ranked_entry_points.csv'), 'utf-8'),
                        entrypoint_most_info: fs.readFileSync(path.join(analysisOutputDir, 'entrypoint_most_info.csv'), 'utf-8'),
                        port_0_entries: fs.readFileSync(path.join(analysisOutputDir, 'port_0_entries.csv'), 'utf-8'),
                        exploits: fs.readFileSync(path.join(analysisOutputDir, 'exploits.json'), 'utf-8')
                    };

                    const newSession = driver.session();
                    try {
                        await newSession.run(
                            `
                            MATCH (p:Project {id: $projectId})
                            SET p.analysisStatus = 'completed',
                                p.analysisResult = $result,
                                p.lastAnalysis = datetime(),
                                p.analysisOutputDir = $outputDir
                            RETURN p
                            `,
                            { 
                                projectId,
                                result: JSON.stringify(results),
                                outputDir: analysisOutputDir
                            }
                        );
                        activeAnalyses.set(projectId, { 
                            status: 'completed',
                            results 
                        });
                    } finally {
                        await newSession.close();
                    }
                } catch (error) {
                    console.error('Error processing analysis results:', error);
                    activeAnalyses.set(projectId, { 
                        status: 'failed',
                        error: 'Failed to process analysis results' 
                    });
                }
            } else {
                console.error(`Analysis failed: ${scriptError}`);
                activeAnalyses.set(projectId, { 
                    status: 'failed',
                    error: scriptError 
                });
            }
        });

        pythonProcess.unref();

    } catch (error) {
        if (session) {
            await session.close();
        }
        next(error);
    }
};

// Add status check endpoint
router.get('/analysis-status/:projectId', authenticateToken, async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const analysisStatus = activeAnalyses.get(projectId);

    if (!analysisStatus) {
        res.status(404).json({ error: 'Analysis not found' });
        return;
    }

    res.json(analysisStatus);
});

router.post('/start-analysis', authenticateToken, start_analysis);

export default router;