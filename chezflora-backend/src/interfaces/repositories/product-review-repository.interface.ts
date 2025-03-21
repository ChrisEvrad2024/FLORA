// src/interfaces/repositories/product-review-repository.interface.ts
import { ProductReviewResponseDto } from '../../application/dtos/review/product-review-response.dto';
import { CreateProductReviewDto } from '../../application/dtos/review/create-product-review.dto';
import { UpdateProductReviewDto } from '../../application/dtos/review/update-product-review.dto';

export interface ProductReviewRepositoryInterface {
    findById(id: string): Promise<ProductReviewResponseDto | null>;
    findByProductId(productId: string, page?: number, limit?: number): Promise<{ reviews: ProductReviewResponseDto[], total: number }>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<{ reviews: ProductReviewResponseDto[], total: number }>;
    findPendingReviews(page?: number, limit?: number): Promise<{ reviews: ProductReviewResponseDto[], total: number }>;
    create(userId: string, reviewData: CreateProductReviewDto): Promise<ProductReviewResponseDto>;
    update(id: string, reviewData: UpdateProductReviewDto): Promise<ProductReviewResponseDto | null>;
    delete(id: string): Promise<boolean>;
    getUserCanReviewProduct(userId: string, productId: string): Promise<boolean>;
    getAverageRatingForProduct(productId: string): Promise<number>;
    moderateReview(id: string, status: 'approved' | 'rejected'): Promise<ProductReviewResponseDto | null>;
}