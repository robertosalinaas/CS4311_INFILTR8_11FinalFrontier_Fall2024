import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import { authenticateToken } from '../config/auth';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

const fetch_analyzed_projects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        // Query to get all completed projects with their details
        const result = await session.run(
            `
            MATCH (u:User {userKey: $userKey})-[:OWNS]->(p:Project)
            WHERE p.analysisStatus = 'completed'
            RETURN {
                projectId: p.id,
                name: p.name,
                createdAt: p.createdAt,
                analysisCompletedAt: p.lastAnalysis,
                scopeIPs: p.scopeIPs,
                offLimitIPs: p.offLimitIPs,
                allowedExploits: p.allowedExploits,
                nessusFileName: p.nessusFileName,
                nessusFilePath: p.nessusFilePath,
                analysisResult: p.analysisResult,
                analysisOutputDir: p.analysisOutputDir
            } as project
            `,
            { userKey: user.userId }
        );

        const projects = result.records.map(record => {
            const project = record.get('project');
            if (!project) return null;

            // Convert Neo4j date objects to strings
            const createdAt = project.createdAt ? project.createdAt.toString() : new Date().toISOString();
            const analysisCompletedAt = project.analysisCompletedAt ? project.analysisCompletedAt.toString() : createdAt;

            // If we have analysisResult stored in the database, use that
            if (project.analysisResult) {
                try {
                    const parsedResult = JSON.parse(project.analysisResult);
                    return {
                        projectId: project.projectId,
                        name: project.name,
                        createdAt,
                        analysisCompletedAt,
                        scopeIPs: project.scopeIPs?.map((ip: string) => ({ id: ip, value: ip })) || [],
                        offLimitIPs: project.offLimitIPs?.map((ip: string) => ({ id: ip, value: ip })) || [],
                        allowedExploits: project.allowedExploits || [],
                        ...parsedResult
                    };
                } catch (e) {
                    console.error('Error parsing analysis result:', e);
                }
            }

            // Fallback to reading from files if no stored result
            try {
                const outputDir = project.analysisOutputDir || path.join(
                    process.cwd(),
                    'src',
                    'analysis_results',
                    user.userId,
                    project.projectId
                );

                return {
                    projectId: project.projectId,
                    name: project.name,
                    createdAt,
                    analysisCompletedAt,
                    scopeIPs: project.scopeIPs?.map((ip: string) => ({ id: ip, value: ip })) || [],
                    offLimitIPs: project.offLimitIPs?.map((ip: string) => ({ id: ip, value: ip })) || [],
                    allowedExploits: project.allowedExploits || [],
                    data_with_exploits: '',
                    ranked_entry_points: '',
                    entrypoint_most_info: '',
                    port_0_entries: ''
                };
            } catch (error) {
                console.error(`Error reading files for project ${project.projectId}:`, error);
                return null;
            }
        }).filter(Boolean); // Remove any null entries

        res.json({ 
            projects,
            successMessage: `Found ${projects.length} analyzed projects`
        });

    } catch (error) {
        console.error('Error in fetch_analyzed_projects:', error);
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Failed to fetch analyzed projects: ' + error.message
            });
        } else {
            next(error);
        }
    } finally {
        await session.close();
    }
};

router.get('/fetch-analyzed-projects', authenticateToken, fetch_analyzed_projects);

export default router;