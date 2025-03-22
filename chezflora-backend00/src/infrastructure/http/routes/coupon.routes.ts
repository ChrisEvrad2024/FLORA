// src/infrastructure/http/routes/coupon.routes.ts
import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { CouponService } from '../../../application/services/promotion/coupon.service';
import { CouponRepository } from '../../repositories/coupon.repository';
import { PromotionRepository } from '../../repositories/promotion.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../../../application/validations/coupon.validation';

const router = Router();

// Initialisation des dépendances
const couponRepository = new CouponRepository();
const promotionRepository = new PromotionRepository();
const couponService = new CouponService(couponRepository, promotionRepository);
const couponController = new CouponController(couponService);

// Routes publiques (vérification de coupon uniquement)
router.post('/verify', validateBody(validators.verifyCouponSchema), couponController.verifyCoupon);
router.get('/code/:code', couponController.getCouponByCode);

// Routes protégées (authentication requise)
router.use(authenticate);

// Routes pour appliquer un coupon (tous les utilisateurs authentifiés)
router.post('/:id/apply', couponController.applyCoupon);

// Routes admin
router.get(
    '/',
    authorize(['admin']),
    couponController.getAllCoupons
);

router.get(
    '/:id',
    authorize(['admin']),
    couponController.getCouponById
);

router.post(
    '/',
    authorize(['admin']),
    validateBody(validators.createCouponSchema),
    couponController.createCoupon
);

router.put(
    '/:id',
    authorize(['admin']),
    validateBody(validators.updateCouponSchema),
    couponController.updateCoupon
);

router.delete(
    '/:id',
    authorize(['admin']),
    couponController.deleteCoupon
);

router.get(
    '/generate-code',
    authorize(['admin']),
    couponController.generateCouponCode
);

export default router;