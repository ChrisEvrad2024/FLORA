// src/infrastructure/repositories/coupon.repository.ts
import { CouponRepositoryInterface } from '../../interfaces/repositories/coupon-repository.interface';
import { CouponResponseDto } from '../../application/dtos/promotion/coupon-response.dto';
import { CreateCouponDto } from '../../application/dtos/promotion/create-coupon.dto';
import { UpdateCouponDto } from '../../application/dtos/promotion/update-coupon.dto';
import { CouponVerificationResultDto } from '../../application/dtos/promotion/coupon-verification-result.dto';
import Coupon from '../database/models/coupon.model';
import Promotion from '../database/models/promotion.model';
import { Op } from 'sequelize';
import { generateRandomString } from '../../application/utils/string.util';

export class CouponRepository implements CouponRepositoryInterface {
    async findById(id: string): Promise<CouponResponseDto | null> {
        try {
            const coupon = await Coupon.findByPk(id, {
                include: [{
                    model: Promotion,
                    attributes: ['name', 'discountType', 'discountValue']
                }]
            });
            
            if (!coupon) {
                return null;
            }
            
            return this.mapToResponseDto(coupon);
        } catch (error) {
            console.error('Error finding coupon by ID:', error);
            throw error;
        }
    }

    async findByCode(code: string): Promise<CouponResponseDto | null> {
        try {
            const coupon = await Coupon.findOne({
                where: { code },
                include: [{
                    model: Promotion,
                    attributes: ['name', 'discountType', 'discountValue']
                }]
            });
            
            if (!coupon) {
                return null;
            }
            
            return this.mapToResponseDto(coupon);
        } catch (error) {
            console.error('Error finding coupon by code:', error);
            throw error;
        }
    }

    async findAll(page: number = 1, limit: number = 10, active?: boolean): Promise<{ coupons: CouponResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            const where: any = {};
            
            if (active !== undefined) {
                where.isActive = active;
            }
            
            const { count, rows } = await Coupon.findAndCountAll({
                where,
                include: [{
                    model: Promotion,
                    attributes: ['name', 'discountType', 'discountValue']
                }],
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            
            const coupons = rows.map(coupon => this.mapToResponseDto(coupon));
            
            return {
                coupons,
                total: count
            };
        } catch (error) {
            console.error('Error finding all coupons:', error);
            throw error;
        }
    }

    async create(couponData: CreateCouponDto): Promise<CouponResponseDto> {
        try {
            // Vérifier si la promotion existe
            const promotion = await Promotion.findByPk(couponData.promotionId);
            if (!promotion) {
                throw new Error('Promotion not found');
            }
            
            // Générer un code unique si non fourni
            if (!couponData.code) {
                couponData.code = await this.generateUniqueCode();
            } else {
                // Vérifier si le code existe déjà
                const existingCoupon = await Coupon.findOne({ where: { code: couponData.code } });
                if (existingCoupon) {
                    throw new Error('Coupon code already exists');
                }
            }
            
            // Créer le coupon - conversion explicite du type pour satisfaire TypeScript
            const coupon = await Coupon.create(couponData as any);
            
            // Retourner avec les détails de la promotion
            return this.findById(coupon.id) as Promise<CouponResponseDto>;
        } catch (error) {
            console.error('Error creating coupon:', error);
            throw error;
        }
    }

    async update(id: string, couponData: UpdateCouponDto): Promise<CouponResponseDto | null> {
        try {
            const coupon = await Coupon.findByPk(id);
            if (!coupon) {
                return null;
            }
            
            if (couponData.promotionId) {
                // Vérifier si la promotion existe
                const promotion = await Promotion.findByPk(couponData.promotionId);
                if (!promotion) {
                    throw new Error('Promotion not found');
                }
            }
            
            await coupon.update(couponData);
            
            // Retourner avec les détails de la promotion
            return this.findById(id) as Promise<CouponResponseDto>;
        } catch (error) {
            console.error('Error updating coupon:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const coupon = await Coupon.findByPk(id);
            if (!coupon) {
                return false;
            }
            
            await coupon.destroy();
            return true;
        } catch (error) {
            console.error('Error deleting coupon:', error);
            throw error;
        }
    }

    async verifyCoupon(code: string, amount?: number, productIds?: string[], categoryIds?: string[]): Promise<CouponVerificationResultDto> {
        try {
            // Trouver le coupon
            const coupon = await Coupon.findOne({
                where: { code },
                include: [{
                    model: Promotion,
                    required: true
                }]
            });
            
            // Vérifier si le coupon existe
            if (!coupon) {
                return {
                    valid: false,
                    message: 'Coupon not found'
                };
            }
            
            // Vérifier si le coupon est actif
            if (!coupon.isActive) {
                return {
                    valid: false,
                    message: 'Coupon is inactive'
                };
            }
            
            // Vérifier la date d'expiration
            if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
                return {
                    valid: false,
                    message: 'Coupon has expired'
                };
            }
            
            // Vérifier la limite d'utilisation
            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
                return {
                    valid: false,
                    message: 'Coupon usage limit has been reached'
                };
            }
            
            // Vérifier la promotion associée
            const promotion = coupon.promotion;
            
            // Vérifier si la promotion est active
            if (!promotion.isActive) {
                return {
                    valid: false,
                    message: 'Associated promotion is inactive'
                };
            }
            
            // Vérifier les dates de la promotion
            const currentDate = new Date();
            if (currentDate < promotion.startDate || currentDate > promotion.endDate) {
                return {
                    valid: false,
                    message: 'Promotion period is not active'
                };
            }
            
            // Vérifier le montant minimum d'achat
            if (amount !== undefined && promotion.minimumPurchase && amount < promotion.minimumPurchase) {
                return {
                    valid: false,
                    message: `Minimum purchase amount of ${promotion.minimumPurchase} required`
                };
            }
            
            // Vérifier l'applicabilité aux produits
            if (productIds && productIds.length > 0 && promotion.applicableProducts && promotion.applicableProducts.length > 0) {
                const hasApplicableProduct = productIds.some(id => promotion.applicableProducts!.includes(id));
                if (!hasApplicableProduct) {
                    return {
                        valid: false,
                        message: 'Coupon is not applicable to any of the selected products'
                    };
                }
            }
            
            // Vérifier l'applicabilité aux catégories
            if (categoryIds && categoryIds.length > 0 && promotion.applicableCategories && promotion.applicableCategories.length > 0) {
                const hasApplicableCategory = categoryIds.some(id => promotion.applicableCategories!.includes(id));
                if (!hasApplicableCategory) {
                    return {
                        valid: false,
                        message: 'Coupon is not applicable to any of the selected categories'
                    };
                }
            }
            
            // Le coupon est valide
            return {
                valid: true,
                message: 'Coupon is valid',
                discount: promotion.discountValue,
                discountType: promotion.discountType,
                couponId: coupon.id
            };
        } catch (error) {
            console.error('Error verifying coupon:', error);
            throw error;
        }
    }

    async incrementUsage(id: string): Promise<boolean> {
        try {
            const coupon = await Coupon.findByPk(id);
            if (!coupon) {
                return false;
            }
            
            await coupon.update({
                usageCount: coupon.usageCount + 1
            });
            
            return true;
        } catch (error) {
            console.error('Error incrementing coupon usage:', error);
            throw error;
        }
    }

    async generateUniqueCode(length: number = 8): Promise<string> {
        try {
            let code;
            let exists = true;
            
            // Générer un code jusqu'à ce qu'on trouve un code unique
            while (exists) {
                code = generateRandomString(length).toUpperCase();
                const existingCoupon = await Coupon.findOne({ where: { code } });
                if (!existingCoupon) {
                    exists = false;
                }
            }
            
            return code as string;
        } catch (error) {
            console.error('Error generating unique coupon code:', error);
            throw error;
        }
    }

    private mapToResponseDto(coupon: any): CouponResponseDto {
        return {
            id: coupon.id,
            code: coupon.code,
            promotionId: coupon.promotionId,
            promotion: coupon.promotion ? {
                name: coupon.promotion.name,
                discountType: coupon.promotion.discountType,
                discountValue: coupon.promotion.discountValue
            } : undefined,
            usageLimit: coupon.usageLimit,
            usageCount: coupon.usageCount,
            isActive: coupon.isActive,
            expiryDate: coupon.expiryDate,
            createdAt: coupon.createdAt,
            updatedAt: coupon.updatedAt
        };
    }
}