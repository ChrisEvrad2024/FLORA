// src/interfaces/repositories/blog-category-repository.interface.ts
import { BlogCategoryResponseDto } from '../../application/dtos/blog/blog-category-response.dto';
import { CreateBlogCategoryDto } from '../../application/dtos/blog/create-blog-category.dto';
import { UpdateBlogCategoryDto } from '../../application/dtos/blog/update-blog-category.dto';

export interface BlogCategoryRepositoryInterface {
    findById(id: string): Promise<BlogCategoryResponseDto | null>;
    findBySlug(slug: string): Promise<BlogCategoryResponseDto | null>;
    findAll(page?: number, limit?: number): Promise<{ categories: BlogCategoryResponseDto[], total: number }>;
    create(categoryData: CreateBlogCategoryDto): Promise<BlogCategoryResponseDto>;
    update(id: string, categoryData: UpdateBlogCategoryDto): Promise<BlogCategoryResponseDto | null>;
    delete(id: string): Promise<boolean>;
    getCategoriesWithPostCount(): Promise<BlogCategoryResponseDto[]>;
}