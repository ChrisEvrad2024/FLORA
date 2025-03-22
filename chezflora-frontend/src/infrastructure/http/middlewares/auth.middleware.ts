// src/infrastructure/http/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../../config/jwt';

/**
 * Middleware pour vérifier l'authentification d'un utilisateur
 * Ce middleware vérifie si un token JWT valide est présent dans les en-têtes de la requête
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = extractTokenFromHeader(req);

        if (!token) {
            console.log('[Auth] Authentication failed: No token provided');
            res.status(401).json({ success: false, message: 'Authentification requise' });
            return;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            console.log('[Auth] Authentication failed: Invalid token');
            res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
            return;
        }

        // Ajouter les infos utilisateur à l'objet request pour les middleware suivants
        (req as any).user = {
            id: decoded.userId,
            role: decoded.role,
        };

        console.log(`[Auth] Authentication successful for user: ${decoded.userId}`);
        next();
    } catch (error) {
        console.error(`[Auth] Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(401).json({ success: false, message: 'Erreur d\'authentification' });
    }
};

/**
 * Middleware pour vérifier les rôles d'un utilisateur
 * @param roles Tableau des rôles autorisés
 */
export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // Vérifier si l'objet utilisateur existe (ajouté par le middleware authenticate)
        const user = (req as any).user;

        if (!user) {
            console.log('[Auth] Role verification failed: No user in request');
            res.status(401).json({ success: false, message: 'Authentification requise' });
            return;
        }

        if (!roles.includes(user.role)) {
            console.log(`[Auth] Role verification failed: User role ${user.role} not in ${roles.join(', ')}`);
            res.status(403).json({ success: false, message: 'Permissions insuffisantes' });
            return;
        }

        console.log(`[Auth] Authorization successful for user: ${user.id} with role: ${user.role}`);
        next();
    };
};

/**
 * Middleware pour vérifier si l'utilisateur est le propriétaire d'une ressource
 * @param resourceIdParam Nom du paramètre contenant l'ID de la ressource
 * @param userIdProvider Fonction pour obtenir l'ID du propriétaire de la ressource
 */
export const isOwner = (
    resourceIdParam: string,
    userIdProvider: (req: Request) => Promise<string>
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const resourceId = req.params[resourceIdParam];
            if (!resourceId) {
                res.status(400).json({ success: false, message: 'ID de ressource manquant' });
                return;
            }

            const user = (req as any).user;
            if (!user) {
                res.status(401).json({ success: false, message: 'Authentification requise' });
                return;
            }

            // Obtenir l'ID utilisateur associé à la ressource
            const resourceUserId = await userIdProvider(req);

            // Vérifier si l'utilisateur est le propriétaire ou un admin
            if (user.id === resourceUserId || user.role === 'admin') {
                next();
            } else {
                console.log(`[Auth] Ownership verification failed: User ${user.id} is not the owner of resource ${resourceId}`);
                res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à accéder à cette ressource' });
            }
        } catch (error) {
            console.error(`[Auth] Ownership verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(500).json({ success: false, message: 'Erreur de vérification de propriété' });
        }
    };
};

export default { authenticate, authorize, isOwner };