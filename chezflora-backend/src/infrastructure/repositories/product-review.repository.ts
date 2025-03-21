// src/infrastructure/repositories/product-review.repository.ts
import { ProductReviewRepositoryInterface } from '../../interfaces/repositories/product-review-repository.interface';
import { ProductReviewResponseDto } from '../../application/dtos/review/product-review-response.dto';
import { CreateProductReviewDto } from '../../application/dtos/review/create-product-review.dto';
import { UpdateProductReviewDto } from '../../application/dtos/review/update-product-review.dto';
import ProductReview from '../database/models/product-review.model';
import User from '../database/models/user.model';
import Product from '../database/models/product.model';
import Order from '../database/models/order.model';
import OrderItem from '../database/models/order-item.model';
import { Op } from 'sequelize';
import sequelize from '../config/database';

export class ProductReviewRepository implements ProductReviewRepositoryInterface {
    async findById(id: string): Promise<ProductReviewResponseDto | null> {
        try {
            const review = await ProductReview.findByPk(id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ]
            });
            
            if (!review) {
                return null;
            }

            return this.mapToResponseDto(review);
        } catch (error) {
            console.error('Error finding review by ID:', error);
            throw error;
        }
    }

    async findByProductId(productId: string, page: number = 1, limit: number = 10): Promise<{ reviews: ProductReviewResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            
            const { count, rows } = await ProductReview.findAndCountAll({
                where: { 
                    productId,
                    status: 'approved'
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            const reviews = rows.map(review => this.mapToResponseDto(review));

            return {
                reviews,
                total: count
            };
        } catch (error) {
            console.error('Error finding reviews by product ID:', error);
            throw error;
        }
    }

    async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ reviews: ProductReviewResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            
            const { count, rows } = await ProductReview.findAndCountAll({
                where: { userId },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            const reviews = rows.map(review => this.mapToResponseDto(review));

            return {
                reviews,
                total: count
            };
        } catch (error) {
            console.error('Error finding reviews by user ID:', error);
            throw error;
        }
    }

    async findPendingReviews(page: number = 1, limit: number = 10): Promise<{ reviews: ProductReviewResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            
            const { count, rows } = await ProductReview.findAndCountAll({
                where: { status: 'pending' },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    },
                    {
                        model: Product,
                        attributes: ['id', 'name']
                    }
                ],
                order: [['createdAt', 'ASC']],
                limit,
                offset
            });

            const reviews = rows.map(review => ({
                ...this.mapToResponseDto(review),
                product: {
                    id: review.product.id,
                    name: review.product.name
                }
            }));

            return {
                reviews,
                total: count
            };
        } catch (error) {
            console.error('Error finding pending reviews:', error);
            throw error;
        }
    }

    async create(userId: string, reviewData: CreateProductReviewDto): Promise<ProductReviewResponseDto> {
        try {
            // Check if the product exists
            const product = await Product.findByPk(reviewData.productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Check if user has already reviewed this product
            const existingReview = await ProductReview.findOne({
                where: {
                    userId,
                    productId: reviewData.productId
                }
            });

            if (existingReview) {
                throw new Error('You have already reviewed this product');
            }

            // Create the review
            const review = await ProductReview.create({
                ...reviewData,
                userId,
                status: 'pending' // All reviews start as pending and need moderation
            });

            // Return the created review with user data
            return this.findById(review.id) as Promise<ProductReviewResponseDto>;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    }

    async update(id: string, reviewData: UpdateProductReviewDto): Promise<ProductReviewResponseDto | null> {
        try {
            const review = await ProductReview.findByPk(id);
            if (!review) {
                return null;
            }

            // Update the review
            await review.update(reviewData);

            // Return the updated review with user data
            return this.findById(id) as Promise<ProductReviewResponseDto>;
        } catch (error) {
            console.error('Error updating review:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const review = await ProductReview.findByPk(id);
            if (!review) {
                return false;
            }

            // Delete the review
            await review.destroy();
            
            return true;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }

    async getUserCanReviewProduct(userId: string, productId: string): Promise<boolean> {
        try {
            // Check if user has already reviewed this product
            const existingReview = await ProductReview.findOne({
                where: {
                    userId,
                    productId
                }
            });

            if (existingReview) {
                return false; // User has already reviewed this product
            }

            // Check if user has purchased this product (assuming order status = 'delivered')
            const hasPurchased = await Order.findOne({
                where: {
                    userId,
                    status: 'delivered'
                },
                include: [
                    {
                        model: OrderItem,
                        where: { productId },
                        required: true
                    }
                ]
            });

            return !!hasPurchased; // User can review if they have purchased the product
        } catch (error) {
            console.error('Error checking if user can review product:', error);
            throw error;
        }
    }

    async getAverageRatingForProduct(productId: string): Promise<number> {
        try {
            const result = await ProductReview.findOne({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
                ],
                where: {
                    productId,
                    status: 'approved'
                },
                raw: true
            }) as any;

            return result ? parseFloat(result.averageRating) || 0 : 0;
        } catch (error) {
            console.error('Error getting average rating for product:', error);
            throw error;
        }
    }

    async moderateReview(id: string, status: 'approved' | 'rejected'): Promise<ProductReviewResponseDto | null> {
        try {
            const review = await ProductReview.findByPk(id);
            if (!review) {
                return null;
            }

            // Update the status
            await review.update({ status });

            // Return the updated review with user data
            return this.findById(id) as Promise<ProductReviewResponseDto>;
        } catch (error) {
            console.error('Error moderating review:', error);
            throw error;
        }
    }

    private mapToResponseDto(review: any): ProductReviewResponseDto {
        return {
            id: review.id,
            productId: review.productId,
            userId: review.userId,
            rating: review.rating,
            title: review.title,
            content: review.content,
            status: review.status,
            user: review.user ? {
                id: review.user.id,
                firstName: review.user.firstName,
                lastName: review.user.lastName
            } : undefined,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        };
    }
}