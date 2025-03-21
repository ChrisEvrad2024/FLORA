// src/infrastructure/http/routes/blog-scheduler.routes.ts
import { Router } from 'express';
import { BlogSchedulerController } from '../controllers/blog-scheduler.controller';
import { BlogSchedulerService } from '../../../application/services/blog/blog-scheduler.service';
import { BlogPostRepository } from '../../repositories/blog-post.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/blog-scheduler.validator';

const router = Router();

// Initialize dependencies
const blogPostRepository = new BlogPostRepository();
const blogSchedulerService = new BlogSchedulerService(blogPostRepository);
const blogSchedulerController = new BlogSchedulerController(blogSchedulerService);

// All routes require authentication and admin role
router.use(authenticate, authorize(['admin']));

// Routes for blog scheduling
router.get('/scheduled', blogSchedulerController.getScheduledPosts);
router.post('/publish-scheduled', blogSchedulerController.publishScheduledPosts);
router.post(
    '/:id/schedule',
    validateBody(validators.scheduleBlogPostSchema),
    blogSchedulerController.scheduleBlogPost
);
router.post(
    '/:id/cancel-schedule',
    blogSchedulerController.cancelScheduledPublication
);

export default router;