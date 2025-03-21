// src/infrastructure/http/controllers/blog-scheduler.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogSchedulerService } from '../../../application/services/blog/blog-scheduler.service';
import { AppError } from '../middlewares/error.middleware';

export class BlogSchedulerController {
    constructor(private blogSchedulerService: BlogSchedulerService) {}

    scheduleBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const postId = req.params.id;
            const { scheduledPublishDate } = req.body;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            if (!scheduledPublishDate) {
                throw new AppError('Scheduled publish date is required', 400);
            }
            
            const scheduledDate = new Date(scheduledPublishDate);
            
            await this.blogSchedulerService.scheduleBlogPost(postId, scheduledDate);
            
            res.status(200).json({
                success: true,
                message: 'Blog post scheduled successfully',
                data: {
                    postId,
                    scheduledPublishDate: scheduledDate
                }
            });
        } catch (error) {
            next(error);
        }
    };

    cancelScheduledPublication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const postId = req.params.id;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            await this.blogSchedulerService.cancelScheduledPublication(postId);
            
            res.status(200).json({
                success: true,
                message: 'Scheduled publication cancelled successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    publishScheduledPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const publishedCount = await this.blogSchedulerService.publishScheduledPosts();
            
            res.status(200).json({
                success: true,
                message: `${publishedCount} scheduled posts published successfully`
            });
        } catch (error) {
            next(error);
        }
    };

    getScheduledPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            
            const { posts, total } = await this.blogSchedulerService.getScheduledPosts(page, limit);
            
            const totalPages = Math.ceil(total / limit);
            
            res.status(200).json({
                success: true,
                message: 'Scheduled posts retrieved successfully',
                data: posts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };
}