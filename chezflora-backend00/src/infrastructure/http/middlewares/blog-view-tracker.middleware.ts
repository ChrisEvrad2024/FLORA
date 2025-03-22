// src/infrastructure/http/middlewares/blog-view-tracker.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { BlogStatisticsServiceInterface } from '../../../interfaces/services/blog-statistics-service.interface';

/**
 * Middleware pour suivre les vues d'articles de blog
 */
export const createBlogViewTrackerMiddleware = (
    blogStatisticsService: BlogStatisticsServiceInterface,
    options: {
        trackAuthenticatedUsers?: boolean;
        trackBots?: boolean;
        sessionTimeout?: number;
    } = {}
) => {
    // Options par défaut
    const {
        trackAuthenticatedUsers = true,
        trackBots = false,
        sessionTimeout = 30 * 60 * 1000 // 30 minutes par défaut
    } = options;
    
    // Map pour stocker les sessions de vue afin d'éviter les duplications
    const viewSessions = new Map<string, number>();
    
    // Nettoyer périodiquement les sessions expirées
    setInterval(() => {
        const now = Date.now();
        for (const [sessionKey, timestamp] of viewSessions.entries()) {
            if (now - timestamp > sessionTimeout) {
                viewSessions.delete(sessionKey);
            }
        }
    }, 15 * 60 * 1000); // Nettoyage toutes les 15 minutes
    
    return async (req: Request, res: Response, next: NextFunction) => {
        // Vérifier si nous devons suivre cette requête
        const shouldTrack = (path: string): boolean => {
            // Exclure les requêtes non-GET
            if (req.method !== 'GET') return false;
            
            // Vérifier si c'est une requête pour un article de blog spécifique
            // Format de chemin attendu: /api/blog/posts/:id ou /api/blog/posts/slug/:slug
            return (
                path.startsWith('/api/blog/posts/') &&
                (path.match(/\/api\/blog\/posts\/[a-zA-Z0-9-]+$/) ||
                path.match(/\/api\/blog\/posts\/slug\/[a-zA-Z0-9-]+$/))
            );
        };
        
        // Vérifier si c'est un bot (base simple)
        const isBot = (userAgent: string): boolean => {
            const botPatterns = [
                'bot', 'spider', 'crawler', 'slurp', 'lighthouse',
                'googlebot', 'bingbot', 'yandex', 'baidu'
            ];
            
            const lowerCaseUA = userAgent.toLowerCase();
            return botPatterns.some(pattern => lowerCaseUA.includes(pattern));
        };
        
        // Identifier la ressource (article) demandée
        const getPostId = (path: string): string | null => {
            // Extraction de l'ID ou du slug de l'URL
            const idMatch = path.match(/\/api\/blog\/posts\/([a-zA-Z0-9-]+)$/);
            if (idMatch) return idMatch[1];
            
            const slugMatch = path.match(/\/api\/blog\/posts\/slug\/([a-zA-Z0-9-]+)$/);
            if (slugMatch) return `slug:${slugMatch[1]}`;
            
            return null;
        };
        
        try {
            // Vérifier si nous devons suivre cette vue
            if (!shouldTrack(req.path)) {
                return next();
            }
            
            // Vérifier s'il s'agit d'un bot
            const userAgent = req.headers['user-agent'] || '';
            if (isBot(userAgent) && !trackBots) {
                return next();
            }
            
            // Vérifier s'il s'agit d'un utilisateur authentifié
            const userId = req.user?.id;
            if (userId && !trackAuthenticatedUsers) {
                return next();
            }
            
            // Obtenir l'ID de l'article
            const rawPostId = getPostId(req.path);
            if (!rawPostId) {
                return next();
            }
            
            // Déterminer s'il s'agit d'un ID ou d'un slug
            let postId: string;
            
            if (rawPostId.startsWith('slug:')) {
                // Si c'est un slug, la logique de suivi sera gérée après la résolution du slug en ID
                // dans le contrôleur, donc on ne fait rien ici
                return next();
            } else {
                postId = rawPostId;
            }
            
            // Créer une clé de session unique pour cet utilisateur et cet article
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const sessionKey = `${postId}:${userId || ip}:${userAgent.substring(0, 50)}`;
            
            // Vérifier si nous avons déjà enregistré une vue pour cette session
            const lastViewTime = viewSessions.get(sessionKey);
            const now = Date.now();
            
            if (!lastViewTime || (now - lastViewTime > sessionTimeout)) {
                // Enregistrer la vue si c'est une nouvelle session ou si la session précédente a expiré
                viewSessions.set(sessionKey, now);
                
                // Collecter des métadonnées supplémentaires
                const metadata = {
                    userAgent,
                    referrer: req.headers.referer || req.headers.referrer || null,
                    ip: req.ip,
                    path: req.path
                };
                
                // Enregistrer la vue de manière asynchrone (ne pas bloquer la requête)
                blogStatisticsService.trackView(postId, userId, metadata)
                    .catch(err => console.error('Error tracking blog view:', err));
            }
            
            // Continuer le traitement de la requête
            next();
        } catch (error) {
            // En cas d'erreur, journaliser mais ne pas interrompre la requête
            console.error('Error in blog view tracker middleware:', error);
            next();
        }
    };
};

/**
 * Middleware plus simple pour attacher directement au routeur
 */
export const blogViewTracker = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Récupérer le service de statistiques de l'app
    const app = req.app;
    const blogStatisticsService = app.get('blogStatisticsService') as BlogStatisticsServiceInterface;
    
    if (!blogStatisticsService) {
        console.error('Blog statistics service not found in app context');
        return next();
    }
    
    // Capturer l'ID de l'article à partir des paramètres de route
    const { id } = req.params;
    if (!id) {
        return next();
    }
    
    // Capturer l'ID utilisateur s'il est disponible
    const userId = req.user?.id;
    
    // Traquer la vue de manière asynchrone
    blogStatisticsService.trackView(id, userId)
        .catch(err => console.error('Error tracking blog view:', err));
    
    // Continuer le traitement de la requête
    next();
};

// Middleware spécifique pour les articles accédés par slug
export const blogViewTrackerBySlug = (
    blogStatisticsService: BlogStatisticsServiceInterface
) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Le contrôleur mettra l'article résolu dans res.locals
        res.on('finish', () => {
            // Cette logique s'exécute après que la réponse a été envoyée
            const post = res.locals.blogPost;
            if (post && post.id) {
                // Capturer l'ID utilisateur s'il est disponible
                const userId = req.user?.id;
                
                // Collecter des métadonnées supplémentaires
                const metadata = {
                    userAgent: req.headers['user-agent'] || '',
                    referrer: req.headers.referer || req.headers.referrer || null,
                    ip: req.ip,
                    path: req.path,
                    slug: req.params.slug
                };
                
                // Traquer la vue de manière asynchrone
                blogStatisticsService.trackView(post.id, userId, metadata)
                    .catch(err => console.error('Error tracking blog view by slug:', err));
            }
        });
        
        next();
    } catch (error) {
        console.error('Error in blog view tracker by slug middleware:', error);
        next();
    }
};