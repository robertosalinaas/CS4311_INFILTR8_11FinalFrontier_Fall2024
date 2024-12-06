import express, { Request, Response, NextFunction } from 'express';
import { driver } from '../config/neo4j';
import bcrypt from 'bcrypt';

const router = express.Router();

// Types
interface ResetPasswordRequest {
    userKey: string;
    newPassword: string;
    confirmPassword: string;
}

// Reset password handler
const resetPassword = async (req: Request<{}, any, ResetPasswordRequest>, res: Response, next: NextFunction): Promise<void> => {
    const session = driver.session();
    
    try {
        const { userKey, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!userKey || !newPassword || !confirmPassword) {
            res.status(400).json({
                error: "All fields are required"
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            res.status(400).json({
                error: "Passwords don't match"
            });
            return;
        }

        // Check if user exists
        const checkUser = await session.run(
            'MATCH (u:User {userKey: $userKey}) RETURN u',
            { userKey }
        );

        if (checkUser.records.length === 0) {
            res.status(400).json({
                error: 'Invalid user key'
            });
            return;
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        await session.run(
            `
            MATCH (u:User {userKey: $userKey})
            SET u.password = $hashedPassword,
                u.passwordUpdatedAt = datetime()
            RETURN u
            `,
            {
                userKey,
                hashedPassword
            }
        );

        // Send success response
        res.status(200).json({
            message: 'Password reset successfully'
        });

    } catch (error) {
        next(error);
    } finally {
        await session.close();
    }
};

// Routes
router.post('/reset-password', resetPassword);

export default router;


