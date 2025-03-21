// src/application/dtos/blog/blog-filter.dto.ts
export interface BlogFilterDto {
    categoryId?: string;
    search?: string;
    tag?: string;
    status?: 'draft' | 'published' | 'archived';
    authorId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}