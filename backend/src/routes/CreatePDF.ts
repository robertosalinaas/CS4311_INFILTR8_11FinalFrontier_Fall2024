import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../config/auth';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { driver } from '../config/neo4j';

const router = express.Router();

interface CreatePdfRequest {
    csvData: {
        data_with_exploits: string;
        ranked_entry_points: string;
        entrypoint_most_info: string;
        port_0_entries: string;
    };
}

const create_pdf = async (req: Request<{}, any, CreatePdfRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { csvData } = req.body;
        const user = req.user;

        if (!user) {
            res.status(401).json({
                error: 'User not authenticated'
            });
            return;
        }

        if (!csvData) {
            res.status(400).json({
                error: 'CSV data is required'
            });
            return;
        }

        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const outputFile = path.join(tempDir, `report_${Date.now()}.pdf`);
        const scriptPath = path.join(__dirname, '../scripts/merge_csv.py');

        // Pass CSV data as JSON string
        const csvDataJson = JSON.stringify(csvData);

        const pythonProcess = spawn('python', [
            scriptPath,
            csvDataJson,
            outputFile
        ]);

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('error', (error) => {
            console.error('Failed to start Python process:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to create PDF report'
                });
            }
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Failed to create PDF report'
                    });
                }
                return;
            }

            // Check if file was created
            if (!fs.existsSync(outputFile)) {
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'PDF report was not created'
                    });
                }
                return;
            }

            // Set headers for file download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="analysis_report.pdf"');

            // Stream the file
            const fileStream = fs.createReadStream(outputFile);
            fileStream.pipe(res);

            // Clean up file after sending
            fileStream.on('end', () => {
                fs.unlink(outputFile, (err) => {
                    if (err) console.error('Error deleting PDF file:', err);
                });
            });

            // Handle streaming errors
            fileStream.on('error', (error) => {
                console.error('File stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Failed to stream file'
                    });
                }
            });
        });

    } catch (error) {
        if (!res.headersSent) {
            if (error instanceof Error) {
                res.status(500).json({
                    error: 'Failed to create PDF report: ' + error.message
                });
            } else {
                next(error);
            }
        }
    }
};

// Routes
router.post('/create-pdf', authenticateToken, create_pdf);

export default router;