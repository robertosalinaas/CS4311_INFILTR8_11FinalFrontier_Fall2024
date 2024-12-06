import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const router = express.Router();

// Types
interface CreateAccountRequest {
    username: string;
    password: string;
    confirmPassword: string;
}

// Helper function to generate userKey
function generateUserKey(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Create account handler
const createAccount = async (req: Request<{}, any, CreateAccountRequest>, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        const { username, password, confirmPassword } = req.body;

        // Validate input
        if (!username || !password || !confirmPassword) {
            res.status(400).json({
                error: "All fields are required"
            });
            return;
        }

        if (password !== confirmPassword) {
            res.status(400).json({
                error: "Passwords don't match"
            });
            return;
        }

        // Check if user exists
        const checkUser = await session.run(
            'MATCH (u:User {username: $username}) RETURN u',
            { username }
        );

        if (checkUser.records.length > 0) {
            res.status(400).json({
                error: 'Username already exists'
            });
            return;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate user key
        const userKey = generateUserKey();

        // Create user in database
        const result = await session.run(
            `
            CREATE (u:User {
                username: $username,
                password: $hashedPassword,
                userKey: $userKey,
                createdAt: datetime()
            })
            RETURN u
            `,
            {
                username,
                hashedPassword,
                userKey
            }
        );

        // Send success response
        res.status(201).json({
            message: 'Account created successfully',
            userKey,
            username: result.records[0].get('u').properties.username
        });

    } catch (error) {
        next(error);
    } finally {
        await session.close();
    }
};

// Routes
router.post('/create-account', createAccount);

export default router;