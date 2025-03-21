// src/application/dtos/review/update-product-review.dto.ts
export interface UpdateProductReviewDto {
    rating?: number;
    title?: string;
    content?: string;
    status?: 'pending' | 'approved' | 'rejected';
}