// src/application/services/promotion/coupon.service.ts
import { CouponServiceInterface } from '../../../interfaces/services/coupon-service.interface';
import { CouponRepositoryInterface } from '../../../interfaces/repositories/coupon-repository.interface';
import { PromotionRepositoryInterface } from '../../../interfaces/repositories/promotion-repository.interface';
import { CouponResponseDto } from '../../dtos/promotion/coupon-response.dto';
import { CreateCouponDto } from '../../dtos/promotion/create-coupon.dto';
import { UpdateCouponDto } from '../../dtos/promotion/update-coupon.dto';
import { CouponVerificationResultDto } from '../../dtos/promotion/coupon-verification-result.dto';
import { VerifyCouponDto } from '../../dtos/promotion/verify-coupon.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class CouponService implements CouponServiceInterface {
    constructor(
        private couponRepository: CouponRepositoryInterface,
        private promotionRepository: PromotionRepositoryInterface
    ) {}

    async getCouponById(id: string): Promise<CouponResponseDto> {
        const coupon = await this.couponRepository.findById(id);
        
        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }
        
        return coupon;
    }

    async getCouponByCode(code: string): Promise<CouponResponseDto> {
        const coupon = await this.couponRepository.findByCode(code);
        
        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }
        
        return coupon;
    }

    async getAllCoupons(page: number = 1, limit: number = 10, active?: boolean): Promise<{ coupons: CouponResponseDto[], pagination: any }> {
        const { coupons, total } = await this.couponRepository.findAll(page, limit, active);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            coupons,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async createCoupon(couponData: CreateCouponDto): Promise<CouponResponseDto> {
        // Vérifier que la promotion existe
        const promotion = await this.promotionRepository.findById(couponData.promotionId);
        
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        
        // Vérifier le code s'il est fourni
        if (couponData.code) {
            // Vérifier le format du code (lettres majuscules, chiffres, tirets et underscores uniquement)
            const codeRegex = /^[A-Z0-9_-]+$/;
            if (!codeRegex.test(couponData.code)) {
                throw new AppError('Coupon code must contain only uppercase letters, numbers, hyphens and underscores', 400);
            }
            
            // Vérifier que le code n'existe pas déjà
            const existingCoupon = await this.couponRepository.findByCode(couponData.code);
            if (existingCoupon) {
                throw new AppError('Coupon code already exists', 400);
            }
        }
        
        // Vérifier la limite d'utilisation si fournie
        if (couponData.usageLimit !== undefined && couponData.usageLimit <= 0) {
            throw new AppError('Usage limit must be a positive number', 400);
        }
        
        // Vérifier la date d'expiration si fournie
        if (couponData.expiryDate) {
            const expiryDate = new Date(couponData.expiryDate);
            const now = new Date();
            
            if (expiryDate <= now) {
                throw new AppError('Expiry date must be in the future', 400);
            }
        }
        
        // Créer le coupon
        return this.couponRepository.create(couponData);
    }

    async updateCoupon(id: string, couponData: UpdateCouponDto): Promise<CouponResponseDto> {
        // Vérifier que le coupon existe
        const coupon = await this.couponRepository.findById(id);
        
        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }
        
        // Vérifier que la promotion existe si fournie
        if (couponData.promotionId) {
            const promotion = await this.promotionRepository.findById(couponData.promotionId);
            
            if (!promotion) {
                throw new AppError('Promotion not found', 404);
            }
        }
        
        // Vérifier la limite d'utilisation si fournie
        if (couponData.usageLimit !== undefined && couponData.usageLimit <= 0) {
            throw new AppError('Usage limit must be a positive number', 400);
        }
        
        // Vérifier la date d'expiration si fournie
        if (couponData.expiryDate) {
            const expiryDate = new Date(couponData.expiryDate);
            const now = new Date();
            
            if (expiryDate <= now) {
                throw new AppError('Expiry date must be in the future', 400);
            }
        }
        
        // Mettre à jour le coupon
        const updatedCoupon = await this.couponRepository.update(id, couponData);
        
        if (!updatedCoupon) {
            throw new AppError('Failed to update coupon', 500);
        }
        
        return updatedCoupon;
    }

    async deleteCoupon(id: string): Promise<boolean> {
        const coupon = await this.couponRepository.findById(id);
        
        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }
        
        return this.couponRepository.delete(id);
    }

    async verifyCoupon(data: VerifyCouponDto): Promise<CouponVerificationResultDto> {
        if (!data.code) {
            throw new AppError('Coupon code is required', 400);
        }
        
        return this.couponRepository.verifyCoupon(data.code, data.amount, data.productIds, data.categoryIds);
    }

    async applyCoupon(id: string): Promise<boolean> {
        const coupon = await this.couponRepository.findById(id);
        
        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }
        
        // Vérifier si le coupon est actif
        if (!coupon.isActive) {
            throw new AppError('Coupon is inactive', 400);
        }
        
        // Vérifier la date d'expiration
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            throw new AppError('Coupon has expired', 400);
        }
        
        // Vérifier la limite d'utilisation
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new AppError('Coupon usage limit has been reached', 400);
        }
        
        // Incrémenter le nombre d'utilisations
        return this.couponRepository.incrementUsage(id);
    }

    async generateCouponCode(): Promise<string> {
        return this.couponRepository.generateUniqueCode();
    }
}