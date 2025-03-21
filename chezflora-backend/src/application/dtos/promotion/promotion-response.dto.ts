// src/application/dtos/promotion/promotion-response.dto.ts
export interface PromotionResponseDto {
    id: string;
    name: string;
    description: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    minPurchaseAmount?: number;
    maxUses?: number;
    usesCount: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    appliesTo: 'all' | 'categories' | 'products';
    categoryIds?: string[];
    productIds?: string[];
    createdAt: Date;
    updatedAt: Date;
}