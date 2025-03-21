// src/interfaces/services/promotion-service.interface.ts
import { PromotionResponseDto } from '../../application/dtos/promotion/promotion-response.dto';
import { CreatePromotionDto } from '../../application/dtos/promotion/create-promotion.dto';
import { UpdatePromotionDto } from '../../application/dtos/promotion/update-promotion.dto';

export interface PromotionServiceInterface {
    getPromotionById(id: string): Promise<PromotionResponseDto>;
    getAllPromotions(page?: number, limit?: number, isActive?: boolean): Promise<{ promotions: PromotionResponseDto[], pagination: any }>;
    createPromotion(promotionData: CreatePromotionDto): Promise<PromotionResponseDto>;
    updatePromotion(id: string, promotionData: UpdatePromotionDto): Promise<PromotionResponseDto>;
    deletePromotion(id: string): Promise<boolean>;
    applyPromotionToCart(code: string, cartId: string): Promise<{ discount: number, newTotal: number }>;
    validatePromotion(code: string, cartTotal: number): Promise<boolean>;
    getActivePromotions(): Promise<PromotionResponseDto[]>;
    exportPromotionCodesReport(): Promise<string>;
}