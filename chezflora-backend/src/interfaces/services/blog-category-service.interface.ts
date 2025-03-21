// src/interfaces/services/blog-category-service.interface.ts
import { BlogCategoryResponseDto } from '../../application/dtos/blog/blog-category-response.dto';
import { CreateBlogCategoryDto } from '../../application/dtos/blog/create-blog-category.dto';
import { UpdateBlogCategoryDto } from '../../application/dtos/blog/update-blog-category.dto';

export interface BlogCategoryServiceInterface {
    getBlogCategoryById(id: string): Promise<BlogCategoryResponseDto>;
    getBlogCategoryBySlug(slug: string): Promise<BlogCategoryResponseDto>;
    getAllBlogCategories(page?: number, limit?: number): Promise<{ categories: BlogCategoryResponseDto[], pagination: any }>;
    createBlogCategory(categoryData: CreateBlogCategoryDto): Promise<BlogCategoryResponseDto>;
    updateBlogCategory(id: string, categoryData: UpdateBlogCategoryDto): Promise<BlogCategoryResponseDto>;
    deleteBlogCategory(id: string): Promise<boolean>;
    getBlogCategoriesWithPostCount(): Promise<BlogCategoryResponseDto[]>;
}