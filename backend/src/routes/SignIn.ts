import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Types
interface SignInRequest {
    username: string;
    password: string;
}

// JWT secret key should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sign in handler
const sign_in = async (req: Request<{}, any, SignInRequest>, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            res.status(400).json({
                error: "All fields are required"
            });
            return;
        }

        // Find user
        const result = await session.run(
            'MATCH (u:User {username: $username}) RETURN u',
            { username }
        );

        if (result.records.length === 0) {
            res.status(401).json({
                error: 'Invalid username or password'
            });
            return;
        }

        const user = result.records[0].get('u').properties;

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            res.status(401).json({
                error: 'Invalid username or password'
            });
            return;
        }

        // Update last login time
        await session.run(
            `
            MATCH (u:User {username: $username})
            SET u.lastLogin = datetime(),
                u.lastActive = datetime()
            RETURN u
            `,
            { username }
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.userKey,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send success response
        res.status(200).json({
            message: 'Signed in successfully',
            username: user.username,
            userKey: user.userKey,
            token
        });

    } catch (error) {
        next(error);
    } finally {
        await session.close();
    }
};

// Routes
router.post('/sign-in', sign_in);

export default router;

