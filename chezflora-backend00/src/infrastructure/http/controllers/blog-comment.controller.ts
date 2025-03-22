import { Request, Response, NextFunction } from 'express';
import { BlogCommentService } from '../../../application/services/blog/blog-comment.service';
import { AppError } from '../../http/middlewares/error.middleware';

export class BlogCommentController {
    constructor(private blogCommentService: BlogCommentService) {}

    getCommentsByPostId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId } = req.params;
            const status = req.query.status as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const { comments, total, totalPages } = await this.blogCommentService.getCommentsByPostId(postId, {
                status,
                page,
                limit
            });
            
            res.status(200).json({
                success: true,
                message: 'Comments retrieved successfully',
                data: comments,
                pagination: {
                    current: page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const commentData = req.body;
            const comment = await this.blogCommentService.createComment(userId, commentData);
            
            res.status(201).json({
                success: true,
                message: 'Comment created successfully',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    };

    approveComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const comment = await this.blogCommentService.approveComment(id);
            
            res.status(200).json({
                success: true,
                message: 'Comment approved successfully',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    };

    rejectComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const comment = await this.blogCommentService.rejectComment(id);
            
            res.status(200).json({
                success: true,
                message: 'Comment rejected successfully',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    };

    deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.blogCommentService.deleteComment(id);
            
            res.status(200).json({
                success: true,
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}