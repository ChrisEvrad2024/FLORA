// src/application/dtos/blog/blog-category-response.dto.ts
export interface BlogCategoryResponseDto {
    id: string;
    name: string;
    slug: string;
    description?: string;
    postCount?: number;
    createdAt: Date;
    updatedAt: Date;
}