// src/infrastructure/http/routes/promotion.routes.ts
import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { PromotionService } from '../../../application/services/promotion/promotion.service';
import { PromotionRepository } from '../../repositories/promotion.repository';
import { CartRepository } from '../../repositories/cart.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/promotion.validator';

const router = Router();

// Initialize dependencies
const promotionRepository = new PromotionRepository();
const cartRepository = new CartRepository();
const promotionService = new PromotionService(promotionRepository, cartRepository);
const promotionController = new PromotionController(promotionService);

// Public routes
router.get('/active', promotionController.getActivePromotions);
router.post('/validate', validateBody(validators.validatePromotionSchema), promotionController.validatePromotion);

// Protected routes (require authentication)
router.use(authenticate);

// Routes for authenticated users
router.post('/apply', validateBody(validators.applyPromotionSchema), promotionController.applyPromotionToCart);

// Admin routes
router.get('/', authorize(['admin']), promotionController.getAllPromotions);
router.get('/:id', authorize(['admin']), promotionController.getPromotionById);
router.post(
    '/',
    authorize(['admin']),
    validateBody(validators.createPromotionSchema),
    promotionController.createPromotion
);
router.put(
    '/:id',
    authorize(['admin']),
    validateBody(validators.updatePromotionSchema),
    promotionController.updatePromotion
);
router.delete(
    '/:id',
    authorize(['admin']),
    promotionController.deletePromotion
);
router.get(
    '/export/codes',
    authorize(['admin']),
    promotionController.exportPromotionCodesReport
);

export default router;