// src/infrastructure/http/controllers/newsletter-export.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NewsletterExportServiceInterface } from '../../../interfaces/services/newsletter-export-service.interface';
import { NewsletterExportDto } from '../../../application/dtos/promotion/newsletter-export.dto';
import { AppError } from '../middlewares/error.middleware';

export class NewsletterExportController {
    constructor(private newsletterExportService: NewsletterExportServiceInterface) {}

    exportSubscribers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const exportOptions: NewsletterExportDto = {
                format: req.body.format as 'csv' | 'excel' | 'json',
                activeOnly: req.body.activeOnly !== undefined ? req.body.activeOnly : true
            };
            
            const result = await this.newsletterExportService.exportSubscribers(exportOptions);
            
            res.status(200).json({
                success: true,
                message: 'Newsletter subscribers exported successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getSubscribersCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const activeOnly = req.query.activeOnly !== undefined ? req.query.activeOnly === 'true' : true;
            
            const count = await this.newsletterExportService.getSubscribersCount(activeOnly);
            
            res.status(200).json({
                success: true,
                message: 'Newsletter subscribers count retrieved successfully',
                data: { count }
            });
        } catch (error) {
            next(error);
        }
    };
}