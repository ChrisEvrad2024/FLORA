// src/application/dtos/promotion/verify-coupon.dto.ts
export interface VerifyCouponDto {
    code: string;
    amount?: number;
    productIds?: string[];
    categoryIds?: string[];
}