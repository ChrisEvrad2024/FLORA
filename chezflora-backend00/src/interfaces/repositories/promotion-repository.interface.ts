// src/interfaces/repositories/promotion-repository.interface.ts
import { PromotionResponseDto } from '../../application/dtos/promotion/promotion-response.dto';
import { CreatePromotionDto } from '../../application/dtos/promotion/create-promotion.dto';
import { UpdatePromotionDto } from '../../application/dtos/promotion/update-promotion.dto';

export interface PromotionRepositoryInterface {
    findById(id: string): Promise<PromotionResponseDto | null>;
    findAll(page?: number, limit?: number, active?: boolean): Promise<{ promotions: PromotionResponseDto[], total: number }>;
    create(promotionData: CreatePromotionDto): Promise<PromotionResponseDto>;
    update(id: string, promotionData: UpdatePromotionDto): Promise<PromotionResponseDto | null>;
    delete(id: string): Promise<boolean>;
    findActivePromotions(): Promise<PromotionResponseDto[]>;
    findApplicablePromotions(amount: number, productIds?: string[], categoryIds?: string[]): Promise<PromotionResponseDto[]>;
}