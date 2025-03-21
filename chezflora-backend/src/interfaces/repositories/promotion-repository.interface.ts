// src/interfaces/repositories/promotion-repository.interface.ts
import { PromotionResponseDto } from '../../application/dtos/promotion/promotion-response.dto';
import { CreatePromotionDto } from '../../application/dtos/promotion/create-promotion.dto';
import { UpdatePromotionDto } from '../../application/dtos/promotion/update-promotion.dto';

export interface PromotionRepositoryInterface {
    findById(id: string): Promise<PromotionResponseDto | null>;
    findByCode(code: string): Promise<PromotionResponseDto | null>;
    findAll(page?: number, limit?: number, isActive?: boolean): Promise<{ promotions: PromotionResponseDto[], total: number }>;
    create(promotionData: CreatePromotionDto): Promise<PromotionResponseDto>;
    update(id: string, promotionData: UpdatePromotionDto): Promise<PromotionResponseDto | null>;
    delete(id: string): Promise<boolean>;
    isPromotionValid(code: string, cartTotal: number): Promise<boolean>;
    incrementUsesCount(id: string): Promise<boolean>;
    associateCategoriesWithPromotion(promotionId: string, categoryIds: string[]): Promise<void>;
    associateProductsWithPromotion(promotionId: string, productIds: string[]): Promise<void>;
    removeAllCategoryAssociations(promotionId: string): Promise<void>;
    removeAllProductAssociations(promotionId: string): Promise<void>;
    getActivePromotions(): Promise<PromotionResponseDto[]>;
    getApplicablePromotionsForCart(cartItems: { productId: string, categoryId: string, total: number }[], cartTotal: number): Promise<PromotionResponseDto[]>;
}