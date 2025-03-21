// src/infrastructure/http/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import addressRoutes from './address.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import quoteRoutes from './quote.routes';
import favoriteRoutes from './favorite.routes';
import newsletterRoutes from './newsletter.routes';
import dashboardRoutes from './dashboard.routes';
import invoiceRoutes from './invoice.routes';
import blogPostRoutes from './blog-post.routes';
import blogCategoryRoutes from './blog-category.routes';
import commentRoutes from './comment.routes';
import productReviewRoutes from './product-review.routes';
import blogSchedulerRoutes from './blog-scheduler.routes';
import promotionRoutes from './promotion.routes';

const router = Router();

// Routes de l'API
router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/quotes', quoteRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/blog/posts', blogPostRoutes);
router.use('/blog/categories', blogCategoryRoutes);
router.use('/blog/comments', commentRoutes);
router.use('/reviews', productReviewRoutes);
router.use('/blog/scheduler', blogSchedulerRoutes);
router.use('/promotions', promotionRoutes);

export default router;