// src/infrastructure/http/controllers/promotion.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PromotionServiceInterface } from '../../../interfaces/services/promotion-service.interface';
import { CreatePromotionDto } from '../../../application/dtos/promotion/create-promotion.dto';
import { UpdatePromotionDto } from '../../../application/dtos/promotion/update-promotion.dto';
import { AppError } from '../middlewares/error.middleware';

export class PromotionController {
    constructor(private promotionService: PromotionServiceInterface) {}

    getPromotionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            const promotion = await this.promotionService.getPromotionById(id);
            
            res.status(200).json({
                success: true,
                message: 'Promotion retrieved successfully',
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    };

    getAllPromotions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            
            const result = await this.promotionService.getAllPromotions(page, limit, active);
            
            res.status(200).json({
                success: true,
                message: 'Promotions retrieved successfully',
                data: result.promotions,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    createPromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const promotionData: CreatePromotionDto = req.body;
            
            // Convertir les dates en objets Date si nécessaire
            if (typeof promotionData.startDate === 'string') {
                promotionData.startDate = new Date(promotionData.startDate);
            }
            
            if (typeof promotionData.endDate === 'string') {
                promotionData.endDate = new Date(promotionData.endDate);
            }
            
            const promotion = await this.promotionService.createPromotion(promotionData);
            
            res.status(201).json({
                success: true,
                message: 'Promotion created successfully',
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    };

    updatePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const id = req.params.id;
            const promotionData: UpdatePromotionDto = req.body;
            
            // Convertir les dates en objets Date si nécessaire
            if (typeof promotionData.startDate === 'string') {
                promotionData.startDate = new Date(promotionData.startDate);
            }
            
            if (typeof promotionData.endDate === 'string') {
                promotionData.endDate = new Date(promotionData.endDate);
            }
            
            const promotion = await this.promotionService.updatePromotion(id, promotionData);
            
            res.status(200).json({
                success: true,
                message: 'Promotion updated successfully',
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    };

    deletePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const id = req.params.id;
            
            await this.promotionService.deletePromotion(id);
            
            res.status(200).json({
                success: true,
                message: 'Promotion deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getActivePromotions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const promotions = await this.promotionService.getActivePromotions();
            
            res.status(200).json({
                success: true,
                message: 'Active promotions retrieved successfully',
                data: promotions
            });
        } catch (error) {
            next(error);
        }
    };

    getApplicablePromotions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const amount = req.query.amount ? parseFloat(req.query.amount as string) : 0;
            const productIds = req.query.productIds ? (req.query.productIds as string).split(',') : undefined;
            const categoryIds = req.query.categoryIds ? (req.query.categoryIds as string).split(',') : undefined;
            
            const promotions = await this.promotionService.getApplicablePromotions(amount, productIds, categoryIds);
            
            res.status(200).json({
                success: true,
                message: 'Applicable promotions retrieved successfully',
                data: promotions
            });
        } catch (error) {
            next(error);
        }
    };
}