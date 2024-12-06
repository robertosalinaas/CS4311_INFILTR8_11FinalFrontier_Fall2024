import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import { authenticateToken } from '../config/auth';

const router = express.Router();

// Logout handler
const log_out = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        // Get user info from the authenticated token
        const user = req.user;
        
        if (!user) {
            res.status(401).json({
                error: 'User not authenticated'
            });
            return;
        }

        // Update last logout time and last active time in database
        await session.run(
            `
            MATCH (u:User {userKey: $userKey})
            SET u.lastLogout = datetime(),
                u.lastActive = datetime()
            RETURN u
            `,
            { userKey: user.userId }
        );

        // Send success response
        res.status(200).json({
            message: 'Logged out successfully',
            username: user.username
        });

    } catch (error) {
        // Handle specific errors
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Failed to process logout: ' + error.message
            });
        } else {
            next(error);
        }
    } finally {
        await session.close();
    }
};

// Routes
router.post('/logout', authenticateToken, log_out);

export default router;

