// src/infrastructure/http/routes/blog-category.routes.ts
import { Router } from 'express';
import { BlogCategoryController } from '../controllers/blog-category.controller';
import { BlogCategoryService } from '../../../application/services/blog/blog-category.service';
import { BlogCategoryRepository } from '../../repositories/blog-category.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../../../application/validations/blog-category.validation';

const router = Router();

// Initialize dependencies
const blogCategoryRepository = new BlogCategoryRepository();
const blogCategoryService = new BlogCategoryService(blogCategoryRepository);
const blogCategoryController = new BlogCategoryController(blogCategoryService);

// Public routes
router.get('/', blogCategoryController.getAllBlogCategories);
router.get('/with-post-count', blogCategoryController.getBlogCategoriesWithPostCount);
router.get('/id/:id', blogCategoryController.getBlogCategoryById);
router.get('/slug/:slug', blogCategoryController.getBlogCategoryBySlug);

// Protected routes (require authentication)
router.use(authenticate);

// Admin routes
router.post(
    '/',
    authorize(['admin']),
    validateBody(validators.createBlogCategorySchema),
    blogCategoryController.createBlogCategory
);

router.put(
    '/:id',
    authorize(['admin']),
    validateBody(validators.updateBlogCategorySchema),
    blogCategoryController.updateBlogCategory
);

router.delete(
    '/:id',
    authorize(['admin']),
    blogCategoryController.deleteBlogCategory
);

export default router;