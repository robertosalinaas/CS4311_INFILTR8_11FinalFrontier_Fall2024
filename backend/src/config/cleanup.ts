import fs from 'fs';
import path from 'path';
import { driver } from './neo4j';

export async function cleanupOrphanedFiles() {
    const session = driver.session();
    try {
        // Get all valid project IDs and user IDs from database
        const result = await session.run(`
            MATCH (u:User)-[:OWNS]->(p:Project)
            RETURN u.userKey as userId, p.id as projectId, p.nessusFilePath as nessusPath
        `);

        const validProjects = new Set(result.records.map(r => r.get('projectId')));
        const validUsers = new Set(result.records.map(r => r.get('userId')));
        
        // Extract just the filenames from the nessus paths
        const validNessusFiles = new Set(
            result.records
                .map(r => r.get('nessusPath'))
                .filter(Boolean)
                .map(filepath => path.basename(filepath))
        );

        // Clean up analysis results
        const analysisDir = path.join(__dirname, '../analysis_results');
        if (fs.existsSync(analysisDir)) {
            const userDirs = fs.readdirSync(analysisDir);
            for (const userId of userDirs) {
                if (userId === '.gitkeep') continue;
                
                try {
                    if (!validUsers.has(userId)) {
                        fs.rmSync(path.join(analysisDir, userId), { recursive: true, force: true });
                        console.log(`Cleaned up orphaned user directory: ${userId}`);
                        continue;
                    }

                    const projectDirs = fs.readdirSync(path.join(analysisDir, userId));
                    for (const projectId of projectDirs) {
                        try {
                            if (!validProjects.has(projectId)) {
                                fs.rmSync(path.join(analysisDir, userId, projectId), { recursive: true, force: true });
                                console.log(`Cleaned up orphaned project directory: ${projectId}`);
                            }
                        } catch (err) {
                            console.warn(`Failed to remove project directory ${projectId}:`, err);
                        }
                    }
                } catch (err) {
                    console.warn(`Failed to process user directory ${userId}:`, err);
                }
            }
        }

        // Clean up uploads
        const uploadsDir = path.join(__dirname, '../uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            for (const file of files) {
                if (file === '.gitkeep') continue;
                
                try {
                    const fullPath = path.join(uploadsDir, file);
                    const stats = fs.statSync(fullPath);
                    
                    // Compare just the filename instead of the full path
                    if (!validNessusFiles.has(file)) {
                        if (stats.isDirectory()) {
                            fs.rmSync(fullPath, { recursive: true, force: true });
                            console.log(`Cleaned up orphaned upload directory: ${file}`);
                        } else {
                            fs.rmSync(fullPath, { force: true });
                            console.log(`Cleaned up orphaned upload file: ${file}`);
                        }
                    }
                } catch (err) {
                    console.warn(`Failed to remove upload path ${file}:`, err);
                }
            }
        }

    } catch (error) {
        console.error('Storage cleanup error:', error);
    } finally {
        await session.close();
    }
}