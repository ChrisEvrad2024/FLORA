// src/application/dtos/blog/blog-category.dto.ts
export interface BlogCategoryDto {
    name: string;
    slug?: string;
    description?: string;
}

export interface BlogCategoryResponseDto extends BlogCategoryDto {
    id: string;
    postCount?: number;
    createdAt: Date;
    updatedAt: Date;
}