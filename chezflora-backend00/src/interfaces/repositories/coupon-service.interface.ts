// src/interfaces/services/coupon-service.interface.ts
import { CouponResponseDto } from '../../application/dtos/promotion/coupon-response.dto';
import { CreateCouponDto } from '../../application/dtos/promotion/create-coupon.dto';
import { UpdateCouponDto } from '../../application/dtos/promotion/update-coupon.dto';
import { CouponVerificationResultDto } from '../../application/dtos/promotion/coupon-verification-result.dto';
import { VerifyCouponDto } from '../../application/dtos/promotion/verify-coupon.dto';

export interface CouponServiceInterface {
    getCouponById(id: string): Promise<CouponResponseDto>;
    getCouponByCode(code: string): Promise<CouponResponseDto>;
    getAllCoupons(page?: number, limit?: number, active?: boolean): Promise<{ coupons: CouponResponseDto[], pagination: any }>;
    createCoupon(couponData: CreateCouponDto): Promise<CouponResponseDto>;
    updateCoupon(id: string, couponData: UpdateCouponDto): Promise<CouponResponseDto>;
    deleteCoupon(id: string): Promise<boolean>;
    verifyCoupon(data: VerifyCouponDto): Promise<CouponVerificationResultDto>;
    applyCoupon(id: string): Promise<boolean>;
    generateCouponCode(): Promise<string>;
}