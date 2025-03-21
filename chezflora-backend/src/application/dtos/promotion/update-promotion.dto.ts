// src/application/dtos/promotion/update-promotion.dto.ts
export interface UpdatePromotionDto {
    name?: string;
    description?: string;
    type?: 'percentage' | 'fixed_amount';
    value?: number;
    minPurchaseAmount?: number;
    maxUses?: number;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
    appliesTo?: 'all' | 'categories' | 'products';
    categoryIds?: string[];
    productIds?: string[];
}