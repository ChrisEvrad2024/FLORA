// src/application/dtos/blog/blog-category.dto.ts
export interface BlogCategoryDto {
    id?: string;
    name: string;
    description?: string;
    slug?: string;
}

export interface BlogCategoryResponseDto {
    id: string;
    name: string;
    description?: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}