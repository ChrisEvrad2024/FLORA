// src/infrastructure/http/routes/promotion.routes.ts
import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { PromotionService } from '../../../application/services/promotion/promotion.service';
import { PromotionRepository } from '../../repositories/promotion.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../../../application/validations/promotion.validation';

const router = Router();

// Initialisation des dépendances
const promotionRepository = new PromotionRepository();
const promotionService = new PromotionService(promotionRepository);
const promotionController = new PromotionController(promotionService);

// Routes publiques
router.get('/active', promotionController.getActivePromotions);
router.get('/applicable', promotionController.getApplicablePromotions);

// Routes protégées (authentication requise)
router.use(authenticate);

// Route pour obtenir la liste des promotions (accessible à tous les utilisateurs authentifiés)
router.get('/', promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);

// Routes admin
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

export default router;