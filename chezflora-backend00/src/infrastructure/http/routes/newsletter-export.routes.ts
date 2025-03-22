// src/infrastructure/http/routes/newsletter-export.routes.ts
import { Router } from 'express';
import { NewsletterExportController } from '../controllers/newsletter-export.controller';
import { NewsletterExportService } from '../../../application/services/promotion/newsletter-export.service';
import { NewsletterExportRepository } from '../../repositories/newsletter-export.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../../../application/validations/coupon.validation';

const router = Router();

// Initialisation des dépendances
const newsletterExportRepository = new NewsletterExportRepository();
const newsletterExportService = new NewsletterExportService(newsletterExportRepository);
const newsletterExportController = new NewsletterExportController(newsletterExportService);

// Toutes les routes nécessitent une authentification et un rôle admin
router.use(authenticate, authorize(['admin']));

// Routes d'export
router.post(
    '/export',
    validateBody(validators.newsletterExportSchema),
    newsletterExportController.exportSubscribers
);

router.get(
    '/count',
    newsletterExportController.getSubscribersCount
);

export default router;