// src/infrastructure/http/routes/blog-stats.routes.ts
import { Router } from 'express';
import { BlogStatisticsController } from '../controllers/blog-statistics.controller';
import { BlogDashboardController } from '../controllers/blog-dashboard.controller';
import { BlogStatisticsService } from '../../../application/services/blog/blog-statistics.service';
import { BlogDashboardService } from '../../../application/services/blog/blog-dashboard.service';

import { BlogPostRepository } from '../../repositories/blog-post.repository';
import { BlogCommentRepository } from '../../repositories/blog-comment.repository';
import { BlogTagRepository } from '../../repositories/blog-tag.repository';
import { BlogCategoryRepository } from '../../repositories/blog-category.repository';

import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Sequelize } from 'sequelize-typescript';

const router = Router();

// Initialisation des dépendances
const sequelize = new Sequelize(); // Utiliser l'instance existante de la config
const blogPostRepository = new BlogPostRepository();
const blogCommentRepository = new BlogCommentRepository();
const blogCategoryRepository = new BlogCategoryRepository();
const blogTagRepository = new BlogTagRepository();

const blogStatisticsService = new BlogStatisticsService(
    blogPostRepository,
    blogCommentRepository,
    blogCategoryRepository,
    sequelize
);

const blogDashboardService = new BlogDashboardService(
    blogStatisticsService,
    blogPostRepository,
    blogCommentRepository,
    blogCategoryRepository,
    blogTagRepository,
    sequelize
);

const blogStatisticsController = new BlogStatisticsController(blogStatisticsService);
const blogDashboardController = new BlogDashboardController(blogDashboardService);

// Rendre le service de statistiques disponible dans l'application
router.use((req, res, next) => {
    req.app.set('blogStatisticsService', blogStatisticsService);
    next();
});

// Routes pour les statistiques
router.get('/stats/posts/count', authenticate, blogStatisticsController.getPostCount);
router.get('/stats/comments/count', authenticate, blogStatisticsController.getCommentCount);
router.get('/stats/views/count', authenticate, blogStatisticsController.getViewCount);
router.get('/stats/posts/most-viewed', authenticate, blogStatisticsController.getMostViewedPosts);
router.get('/stats/posts/most-commented', authenticate, blogStatisticsController.getMostCommentedPosts);
router.get('/stats/categories/distribution', authenticate, blogStatisticsController.getCategoryDistribution);
router.get('/stats/posts/per-month', authenticate, blogStatisticsController.getPostsPerMonth);
router.get('/stats/comments/per-month', authenticate, blogStatisticsController.getCommentsPerMonth);
router.post('/stats/views/track/:postId', blogStatisticsController.trackView);

// Routes pour le tableau de bord
router.get('/dashboard/summary', authenticate, authorize(['admin']), blogDashboardController.getDashboardSummary);
router.get('/dashboard/quick-summary', authenticate, blogDashboardController.getQuickSummary);
router.get('/dashboard/post-statistics', authenticate, authorize(['admin']), blogDashboardController.getPostStatistics);
router.get('/dashboard/comment-statistics', authenticate, authorize(['admin']), blogDashboardController.getCommentStatistics);

export default router;