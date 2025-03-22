// src/interfaces/repositories/coupon-repository.interface.ts
import { CouponResponseDto } from '../../application/dtos/promotion/coupon-response.dto';
import { CreateCouponDto } from '../../application/dtos/promotion/create-coupon.dto';
import { UpdateCouponDto } from '../../application/dtos/promotion/update-coupon.dto';
import { CouponVerificationResultDto } from '../../application/dtos/promotion/coupon-verification-result.dto';

export interface CouponRepositoryInterface {
    findById(id: string): Promise<CouponResponseDto | null>;
    findByCode(code: string): Promise<CouponResponseDto | null>;
    findAll(page?: number, limit?: number, active?: boolean): Promise<{ coupons: CouponResponseDto[], total: number }>;
    create(couponData: CreateCouponDto): Promise<CouponResponseDto>;
    update(id: string, couponData: UpdateCouponDto): Promise<CouponResponseDto | null>;
    delete(id: string): Promise<boolean>;
    verifyCoupon(code: string, amount?: number, productIds?: string[], categoryIds?: string[]): Promise<CouponVerificationResultDto>;
    incrementUsage(id: string): Promise<boolean>;
    generateUniqueCode(length?: number): Promise<string>;
}