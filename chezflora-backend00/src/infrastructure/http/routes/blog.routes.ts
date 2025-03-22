import { Router } from 'express';
import { BlogCategoryController } from '../controllers/blog-category.controller';
import { BlogPostController } from '../controllers/blog-post.controller';
import { BlogCommentController } from '../controllers/blog-comment.controller';

import { BlogCategoryService } from '../../../application/services/blog/blog-category.service';
import { BlogPostService } from '../../../application/services/blog/blog-post.service';
import { BlogCommentService } from '../../../application/services/blog/blog-comment.service';

import { BlogCategoryRepository } from '../../repositories/blog-category.repository';
import { BlogPostRepository } from '../../repositories/blog-post.repository';
import { BlogCommentRepository } from '../../repositories/blog-comment.repository';

import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/blog.validator';

const router = Router();

// Initialisation des dépendances
const blogCategoryRepository = new BlogCategoryRepository();
const blogPostRepository = new BlogPostRepository();
const blogCommentRepository = new BlogCommentRepository();

const blogCategoryService = new BlogCategoryService(blogCategoryRepository);
const blogPostService = new BlogPostService(blogPostRepository);
const blogCommentService = new BlogCommentService(blogCommentRepository);

const blogCategoryController = new BlogCategoryController(blogCategoryService);
const blogPostController = new BlogPostController(blogPostService);
const blogCommentController = new BlogCommentController(blogCommentService);

// Routes des catégories
router.get('/categories', blogCategoryController.getCategories);
router.get('/categories/:id', blogCategoryController.getCategoryById);
router.post('/categories', authenticate, authorize(['admin']), validateBody(validators.createCategorySchema), blogCategoryController.createCategory);
router.put('/categories/:id', authenticate, authorize(['admin']), validateBody(validators.updateCategorySchema), blogCategoryController.updateCategory);
router.delete('/categories/:id', authenticate, authorize(['admin']), blogCategoryController.deleteCategory);

// Routes des articles
router.get('/posts', blogPostController.getPosts);
router.get('/posts/:id', blogPostController.getPostById);
router.get('/posts/slug/:slug', blogPostController.getPostBySlug);
router.post('/posts', authenticate, authorize(['admin']), validateBody(validators.createPostSchema), blogPostController.createPost);
router.put('/posts/:id', authenticate, authorize(['admin']), validateBody(validators.updatePostSchema), blogPostController.updatePost);
router.delete('/posts/:id', authenticate, authorize(['admin']), blogPostController.deletePost);
router.patch('/posts/:id/publish', authenticate, authorize(['admin']), blogPostController.publishPost);
router.patch('/posts/:id/archive', authenticate, authorize(['admin']), blogPostController.archivePost);

// Routes des commentaires
router.get('/posts/:postId/comments', blogCommentController.getCommentsByPostId);
router.post('/comments', authenticate, validateBody(validators.createCommentSchema), blogCommentController.createComment);
router.patch('/comments/:id/approve', authenticate, authorize(['admin']), blogCommentController.approveComment);
router.patch('/comments/:id/reject', authenticate, authorize(['admin']), blogCommentController.rejectComment);
router.delete('/comments/:id', authenticate, authorize(['admin']), blogCommentController.deleteComment);

export default router;