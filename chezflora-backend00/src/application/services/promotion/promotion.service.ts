// src/application/services/promotion/promotion.service.ts
import { PromotionServiceInterface } from '../../../interfaces/services/promotion-service.interface';
import { PromotionRepositoryInterface } from '../../../interfaces/repositories/promotion-repository.interface';
import { PromotionResponseDto } from '../../dtos/promotion/promotion-response.dto';
import { CreatePromotionDto } from '../../dtos/promotion/create-promotion.dto';
import { UpdatePromotionDto } from '../../dtos/promotion/update-promotion.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class PromotionService implements PromotionServiceInterface {
    constructor(private promotionRepository: PromotionRepositoryInterface) {}

    async getPromotionById(id: string): Promise<PromotionResponseDto> {
        const promotion = await this.promotionRepository.findById(id);
        
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        
        return promotion;
    }

    async getAllPromotions(page: number = 1, limit: number = 10, active?: boolean): Promise<{ promotions: PromotionResponseDto[], pagination: any }> {
        const { promotions, total } = await this.promotionRepository.findAll(page, limit, active);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            promotions,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async createPromotion(promotionData: CreatePromotionDto): Promise<PromotionResponseDto> {
        // Vérifications de base
        if (!promotionData.name || !promotionData.discountType || promotionData.discountValue === undefined) {
            throw new AppError('Name, discount type and discount value are required', 400);
        }
        
        // Validation du type de remise
        if (promotionData.discountType !== 'percentage' && promotionData.discountType !== 'fixed') {
            throw new AppError('Discount type must be either "percentage" or "fixed"', 400);
        }
        
        // Validation de la valeur de remise
        if (promotionData.discountValue <= 0) {
            throw new AppError('Discount value must be greater than 0', 400);
        }
        
        // Validation supplémentaire pour les remises en pourcentage
        if (promotionData.discountType === 'percentage' && promotionData.discountValue > 100) {
            throw new AppError('Percentage discount cannot exceed 100%', 400);
        }
        
        // Validation des dates
        if (!promotionData.startDate || !promotionData.endDate) {
            throw new AppError('Start date and end date are required', 400);
        }
        
        const startDate = new Date(promotionData.startDate);
        const endDate = new Date(promotionData.endDate);
        
        if (endDate <= startDate) {
            throw new AppError('End date must be after start date', 400);
        }
        
        // Création de la promotion
        return this.promotionRepository.create(promotionData);
    }

    async updatePromotion(id: string, promotionData: UpdatePromotionDto): Promise<PromotionResponseDto> {
        // Vérifier que la promotion existe
        const promotion = await this.promotionRepository.findById(id);
        
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        
        // Validation du type de remise
        if (promotionData.discountType && 
            promotionData.discountType !== 'percentage' && 
            promotionData.discountType !== 'fixed') {
            throw new AppError('Discount type must be either "percentage" or "fixed"', 400);
        }
        
        // Validation de la valeur de remise
        if (promotionData.discountValue !== undefined && promotionData.discountValue <= 0) {
            throw new AppError('Discount value must be greater than 0', 400);
        }
        
        // Validation supplémentaire pour les remises en pourcentage
        const finalDiscountType = promotionData.discountType || promotion.discountType;
        const finalDiscountValue = promotionData.discountValue !== undefined ? 
            promotionData.discountValue : promotion.discountValue;
        
        if (finalDiscountType === 'percentage' && finalDiscountValue > 100) {
            throw new AppError('Percentage discount cannot exceed 100%', 400);
        }
        
        // Validation des dates
        if (promotionData.startDate && promotionData.endDate) {
            const startDate = new Date(promotionData.startDate);
            const endDate = new Date(promotionData.endDate);
            
            if (endDate <= startDate) {
                throw new AppError('End date must be after start date', 400);
            }
        } else if (promotionData.startDate && !promotionData.endDate) {
            const startDate = new Date(promotionData.startDate);
            const endDate = promotion.endDate;
            
            if (endDate <= startDate) {
                throw new AppError('End date must be after new start date', 400);
            }
        } else if (!promotionData.startDate && promotionData.endDate) {
            const startDate = promotion.startDate;
            const endDate = new Date(promotionData.endDate);
            
            if (endDate <= startDate) {
                throw new AppError('New end date must be after start date', 400);
            }
        }
        
        // Mise à jour de la promotion
        const updatedPromotion = await this.promotionRepository.update(id, promotionData);
        
        if (!updatedPromotion) {
            throw new AppError('Failed to update promotion', 500);
        }
        
        return updatedPromotion;
    }

    async deletePromotion(id: string): Promise<boolean> {
        const promotion = await this.promotionRepository.findById(id);
        
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        
        return this.promotionRepository.delete(id);
    }

    async getActivePromotions(): Promise<PromotionResponseDto[]> {
        return this.promotionRepository.findActivePromotions();
    }

    async getApplicablePromotions(amount: number, productIds?: string[], categoryIds?: string[]): Promise<PromotionResponseDto[]> {
        if (amount < 0) {
            throw new AppError('Amount must be a positive number', 400);
        }
        
        return this.promotionRepository.findApplicablePromotions(amount, productIds, categoryIds);
    }
}