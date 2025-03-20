// src/interfaces/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../domain/repositories/user.repository';

interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export class AuthMiddleware {
    constructor(private readonly userRepository: UserRepository) { }

    authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Get token from header
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const token = authHeader.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key'
            ) as JwtPayload;

            // Check if user exists
            const user = await this.userRepository.findById(decoded.id);

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Set user in request
            req.user = decoded;

            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    };

    authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
            res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
            return;
        }

        next();
    };

    authorizeSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || req.user.role !== 'super_admin') {
            res.status(403).json({
                success: false,
                message: 'Super admin access required'
            });
            return;
        }

        next();
    };
}

// src/interfaces/middleware/validation.middleware.ts
import { body, param, query } from 'express-validator';

export const authValidation = {
    register: [
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    login: [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ]
};

export const productValidation = {
    create: [
        body('name').notEmpty().withMessage('Product name is required'),
        body('categoryId').notEmpty().withMessage('Category ID is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    ],
    update: [
        param('id').notEmpty().withMessage('Product ID is required'),
        body('name').optional(),
        body('price').optional().isNumeric().withMessage('Price must be a number'),
        body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    ]
};

export const cartValidation = {
    addItem: [
        body('productId').notEmpty().withMessage('Product ID is required'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    updateItem: [
        param('id').notEmpty().withMessage('Cart item ID is required'),
        body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
    ]
};

export const orderValidation = {
    create: [
        body('shippingAddressId').notEmpty().withMessage('Shipping address ID is required'),
        body('paymentMethod').notEmpty().withMessage('Payment method is required')
    ],
    updateStatus: [
        param('id').notEmpty().withMessage('Order ID is required'),
        body('status').isIn(['pending', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'])
            .withMessage('Invalid order status')
    ]
};

export const quoteValidation = {
    request: [
        body('description').notEmpty().withMessage('Description is required'),
        body('eventType').notEmpty().withMessage('Event type is required'),
        body('eventDate').isISO8601().withMessage('Valid event date is required')
    ],
    update: [
        param('id').notEmpty().withMessage('Quote ID is required')
    ]
};

// src/interfaces/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export class ErrorMiddleware {
    handle = (err: Error, req: Request, res: Response, next: NextFunction): void => {
        console.error('Error:', err.message);
        console.error(err.stack);

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    };

    notFound = (req: Request, res: Response): void => {
        res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.originalUrl}`
        });
    };
}

// src/interfaces/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authValidation } from '../middleware/validation.middleware';
import { SequelizeUserRepository } from '../../infrastructure/repositories/user.repository.impl';

export function authRoutes(): Router {
    const router = Router();
    const userRepository = new SequelizeUserRepository();
    const authController = new AuthController(userRepository);

    router.post('/register', authValidation.register, authController.register.bind(authController));
    router.post('/login', authValidation.login, authController.login.bind(authController));

    return router;
}

// src/interfaces/routes/product.routes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { productValidation } from '../middleware/validation.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { SequelizeUserRepository } from '../../infrastructure/repositories/user.repository.impl';
import { SequelizeProductRepository } from '../../infrastructure/repositories/product.repository.impl';

export function productRoutes(): Router {
    const router = Router();
    const userRepository = new SequelizeUserRepository();
    const productRepository = new SequelizeProductRepository();
    const productController = new ProductController(productRepository);
    const authMiddleware = new AuthMiddleware(userRepository);

    // Public routes
    router.get('/', productController.getProducts.bind(productController));
    router.get('/:id', productController.getProductDetail.bind(productController));

    // Admin routes
    router.post('/',
        authMiddleware.authenticate,
        authMiddleware.authorizeAdmin,
        productValidation.create,
        // Here you would add the admin product creation controller method
    );

    router.put('/:id',
        authMiddleware.authenticate,
        authMiddleware.authorizeAdmin,
        productValidation.update,
        // Here you would add the admin product update controller method
    );

    router.delete('/:id',
        authMiddleware.authenticate,
        authMiddleware.authorizeAdmin,
        // Here you would add the admin product deletion controller method
    );

    return router;
}

// src/interfaces/routes/cart.routes.ts
import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { cartValidation } from '../middleware/validation.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { SequelizeUserRepository } from '../../infrastructure/repositories/user.repository.impl';
import { SequelizeCartRepository } from '../../infrastructure/repositories/cart.repository.impl';
import { SequelizeProductRepository } from '../../infrastructure/repositories/product.repository.impl';

export function cartRoutes(): Router {
    const router = Router();
    const userRepository = new SequelizeUserRepository();
    const cartRepository = new SequelizeCartRepository();
    const productRepository = new SequelizeProductRepository();
    const cartController = new CartController(cartRepository, productRepository);
    const authMiddleware = new AuthMiddleware(userRepository);

    // All cart routes require authentication
    router.use(authMiddleware.authenticate);

    router.get('/', cartController.getCart.bind(cartController));
    router.post('/items', cartValidation.addItem, cartController.addToCart.bind(cartController));
    router.put('/items/:id', cartValidation.updateItem, cartController.updateCartItemQuantity.bind(cartController));
    router.delete('/items/:id', cartController.removeCartItem.bind(cartController));
    router.delete('/', cartController.clearCart.bind(cartController));

    return router;
}

// src/interfaces/routes/order.routes.ts
import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { orderValidation } from '../middleware/validation.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { SequelizeUserRepository } from '../../infrastructure/repositories/user.repository.impl';
import { SequelizeOrderRepository } from '../../infrastructure/repositories/order.repository.impl';
import { SequelizeCartRepository } from '../../infrastructure/repositories/cart.repository.impl';
import { SequelizeProductRepository } from '../../infrastructure/repositories/product.repository.impl';

export function orderRoutes(): Router {
    const router = Router();
    const userRepository = new SequelizeUserRepository();
    const orderRepository = new SequelizeOrderRepository();
    const cartRepository = new SequelizeCartRepository();
    const productRepository = new SequelizeProductRepository();
    const orderController = new OrderController(orderRepository, cartRepository, productRepository);
    const authMiddleware = new AuthMiddleware(userRepository);

    // All order routes require authentication
    router.use(authMiddleware.authenticate);

    router.post('/', orderValidation.create, orderController.createOrder.bind(orderController));
    router.get('/', orderController.getOrders.bind(orderController));
    router.get('/:id', orderController.getOrderDetail.bind(orderController));

    // Admin routes for managing orders
    router.put('/:id/status',
        authMiddleware.authorizeAdmin,
        orderValidation.updateStatus,
        // Here you would add the admin order status update controller method
    );

    return router;
}

// src/interfaces/routes/index.ts
import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { productRoutes } from './product.routes';
import { cartRoutes } from './cart.routes';
import { orderRoutes } from './order.routes';
// Import other route modules

export function setupRoutes(): Router {
    const router = Router();

    router.use('/auth', authRoutes());
    router.use('/products', productRoutes());
    router.use('/cart', cartRoutes());
    router.use('/orders', orderRoutes());
    // Add other routes

    return router;
}