// src/application/dtos/promotion/promotion-response.dto.ts
export interface PromotionResponseDto {
    id: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    minimumPurchase?: number;
    maximumDiscount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    createdAt: Date;
    updatedAt: Date;
}