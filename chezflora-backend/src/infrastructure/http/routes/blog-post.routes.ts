// src/infrastructure/http/routes/blog-post.routes.ts
import { Router } from 'express';
import { BlogPostController } from '../controllers/blog-post.controller';
import { BlogPostService } from '../../../application/services/blog/blog-post.service';
import { BlogPostRepository } from '../../repositories/blog-post.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { uploadSingleImage } from '../middlewares/upload.middleware';
import * as validators from '../../../application/validations/blog-post.validation';

const router = Router();

// Initialize dependencies
const blogPostRepository = new BlogPostRepository();
const blogPostService = new BlogPostService(blogPostRepository);
const blogPostController = new BlogPostController(blogPostService);

// Public routes
router.get('/', blogPostController.getAllBlogPosts);
router.get('/featured', blogPostController.getFeaturedBlogPosts);
router.get('/recent', blogPostController.getRecentBlogPosts);
router.get('/popular', blogPostController.getPopularBlogPosts);
router.get('/id/:id', blogPostController.getBlogPostById);
router.get('/slug/:slug', blogPostController.getBlogPostBySlug);
router.get('/:id/related', blogPostController.getRelatedBlogPosts);

// Protected routes (require authentication)
router.use(authenticate);

// Admin routes
router.post(
    '/',
    authorize(['admin']),
    uploadSingleImage('featuredImage'),
    validateBody(validators.createBlogPostSchema),
    blogPostController.createBlogPost
);

router.put(
    '/:id',
    authorize(['admin']),
    uploadSingleImage('featuredImage'),
    validateBody(validators.updateBlogPostSchema),
    blogPostController.updateBlogPost
);

router.delete(
    '/:id',
    authorize(['admin']),
    blogPostController.deleteBlogPost
);

router.post(
    '/:id/tags',
    authorize(['admin']),
    blogPostController.addTagToBlogPost
);

router.delete(
    '/:id/tags/:tagName',
    authorize(['admin']),
    blogPostController.removeTagFromBlogPost
);

export default router;