// src/infrastructure/http/routes/blog.routes.ts
import { Router } from 'express';
import { BlogCategoryController } from '../controllers/blog-category.controller';
import { BlogPostController } from '../controllers/blog-post.controller';
import { BlogCommentController } from '../controllers/blog-comment.controller';
import { BlogTagController } from '../controllers/blog-tag.controller';

import { BlogCategoryService } from '../../../application/services/blog/blog-category.service';
import { BlogPostService } from '../../../application/services/blog/blog-post.service';
import { BlogCommentService } from '../../../application/services/blog/blog-comment.service';
import { BlogTagService } from '../../../application/services/blog/blog-tag.service';

import { BlogCategoryRepository } from '../../repositories/blog-category.repository';
import { BlogPostRepository } from '../../repositories/blog-post.repository';
import { BlogCommentRepository } from '../../repositories/blog-comment.repository';
import { BlogTagRepository } from '../../repositories/blog-tag.repository';

import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { uploadSingleImage } from '../middlewares/upload.middleware';
import * as validators from '../validators/blog.validator';

const router = Router();

// Initialisation des dépendances
const blogCategoryRepository = new BlogCategoryRepository();
const blogPostRepository = new BlogPostRepository();
const blogCommentRepository = new BlogCommentRepository();
const blogTagRepository = new BlogTagRepository();

const blogCategoryService = new BlogCategoryService(blogCategoryRepository);
const blogPostService = new BlogPostService(blogPostRepository, blogTagRepository);
const blogCommentService = new BlogCommentService(blogCommentRepository);
const blogTagService = new BlogTagService(blogTagRepository);

const blogCategoryController = new BlogCategoryController(blogCategoryService);
const blogPostController = new BlogPostController(blogPostService);
const blogCommentController = new BlogCommentController(blogCommentService);
const blogTagController = new BlogTagController(blogTagService);

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
router.post('/posts', 
    authenticate, 
    authorize(['admin']), 
    uploadSingleImage('featuredImage'),
    validateBody(validators.createPostSchema), 
    blogPostController.createPost
);
router.put('/posts/:id', 
    authenticate, 
    authorize(['admin']), 
    uploadSingleImage('featuredImage'),
    validateBody(validators.updatePostSchema), 
    blogPostController.updatePost
);
router.delete('/posts/:id', authenticate, authorize(['admin']), blogPostController.deletePost);
router.patch('/posts/:id/publish', authenticate, authorize(['admin']), blogPostController.publishPost);
router.patch('/posts/:id/archive', authenticate, authorize(['admin']), blogPostController.archivePost);

// Routes des tags
router.get('/tags', blogTagController.getTags);
router.get('/tags/:id', blogTagController.getTagById);
router.get('/tags/slug/:slug', blogTagController.getTagBySlug);
router.get('/posts/:postId/tags', blogTagController.getTagsByPostId);
router.post('/tags', authenticate, authorize(['admin']), validateBody(validators.createTagSchema), blogTagController.createTag);
router.put('/tags/:id', authenticate, authorize(['admin']), validateBody(validators.updateTagSchema), blogTagController.updateTag);
router.delete('/tags/:id', authenticate, authorize(['admin']), blogTagController.deleteTag);

// Routes de la relation post-tag
router.post('/posts/:postId/tags/:tagId', authenticate, authorize(['admin']), blogTagController.addTagToPost);
router.delete('/posts/:postId/tags/:tagId', authenticate, authorize(['admin']), blogTagController.removeTagFromPost);
router.put('/posts/:postId/tags', authenticate, authorize(['admin']), blogTagController.setPostTags);

// Routes des commentaires
router.get('/posts/:postId/comments', blogCommentController.getCommentsByPostId);
router.post('/comments', authenticate, validateBody(validators.createCommentSchema), blogCommentController.createComment);
router.patch('/comments/:id/approve', authenticate, authorize(['admin']), blogCommentController.approveComment);
router.patch('/comments/:id/reject', authenticate, authorize(['admin']), blogCommentController.rejectComment);
router.delete('/comments/:id', authenticate, authorize(['admin']), blogCommentController.deleteComment);

export default router;