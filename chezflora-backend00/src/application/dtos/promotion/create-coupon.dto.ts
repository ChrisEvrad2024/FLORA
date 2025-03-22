// src/application/dtos/promotion/create-coupon.dto.ts
export interface CreateCouponDto {
    code?: string;  // Si non fourni, sera généré automatiquement
    promotionId: string;
    usageLimit?: number;
    isActive?: boolean;
    expiryDate?: Date;
}