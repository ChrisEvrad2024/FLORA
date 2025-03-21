// src/infrastructure/http/controllers/comment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CommentServiceInterface } from '../../../interfaces/services/comment-service.interface';
import { CreateCommentDto } from '../../../application/dtos/blog/create-comment.dto';
import { UpdateCommentDto } from '../../../application/dtos/blog/update-comment.dto';
import { AppError } from '../middlewares/error.middleware';

export class CommentController {
    constructor(private commentService: CommentServiceInterface) {}

    getCommentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            const comment = await this.commentService.getCommentById(id);
            
            res.status(200).json({
                success: true,
                message: 'Comment retrieved successfully',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    };

    getCommentsByPostId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const postId = req.params.postId;
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            
            const result = await this.commentService.getCommentsByPostId(postId, page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Comments retrieved successfully',
                data: result.comments,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    getPendingComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            
            const result = await this.commentService.getPendingComments(page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Pending comments retrieved successfully',
                data: result.comments,
                pagination: result.pagination
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
            
            const commentData: CreateCommentDto = req.body;
            const comment = await this.commentService.createComment(userId, commentData);
            
            res.status(201).json({
                success: true,
                message: 'Comment created successfully. It will be visible after moderation.',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    };

    updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const commentData: UpdateCommentDto = req.body;
            const comment = await this.commentService.updateComment(id, userId, commentData);
            
            res.status(200).json({
                success: true,
                message: 'Comment updated successfully',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    };

    deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            await this.commentService.deleteComment(id, userId);
            
            res.status(200).json({
                success: true,
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    moderateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const { status } = req.body;
            
            if (status !== 'approved' && status !== 'rejected') {
                throw new AppError('Invalid status. Must be either "approved" or "rejected"', 400);
            }
            
            const comment = await this.commentService.moderateComment(id, status);
            
            res.status(200).json({
                success: true,
                message: `Comment ${status} successfully`,
                data: comment
            });
        } catch (error) {
            next(error);
        }
    };
}