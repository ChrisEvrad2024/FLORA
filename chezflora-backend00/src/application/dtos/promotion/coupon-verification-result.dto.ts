// src/application/dtos/promotion/coupon-verification-result.dto.ts
export interface CouponVerificationResultDto {
    valid: boolean;
    message?: string;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    couponId?: string;
}