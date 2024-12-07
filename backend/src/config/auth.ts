import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
                iat: number;
                exp: number;
            };
        }
    }
}

interface JWTPayload {
    userId: string;
    username: string;
    iat: number;
    exp: number;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            res.status(401).json({ 
                error: 'Authentication header missing' 
            });
            return;
        }

        // Split 'Bearer TOKEN'
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            res.status(401).json({ 
                error: 'Authentication token missing' 
            });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        
        // Add user info to request
        req.user = decoded;
        
        // Token is valid, proceed
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({ 
                error: 'Invalid token' 
            });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ 
                error: 'Token expired' 
            });
        } else {
            res.status(500).json({ 
                error: 'Internal server error' 
            });
        }
    }
};

// Middleware to refresh token
export const refreshToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const user = req.user;
        
        if (!user) {
            res.status(401).json({ 
                error: 'User not authenticated' 
            });
            return;
        }

        // Generate new token
        const newToken = jwt.sign(
            { 
                userId: user.userId,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Add new token to response
        res.locals.newToken = newToken;
        next();
    } catch (error) {
        next(error);
    }
};


