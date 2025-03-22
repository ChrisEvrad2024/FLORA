// src/interfaces/repositories/blog-category-repository.interface.ts
import { BlogCategoryResponseDto } from "../../application/dtos/blog/blog-category.dto";

export interface BlogCategoryRepositoryInterface {
    findAll(): Promise<BlogCategoryResponseDto[]>;
    findById(id: string): Promise<BlogCategoryResponseDto | null>;
    findBySlug(slug: string): Promise<BlogCategoryResponseDto | null>;
    create(categoryData: Omit<BlogCategoryResponseDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogCategoryResponseDto>;
    update(id: string, categoryData: Partial<BlogCategoryResponseDto>): Promise<BlogCategoryResponseDto | null>;
    delete(id: string): Promise<boolean>;
}