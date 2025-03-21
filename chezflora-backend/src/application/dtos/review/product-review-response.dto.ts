// src/application/dtos/review/product-review-response.dto.ts
export interface ProductReviewResponseDto {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    title: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    user?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: Date;
    updatedAt: Date;
}