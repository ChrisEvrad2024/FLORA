// src/application/dtos/promotion/coupon-response.dto.ts
export interface CouponResponseDto {
    id: string;
    code: string;
    promotionId: string;
    promotion?: {
        name: string;
        discountType: string;
        discountValue: number;
    };
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    expiryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}