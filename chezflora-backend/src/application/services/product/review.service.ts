// src/application/services/product/review.service.ts
import { ProductReviewServiceInterface } from '../../../interfaces/services/product-review-service.interface';
import { ProductReviewRepositoryInterface } from '../../../interfaces/repositories/product-review-repository.interface';
import { ProductRepositoryInterface } from '../../../interfaces/repositories/product-repository.interface';
import { ProductReviewResponseDto } from '../../dtos/review/product-review-response.dto';
import { CreateProductReviewDto } from '../../dtos/review/create-product-review.dto';
import { UpdateProductReviewDto } from '../../dtos/review/update-product-review.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class ProductReviewService implements ProductReviewServiceInterface {
    constructor(
        private productReviewRepository: ProductReviewRepositoryInterface,
        private productRepository: ProductRepositoryInterface
    ) {}

    async getReviewById(id: string): Promise<ProductReviewResponseDto> {
        const review = await this.productReviewRepository.findById(id);
        
        if (!review) {
            throw new AppError('Review not found', 404);
        }
        
        return review;
    }

    async getReviewsByProductId(productId: string, page: number = 1, limit: number = 10): Promise<{ reviews: ProductReviewResponseDto[], pagination: any }> {
        // Check if the product exists
        const product = await this.productRepository.findById(productId);
        
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        const { reviews, total } = await this.productReviewRepository.findByProductId(productId, page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getUserReviews(userId: string, page: number = 1, limit: number = 10): Promise<{ reviews: ProductReviewResponseDto[], pagination: any }> {
        const { reviews, total } = await this.productReviewRepository.findByUserId(userId, page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getPendingReviews(page: number = 1, limit: number = 10): Promise<{ reviews: ProductReviewResponseDto[], pagination: any }> {
        const { reviews, total } = await this.productReviewRepository.findPendingReviews(page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async createReview(userId: string, reviewData: CreateProductReviewDto): Promise<ProductReviewResponseDto> {
        if (!userId) {
            throw new AppError('User ID is required', 400);
        }
        
        if (!reviewData.productId) {
            throw new AppError('Product ID is required', 400);
        }
        
        if (!reviewData.title || reviewData.title.trim() === '') {
            throw new AppError('Review title is required', 400);
        }
        
        if (!reviewData.content || reviewData.content.trim() === '') {
            throw new AppError('Review content is required', 400);
        }
        
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            throw new AppError('Rating must be between 1 and 5', 400);
        }
        
        // Check if the product exists
        const product = await this.productRepository.findById(reviewData.productId);
        
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        // Check if the user can review the product (has purchased it and hasn't reviewed it yet)
        const canReview = await this.productReviewRepository.getUserCanReviewProduct(userId, reviewData.productId);
        
        if (!canReview) {
            throw new AppError('You can only review products you have purchased, and you can only review each product once', 403);
        }
        
        return this.productReviewRepository.create(userId, reviewData);
    }

    async updateReview(id: string, userId: string, reviewData: UpdateProductReviewDto): Promise<ProductReviewResponseDto> {
        // Check if the review exists
        const review = await this.productReviewRepository.findById(id);
        
        if (!review) {
            throw new AppError('Review not found', 404);
        }
        
        // Check if the user is the author of the review
        if (review.userId !== userId) {
            throw new AppError('You can only update your own reviews', 403);
        }
        
        // Users can only update content, rating, and title, not the status
        const updatedReview = await this.productReviewRepository.update(id, {
            title: reviewData.title,
            content: reviewData.content,
            rating: reviewData.rating
        });
        
        if (!updatedReview) {
            throw new AppError('Failed to update review', 500);
        }
        
        return updatedReview;
    }

    async deleteReview(id: string, userId: string): Promise<boolean> {
        // Check if the review exists
        const review = await this.productReviewRepository.findById(id);
        
        if (!review) {
            throw new AppError('Review not found', 404);
        }
        
        // Check if the user is the author of the review
        if (review.userId !== userId) {
            throw new AppError('You can only delete your own reviews', 403);
        }
        
        const deleted = await this.productReviewRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Failed to delete review', 500);
        }
        
        return true;
    }

    async checkUserCanReviewProduct(userId: string, productId: string): Promise<boolean> {
        return this.productReviewRepository.getUserCanReviewProduct(userId, productId);
    }

    async getProductAverageRating(productId: string): Promise<number> {
        // Check if the product exists
        const product = await this.productRepository.findById(productId);
        
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        
        return this.productReviewRepository.getAverageRatingForProduct(productId);
    }

    async moderateReview(id: string, status: 'approved' | 'rejected'): Promise<ProductReviewResponseDto> {
        // Check if the review exists
        const review = await this.productReviewRepository.findById(id);
        
        if (!review) {
            throw new AppError('Review not found', 404);
        }
        
        const moderatedReview = await this.productReviewRepository.moderateReview(id, status);
        
        if (!moderatedReview) {
            throw new AppError('Failed to moderate review', 500);
        }
        
        return moderatedReview;
    }
}