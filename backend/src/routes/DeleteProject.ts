import express, { Request as ExpressRequest, Response } from 'express';
import { driver } from '../config/neo4j';
import { authenticateToken } from '../config/auth';
import fs from 'fs';
import path from 'path';

// Extend the Express Request type to include our user property with JWT fields
interface AuthenticatedRequest extends ExpressRequest {
    user?: {
        userId: string;
        username: string;
        iat: number;
        exp: number;
    };
    params: {
        projectId: string;
    };
}

const router = express.Router();

const delete_project = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const session = driver.session();
    try {
        const user = req.user;
        const projectId = req.params.projectId;

        if (!user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        if (!projectId) {
            res.status(400).json({ error: 'Project ID is required' });
            return;
        }

        // First, get the project details including the nessus file path
        const projectResult = await session.run(
            `MATCH (u:User {userKey: $userKey})-[:OWNS]->(p:Project {id: $projectId})
             RETURN p.nessusFilePath as nessusPath, p.analysisOutputDir as analysisDir`,
            { userKey: user.userId, projectId }
        );

        if (projectResult.records.length === 0) {
            res.status(404).json({ error: 'Project not found or access denied' });
            return;
        }

        // Get the paths before deleting the project
        const nessusPath = projectResult.records[0].get('nessusPath');
        const analysisDir = projectResult.records[0].get('analysisDir');

        // Delete the project from Neo4j
        await session.run(
            `MATCH (u:User {userKey: $userKey})-[:OWNS]->(p:Project {id: $projectId})
             DETACH DELETE p`,
            { userKey: user.userId, projectId }
        );

        // Clean up associated files
        try {
            // Delete the nessus file if it exists
            if (nessusPath && fs.existsSync(nessusPath)) {
                fs.unlinkSync(nessusPath);
                console.log(`Deleted nessus file: ${nessusPath}`);
            }

            // Delete the analysis results directory from the specified path
            if (analysisDir && fs.existsSync(analysisDir)) {
                fs.rmSync(analysisDir, { recursive: true, force: true });
                console.log(`Deleted analysis directory: ${analysisDir}`);
            }

            // Delete the analysis results from the standard location
            const standardAnalysisDir = path.join(
                __dirname,
                '../analysis_results',
                user.userId,
                projectId
            );
            if (fs.existsSync(standardAnalysisDir)) {
                fs.rmSync(standardAnalysisDir, { recursive: true, force: true });
                console.log(`Deleted standard analysis directory: ${standardAnalysisDir}`);
            }

            // Try to remove the user directory if it's empty
            const userDir = path.join(__dirname, '../analysis_results', user.userId);
            if (fs.existsSync(userDir)) {
                const userDirContents = fs.readdirSync(userDir);
                if (userDirContents.length === 0) {
                    fs.rmdirSync(userDir);
                    console.log(`Removed empty user directory: ${userDir}`);
                }
            }

        } catch (err) {
            console.warn('Error cleaning up project files:', err);
            // Continue with the response even if file cleanup fails
        }

        res.status(200).json({
            message: 'Project and associated files deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Failed to delete project'
        });
    } finally {
        await session.close();
    }
};

// Use the correct type for the route handler
router.delete('/delete-project/:projectId', authenticateToken, (req: ExpressRequest, res: Response) => {
    delete_project(req as AuthenticatedRequest, res).catch(error => {
        console.error('Unhandled error in delete_project:', error);
        res.status(500).json({ error: 'Internal server error' });
    });
});

export default router;