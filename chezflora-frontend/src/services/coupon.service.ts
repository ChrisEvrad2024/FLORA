// src/services/coupon.service.ts
import apiService from './api';

interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minimumPurchase?: number;
    expiryDate?: string;
    maxUses?: number;
    usesCount: number;
    isActive: boolean;
    categories?: string[];
    products?: string[];
}

interface CouponResponse {
    success: boolean;
    message: string;
    data: Coupon;
}

interface CouponsResponse {
    success: boolean;
    message: string;
    data: {
        coupons: Coupon[];
        totalCount: number;
        totalPages: number;
    }
}

interface CouponValidationResponse {
    success: boolean;
    message: string;
    data: {
        valid: boolean;
        coupon?: Coupon;
        discount?: number;
    }
}

interface CouponParams {
    page?: number;
    limit?: number;
    isActive?: boolean;
}

class CouponService {
    // Validate coupon code
    async validateCoupon(code: string, cartTotal: number): Promise<CouponValidationResponse> {
        return apiService.post<CouponValidationResponse>('/coupons/validate', {
            code,
            cartTotal
        });
    }

    // Admin methods
    async getCoupons(params: CouponParams = {}): Promise<CouponsResponse> {
        return apiService.get<CouponsResponse>('/coupons', { params });
    }

    async getCouponById(id: string): Promise<CouponResponse> {
        return apiService.get<CouponResponse>(`/coupons/${id}`);
    }

    async getCouponByCode(code: string): Promise<CouponResponse> {
        return apiService.get<CouponResponse>('/coupons/code/' + code);
    }

    async createCoupon(couponData: Omit<Coupon, 'id' | 'usesCount'>): Promise<CouponResponse> {
        return apiService.post<CouponResponse>('/coupons', couponData);
    }

    async updateCoupon(id: string, couponData: Partial<Omit<Coupon, 'id' | 'usesCount'>>): Promise<CouponResponse> {
        return apiService.put<CouponResponse>(`/coupons/${id}`, couponData);
    }

    async toggleCouponStatus(id: string, isActive: boolean): Promise<CouponResponse> {
        return apiService.patch<CouponResponse>(`/coupons/${id}/status`, { isActive });
    }

    async deleteCoupon(id: string): Promise<any> {
        return apiService.delete(`/coupons/${id}`);
    }
}

export const couponService = new CouponService();
export default couponService;