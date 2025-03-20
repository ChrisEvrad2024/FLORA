// src/interfaces/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUserUseCase } from '../../application/use-cases/auth/login.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';

export class AuthController {
    constructor(private readonly userRepository: UserRepository) { }

    async register(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const { firstName, lastName, email, password, phone } = req.body;

            // Execute use case
            const registerUserUseCase = new RegisterUserUseCase(this.userRepository);
            const result = await registerUserUseCase.execute({
                firstName,
                lastName,
                email,
                password,
                phone
            });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const { email, password } = req.body;

            // Execute use case
            const loginUserUseCase = new LoginUserUseCase(this.userRepository);
            const result = await loginUserUseCase.execute({
                email,
                password
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
}

// src/interfaces/controllers/product.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { GetProductsUseCase } from '../../application/use-cases/product/get-products.use-case';
import { GetProductDetailUseCase } from '../../application/use-cases/product/get-product-detail.use-case';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class ProductController {
    constructor(private readonly productRepository: ProductRepository) { }

    async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId, search } = req.query;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            // Execute use case
            const getProductsUseCase = new GetProductsUseCase(this.productRepository);
            const result = await getProductsUseCase.execute({
                categoryId: categoryId as string,
                isActive: true,
                page,
                limit,
                search: search as string
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async getProductDetail(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Execute use case
            const getProductDetailUseCase = new GetProductDetailUseCase(this.productRepository);
            const result = await getProductDetailUseCase.execute({ id });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
}

// src/interfaces/controllers/cart.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AddToCartUseCase } from '../../application/use-cases/cart/add-to-cart.use-case';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class CartController {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ) { }

    async addToCart(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const userId = req.user?.id; // Assuming req.user is set by auth middleware
            const { productId, quantity } = req.body;

            // Execute use case
            const addToCartUseCase = new AddToCartUseCase(
                this.cartRepository,
                this.productRepository
            );

            const result = await addToCartUseCase.execute({
                userId,
                productId,
                quantity
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async getCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id; // Assuming req.user is set by auth middleware

            const cart = await this.cartRepository.findByUserId(userId);

            if (!cart) {
                res.status(200).json({
                    success: true,
                    message: 'Cart is empty',
                    cart: null,
                    items: []
                });
                return;
            }

            const items = await this.cartRepository.getCartItems(cart.id);

            // Calculate total
            const total = items.reduce(
                (sum, item) => sum + (item.quantity * item.unitPrice),
                0
            );

            res.status(200).json({
                success: true,
                message: 'Cart retrieved successfully',
                cart,
                items,
                total
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async updateCartItemQuantity(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const { id } = req.params;
            const { quantity } = req.body;

            const updatedItem = await this.cartRepository.updateItemQuantity(id, quantity);

            res.status(200).json({
                success: true,
                message: quantity > 0 ? 'Cart item updated' : 'Cart item removed',
                item: updatedItem
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async removeCartItem(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const removed = await this.cartRepository.removeItem(id);

            if (removed) {
                res.status(200).json({
                    success: true,
                    message: 'Cart item removed successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Cart item not found'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async clearCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id; // Assuming req.user is set by auth middleware

            const cart = await this.cartRepository.findByUserId(userId);

            if (!cart) {
                res.status(200).json({
                    success: true,
                    message: 'Cart is already empty'
                });
                return;
            }

            await this.cartRepository.clearCart(cart.id);

            res.status(200).json({
                success: true,
                message: 'Cart cleared successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
}

// src/interfaces/controllers/order.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CreateOrderUseCase } from '../../application/use-cases/order/create-order.use-case';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';

export class OrderController {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ) { }

    async createOrder(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const userId = req.user?.id; // Assuming req.user is set by auth middleware
            const { shippingAddressId, paymentMethod } = req.body;

            // Execute use case
            const createOrderUseCase = new CreateOrderUseCase(
                this.orderRepository,
                this.cartRepository,
                this.productRepository
            );

            const result = await createOrderUseCase.execute({
                userId,
                shippingAddressId,
                paymentMethod
            });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async getOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id; // Assuming req.user is set by auth middleware
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { orders, total } = await this.orderRepository.findAll({
                userId,
                limit,
                offset
            });

            const totalPages = Math.ceil(total / limit);

            res.status(200).json({
                success: true,
                message: 'Orders retrieved successfully',
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async getOrderDetail(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id; // Assuming req.user is set by auth middleware
            const { id } = req.params;

            const order = await this.orderRepository.findById(id);

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
                return;
            }

            // Check if order belongs to user (unless admin)
            if (order.userId !== userId && req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this order'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Order retrieved successfully',
                order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
}