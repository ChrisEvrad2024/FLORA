// src/infrastructure/http/routes/comment.routes.ts
import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { CommentService } from '../../../application/services/blog/comment.service';
import { CommentRepository } from '../../repositories/comment.repository';
import { BlogPostRepository } from '../../repositories/blog-post.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../../../application/validations/comment.validation';

const router = Router();

// Initialize dependencies
const commentRepository = new CommentRepository();
const blogPostRepository = new BlogPostRepository();
const commentService = new CommentService(commentRepository, blogPostRepository);
const commentController = new CommentController(commentService);

// Public routes
router.get('/post/:postId', commentController.getCommentsByPostId);

// Protected routes (require authentication)
router.use(authenticate);

// Routes for authenticated users
router.post(
    '/',
    validateBody(validators.createCommentSchema),
    commentController.createComment
);

router.put(
    '/:id',
    validateBody(validators.updateCommentSchema),
    commentController.updateComment
);

router.delete(
    '/:id',
    commentController.deleteComment
);

// Admin routes
router.get(
    '/pending',
    authorize(['admin']),
    commentController.getPendingComments
);

router.patch(
    '/:id/moderate',
    authorize(['admin']),
    validateBody(validators.moderateCommentSchema),
    commentController.moderateComment
);

export default router;