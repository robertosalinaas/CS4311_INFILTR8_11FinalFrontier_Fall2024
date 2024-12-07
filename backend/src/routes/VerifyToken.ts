import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../config/auth';

declare global {
    var SERVER_START_TIME: number;
}

const router = express.Router();

const verify_token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        
        if (!user) {
            res.status(401).json({
                error: 'User not authenticated'
            });
            return;
        }

        // Check if token was issued before server start
        if (user.iat * 1000 < global.SERVER_START_TIME) {
            res.status(401).json({
                error: 'Server has been restarted, please login again'
            });
            return;
        }

        // If we get here, the token is valid and was issued after server start
        res.status(200).json({
            message: 'Token is valid',
            user: user
        });
    } catch (error) {
        console.error('Token verification error:', error);
        if (error instanceof Error) {
            res.status(401).json({
                error: 'Token verification failed: ' + error.message
            });
        } else {
            next(error);
        }
    }
};

router.get('/verify-token', authenticateToken, verify_token);

export default router; 