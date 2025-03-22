// src/application/dtos/promotion/update-promotion.dto.ts
export interface UpdatePromotionDto {
    name?: string;
    description?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
    minimumPurchase?: number;
    maximumDiscount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
}