import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import { authenticateToken } from '../config/auth';
import path from 'path';
import fs from 'fs';

const router = express.Router();

function getDirectorySize(dirPath: string): number {
    let totalSize = 0;
    if (!fs.existsSync(dirPath)) return totalSize;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            totalSize += getDirectorySize(filePath);
        } else {
            totalSize += stats.size;
        }
    }
    return totalSize;
}

const get_storage_usage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        // Get user's project files from database
        const projectResult = await session.run(
            `
            MATCH (u:User {userKey: $userKey})-[:OWNS]->(p:Project)
            RETURN p.nessusFilePath as nessusPath, p.analysisOutputDir as analysisDir
            `,
            { userKey: user.userId }
        );

        // Calculate Nessus files size
        let nessusSize = 0;
        for (const record of projectResult.records) {
            const nessusPath = record.get('nessusPath');
            if (nessusPath && fs.existsSync(nessusPath)) {
                nessusSize += fs.statSync(nessusPath).size;
            }
        }

        // Calculate analysis results size
        const analysisPath = path.join(__dirname, '../analysis_results', user.userId);
        const analysisSize = getDirectorySize(analysisPath);

        const totalSize = nessusSize + analysisSize;
        const maxSize = 1024 * 1024 * 1024; // 1GB limit

        res.status(200).json({
            totalSize,
            nessusSize,
            analysisSize,
            maxSize,
            usedPercentage: (totalSize / maxSize) * 100
        });

    } catch (error) {
        next(error);
    } finally {
        await session.close();
    }
};

router.get('/storage-usage', authenticateToken, get_storage_usage);

export default router;