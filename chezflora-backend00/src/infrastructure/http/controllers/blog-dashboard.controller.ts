// src/infrastructure/http/controllers/blog-dashboard.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogDashboardService } from '../../../application/services/blog/blog-dashboard.service';

export class BlogDashboardController {
    constructor(private blogDashboardService: BlogDashboardService) {}

    getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const summary = await this.blogDashboardService.getDashboardSummary();
            
            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    };

    getQuickSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const summary = await this.blogDashboardService.getQuickSummary();
            
            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    };

    getPostStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const timeRange = req.query.timeRange as string || 'month';
            
            const statistics = await this.blogDashboardService.getPostStatistics(timeRange);
            
            res.status(200).json({
                success: true,
                data: statistics
            });
        } catch (error) {
            next(error);
        }
    };

    getCommentStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const timeRange = req.query.timeRange as string || 'month';
            
            const statistics = await this.blogDashboardService.getCommentStatistics(timeRange);
            
            res.status(200).json({
                success: true,
                data: statistics
            });
        } catch (error) {
            next(error);
        }
    };
}