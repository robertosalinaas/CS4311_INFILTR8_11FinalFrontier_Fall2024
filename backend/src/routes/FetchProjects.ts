import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import { authenticateToken } from '../config/auth';
import crypto from 'crypto';

const router = express.Router();

const fetch_projects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                error: 'User not authenticated'
            });
            return;
        }

        // Update the Cypher query
        const result = await session.run(
            `
            MATCH (u:User {userKey: $userKey})-[:OWNS]->(p:Project)
            RETURN p {
                id: p.id,
                name: p.name,
                nessusFileName: p.nessusFileName,
                nessusFilePath: p.nessusFilePath,
                scopeIPs: p.scopeIPs,
                offLimitIPs: p.offLimitIPs,
                allowedExploits: p.allowedExploits,
                createdAt: toString(p.createdAt)
            } as project
            ORDER BY p.createdAt DESC
            `,
            { userKey: user.userId }
        );

        // Log raw data from database
        console.log('Raw DB results:', result.records.map(r => r.get('project')));

        // Transform the projects data
        const projects = result.records.map(record => {
            const project = record.get('project');
            
            // Log each project's nessus file info
            console.log('Project Nessus info:', {
                name: project.name,
                nessusFileName: project.nessusFileName,
                nessusFilePath: project.nessusFilePath
            });

            return {
                ...project,
                nessusFileName: project.nessusFileName || null,
                nessusFilePath: project.nessusFilePath || null,
                scopeIPs: project.scopeIPs.map((ip: string) => ({
                    id: crypto.randomUUID(),
                    value: ip
                })),
                offLimitIPs: project.offLimitIPs.map((ip: string) => ({
                    id: crypto.randomUUID(),
                    value: ip
                })),
                allowedExploits: project.allowedExploits || []
            };
        });

        // Log final transformed data
        console.log('Transformed projects:', projects);

        res.status(200).json({
            projects
        });

    } catch (error) {
        console.error('Fetch projects error:', error);
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Failed to fetch projects: ' + error.message
            });
        } else {
            next(error);
        }
    } finally {
        await session.close();
    }
};

// Route
router.get('/fetch-projects', authenticateToken, fetch_projects);

export default router;