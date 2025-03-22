// src/infrastructure/http/controllers/blog-statistics.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogStatisticsServiceInterface } from '../../../interfaces/services/blog-statistics-service.interface';

export class BlogStatisticsController {
    constructor(private blogStatisticsService: BlogStatisticsServiceInterface) {}

    getPostCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { categoryId, status, timeRange } = req.query;
            
            const count = await this.blogStatisticsService.getPostCount({
                categoryId: categoryId as string,
                status: status as string,
                timeRange: timeRange as string
            });
            
            res.status(200).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            next(error);
        }
    };

    getCommentCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId, status, timeRange } = req.query;
            
            const count = await this.blogStatisticsService.getCommentCount({
                postId: postId as string,
                status: status as string,
                timeRange: timeRange as string
            });
            
            res.status(200).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            next(error);
        }
    };

    getViewCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId, timeRange } = req.query;
            
            const count = await this.blogStatisticsService.getViewCount({
                postId: postId as string,
                timeRange: timeRange as string
            });
            
            res.status(200).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            next(error);
        }
    };

    getMostViewedPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const timeRange = req.query.timeRange as string;
            
            const posts = await this.blogStatisticsService.getMostViewedPosts(limit, timeRange);
            
            res.status(200).json({
                success: true,
                data: posts
            });
        } catch (error) {
            next(error);
        }
    };

    getMostCommentedPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const timeRange = req.query.timeRange as string;
            
            const posts = await this.blogStatisticsService.getMostCommentedPosts(limit, timeRange);
            
            res.status(200).json({
                success: true,
                data: posts
            });
        } catch (error) {
            next(error);
        }
    };

    getCategoryDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const distribution = await this.blogStatisticsService.getCategoryDistribution();
            
            res.status(200).json({
                success: true,
                data: distribution
            });
        } catch (error) {
            next(error);
        }
    };

    getPostsPerMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const months = parseInt(req.query.months as string) || 12;
            
            const data = await this.blogStatisticsService.getPostsPerMonth(months);
            
            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    };

    getCommentsPerMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const months = parseInt(req.query.months as string) || 12;
            
            const data = await this.blogStatisticsService.getCommentsPerMonth(months);
            
            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    };

    // Endpoint spécial pour suivre les vues manuellement (si nécessaire)
    trackView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
            const metadata = req.body.metadata;
            
            await this.blogStatisticsService.trackView(postId, userId, metadata);
            
            res.status(200).json({
                success: true,
                message: 'View tracked successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}

