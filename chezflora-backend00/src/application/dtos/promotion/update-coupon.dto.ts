// src/application/dtos/promotion/update-coupon.dto.ts
export interface UpdateCouponDto {
    promotionId?: string;
    usageLimit?: number;
    isActive?: boolean;
    expiryDate?: Date;
}