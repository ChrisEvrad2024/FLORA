// src/application/dtos/promotion/create-promotion.dto.ts
export interface CreatePromotionDto {
    name: string;
    description: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    minPurchaseAmount?: number;
    maxUses?: number;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    appliesTo: 'all' | 'categories' | 'products';
    categoryIds?: string[];
    productIds?: string[];
}