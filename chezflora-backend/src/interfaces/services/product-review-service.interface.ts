// src/interfaces/services/product-review-service.interface.ts
import { ProductReviewResponseDto } from '../../application/dtos/review/product-review-response.dto';
import { CreateProductReviewDto } from '../../application/dtos/review/create-product-review.dto';
import { UpdateProductReviewDto } from '../../application/dtos/review/update-product-review.dto';

export interface ProductReviewServiceInterface {
    getReviewById(id: string): Promise<ProductReviewResponseDto>;
    getReviewsByProductId(productId: string, page?: number, limit?: number): Promise<{ reviews: ProductReviewResponseDto[], pagination: any }>;
    getUserReviews(userId: string, page?: number, limit?: number): Promise<{ reviews: ProductReviewResponseDto[], pagination: any }>;
    getPendingReviews(page?: number, limit?: number): Promise<{ reviews: ProductReviewResponseDto[], pagination: any }>;
    createReview(userId: string, reviewData: CreateProductReviewDto): Promise<ProductReviewResponseDto>;
    updateReview(id: string, userId: string, reviewData: UpdateProductReviewDto): Promise<ProductReviewResponseDto>;
    deleteReview(id: string, userId: string): Promise<boolean>;
    checkUserCanReviewProduct(userId: string, productId: string): Promise<boolean>;
    getProductAverageRating(productId: string): Promise<number>;
    moderateReview(id: string, status: 'approved' | 'rejected'): Promise<ProductReviewResponseDto>;
}