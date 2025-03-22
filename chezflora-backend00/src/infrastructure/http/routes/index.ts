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
import blogRoutes from './blog.routes'; // Importer les routes du blog
import promotionRoutes from './promotion.routes';
import couponRoutes from './coupon.routes';
import newsletterExportRoutes from './newsletter-export.routes';

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
router.use('/blog', blogRoutes);
router.use('/promotions', promotionRoutes);
router.use('/coupons', couponRoutes);
router.use('/newsletter-export', newsletterExportRoutes);

export default router;