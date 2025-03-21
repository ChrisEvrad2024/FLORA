// src/application/dtos/review/create-product-review.dto.ts
export interface CreateProductReviewDto {
    productId: string;
    rating: number;
    title: string;
    content: string;
}