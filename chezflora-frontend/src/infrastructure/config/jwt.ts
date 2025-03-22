// src/infrastructure/config/jwt.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId: string, role: string = 'user'): string => {
    console.log(`[JWT] Generating token for user: ${userId}, role: ${role}`);
    return jwt.sign(
        { userId, role },
        SECRET_KEY,
        { expiresIn: EXPIRES_IN }
    );
};

export const verifyToken = (token: string): any => {
    try {
        console.log(`[JWT] Verifying token`);
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        console.error(`[JWT] Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
};

export const extractTokenFromHeader = (req: Request): string | null => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.split(' ')[1];
};

export const refreshToken = (oldToken: string): string | null => {
    try {
        const decoded = verifyToken(oldToken);
        if (!decoded) return null;

        // Generate new token with the same payload but new expiration
        return generateToken(decoded.userId, decoded.role);
    } catch (error) {
        console.error(`[JWT] Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = extractTokenFromHeader(req);

        if (!token) {
            console.log('[JWT] Authentication failed: No token provided');
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            console.log('[JWT] Authentication failed: Invalid token');
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        // Add user info to request object
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error(`[JWT] Authentication middleware error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // Check if user object exists (set by requireAuth middleware)
        const user = (req as any).user;

        if (!user) {
            console.log('[JWT] Role verification failed: No user in request');
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        if (!roles.includes(user.role)) {
            console.log(`[JWT] Role verification failed: User role ${user.role} not in ${roles.join(', ')}`);
            res.status(403).json({ success: false, message: 'Insufficient permissions' });
            return;
        }

        next();
    };
};

export default {
    generateToken,
    verifyToken,
    extractTokenFromHeader,
    refreshToken,
    requireAuth,
    requireRole
};