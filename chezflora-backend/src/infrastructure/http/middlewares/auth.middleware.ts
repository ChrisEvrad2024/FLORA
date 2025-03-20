import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../../application/services/auth.service';
import { UserRepository } from '../../repositories/user.repository';

// Extension du type Request pour inclure l'utilisateur
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// Middleware d'authentification
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Vérifier l'en-tête Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        // Extraire le token
        const token = authHeader.split(' ')[1];

        // Vérifier le token
        const userRepository = new UserRepository();
        const authService = new AuthService(userRepository);
        const user = await authService.verifyToken(token);

        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        // Ajouter l'utilisateur à la requête
        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

// Middleware de vérification des rôles
export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Insufficient permissions' });
            return;
        }

        next();
    };
};