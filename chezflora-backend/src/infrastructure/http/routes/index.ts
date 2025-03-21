// src/infrastructure/http/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import addressRoutes from './address.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import quoteRoutes from './quote.routes';

const router = Router();

// Routes de l'API
router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/quotes', quoteRoutes);

export default router;