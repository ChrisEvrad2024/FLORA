// src/infrastructure/http/routes/product-review.routes.ts
import { Router } from 'express';
import { ProductReviewController } from '../controllers/product-review.controller';
import { ProductReviewService } from '../../../application/services/product/review.service';
import { ProductReviewRepository } from '../../repositories/product-review.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/product-review.validation';

const router = Router();

// Initialize dependencies
const productReviewRepository = new ProductReviewRepository();
const productRepository = new ProductRepository();
const productReviewService = new ProductReviewService(productReviewRepository, productRepository);
const productReviewController = new ProductReviewController(productReviewService);

// Public routes
router.get('/product/:productId', productReviewController.getReviewsByProductId);
router.get('/product/:productId/rating', productReviewController.getProductAverageRating);

// Protected routes (require authentication)
router.use(authenticate);

// Routes for authenticated users
router.get('/me', productReviewController.getUserReviews);
router.get('/can-review/:productId', productReviewController.checkUserCanReviewProduct);
router.post(
    '/',
    validateBody(validators.createProductReviewSchema),
    productReviewController.createReview
);
router.put(
    '/:id',
    validateBody(validators.updateProductReviewSchema),
    productReviewController.updateReview
);
router.delete(
    '/:id',
    productReviewController.deleteReview
);

// Admin routes
router.get(
    '/pending',
    authorize(['admin']),
    productReviewController.getPendingReviews
);
router.patch(
    '/:id/moderate',
    authorize(['admin']),
    validateBody(validators.moderateProductReviewSchema),
    productReviewController.moderateReview
);

export default router;