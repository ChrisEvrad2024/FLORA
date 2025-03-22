// src/infrastructure/http/routes/blog-revision.routes.ts
import { Router } from 'express';
import { BlogRevisionController } from '../controllers/blog-revision.controller';
import { BlogRevisionService } from '../../../application/services/blog/blog-revision.service';
import { BlogPostRepository } from '../../repositories/blog-post.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Sequelize } from 'sequelize-typescript';

const router = Router();

// Initialisation des dépendances
const sequelize = new Sequelize(); // Utiliser l'instance existante de la config
const blogPostRepository = new BlogPostRepository();

const blogRevisionService = new BlogRevisionService(blogPostRepository, sequelize);
const blogRevisionController = new BlogRevisionController(blogRevisionService);

// Routes pour les révisions
router.get('/posts/:postId/revisions', authenticate, blogRevisionController.getRevisionHistory);
router.get('/posts/:postId/revisions/:revisionNumber', authenticate, blogRevisionController.getRevision);
router.post('/posts/:postId/revisions', authenticate, authorize(['admin']), blogRevisionController.createRevision);
router.get('/posts/:postId/revisions/compare/:fromRevision/:toRevision', authenticate, blogRevisionController.compareRevisions);
router.post('/posts/:postId/revisions/:revisionNumber/restore', authenticate, authorize(['admin']), blogRevisionController.restoreRevision);
router.delete('/revisions/:revisionId', authenticate, authorize(['admin']), blogRevisionController.deleteRevision);

export default router;