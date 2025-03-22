// src/application/dtos/promotion/create-promotion.dto.ts
export interface CreatePromotionDto {
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    minimumPurchase?: number;
    maximumDiscount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
}