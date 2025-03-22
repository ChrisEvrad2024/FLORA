// src/infrastructure/http/controllers/coupon.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CouponServiceInterface } from '../../../interfaces/services/coupon-service.interface';
import { CreateCouponDto } from '../../../application/dtos/promotion/create-coupon.dto';
import { UpdateCouponDto } from '../../../application/dtos/promotion/update-coupon.dto';
import { VerifyCouponDto } from '../../../application/dtos/promotion/verify-coupon.dto';
import { AppError } from '../middlewares/error.middleware';

export class CouponController {
    constructor(private couponService: CouponServiceInterface) {}

    getCouponById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            const coupon = await this.couponService.getCouponById(id);
            
            res.status(200).json({
                success: true,
                message: 'Coupon retrieved successfully',
                data: coupon
            });
        } catch (error) {
            next(error);
        }
    };

    getCouponByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const code = req.params.code;
            
            const coupon = await this.couponService.getCouponByCode(code);
            
            res.status(200).json({
                success: true,
                message: 'Coupon retrieved successfully',
                data: coupon
            });
        } catch (error) {
            next(error);
        }
    };

    getAllCoupons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            
            const result = await this.couponService.getAllCoupons(page, limit, active);
            
            res.status(200).json({
                success: true,
                message: 'Coupons retrieved successfully',
                data: result.coupons,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const couponData: CreateCouponDto = req.body;
            
            // Convertir la date d'expiration en objet Date si nécessaire
            if (typeof couponData.expiryDate === 'string') {
                couponData.expiryDate = new Date(couponData.expiryDate);
            }
            
            const coupon = await this.couponService.createCoupon(couponData);
            
            res.status(201).json({
                success: true,
                message: 'Coupon created successfully',
                data: coupon
            });
        } catch (error) {
            next(error);
        }
    };

    updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const id = req.params.id;
            const couponData: UpdateCouponDto = req.body;
            
            // Convertir la date d'expiration en objet Date si nécessaire
            if (typeof couponData.expiryDate === 'string') {
                couponData.expiryDate = new Date(couponData.expiryDate);
            }
            
            const coupon = await this.couponService.updateCoupon(id, couponData);
            
            res.status(200).json({
                success: true,
                message: 'Coupon updated successfully',
                data: coupon
            });
        } catch (error) {
            next(error);
        }
    };

    deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const id = req.params.id;
            
            await this.couponService.deleteCoupon(id);
            
            res.status(200).json({
                success: true,
                message: 'Coupon deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    verifyCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const verifyData: VerifyCouponDto = {
                code: req.body.code,
                amount: req.body.amount,
                productIds: req.body.productIds,
                categoryIds: req.body.categoryIds
            };
            
            const verificationResult = await this.couponService.verifyCoupon(verifyData);
            
            res.status(200).json({
                success: true,
                message: 'Coupon verification completed',
                data: verificationResult
            });
        } catch (error) {
            next(error);
        }
    };

    applyCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            await this.couponService.applyCoupon(id);
            
            res.status(200).json({
                success: true,
                message: 'Coupon applied successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    generateCouponCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier que l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const code = await this.couponService.generateCouponCode();
            
            res.status(200).json({
                success: true,
                message: 'Coupon code generated successfully',
                data: { code }
            });
        } catch (error) {
            next(error);
        }
    };
}