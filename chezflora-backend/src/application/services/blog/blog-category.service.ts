// src/application/services/blog/blog-category.service.ts
import { BlogCategoryServiceInterface } from '../../../interfaces/services/blog-category-service.interface';
import { BlogCategoryRepositoryInterface } from '../../../interfaces/repositories/blog-category-repository.interface';
import { BlogCategoryResponseDto } from '../../dtos/blog/blog-category-response.dto';
import { CreateBlogCategoryDto } from '../../dtos/blog/create-blog-category.dto';
import { UpdateBlogCategoryDto } from '../../dtos/blog/update-blog-category.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class BlogCategoryService implements BlogCategoryServiceInterface {
    constructor(private blogCategoryRepository: BlogCategoryRepositoryInterface) {}

    async getBlogCategoryById(id: string): Promise<BlogCategoryResponseDto> {
        const category = await this.blogCategoryRepository.findById(id);
        
        if (!category) {
            throw new AppError('Blog category not found', 404);
        }
        
        return category;
    }

    async getBlogCategoryBySlug(slug: string): Promise<BlogCategoryResponseDto> {
        const category = await this.blogCategoryRepository.findBySlug(slug);
        
        if (!category) {
            throw new AppError('Blog category not found', 404);
        }
        
        return category;
    }

    async getAllBlogCategories(page: number = 1, limit: number = 10): Promise<{ categories: BlogCategoryResponseDto[], pagination: any }> {
        const { categories, total } = await this.blogCategoryRepository.findAll(page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            categories,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async createBlogCategory(categoryData: CreateBlogCategoryDto): Promise<BlogCategoryResponseDto> {
        if (!categoryData.name) {
            throw new AppError('Name is required', 400);
        }
        
        return this.blogCategoryRepository.create(categoryData);
    }

    async updateBlogCategory(id: string, categoryData: UpdateBlogCategoryDto): Promise<BlogCategoryResponseDto> {
        if (Object.keys(categoryData).length === 0) {
            throw new AppError('At least one field is required for update', 400);
        }
        
        const updatedCategory = await this.blogCategoryRepository.update(id, categoryData);
        
        if (!updatedCategory) {
            throw new AppError('Blog category not found', 404);
        }
        
        return updatedCategory;
    }

    async deleteBlogCategory(id: string): Promise<boolean> {
        try {
            const deleted = await this.blogCategoryRepository.delete(id);
            
            if (!deleted) {
                throw new AppError('Blog category not found', 404);
            }
            
            return true;
        } catch (error) {
            if (error instanceof Error && error.message.includes('associated posts')) {
                throw new AppError('Cannot delete category with associated posts', 400);
            }
            throw error;
        }
    }

    async getBlogCategoriesWithPostCount(): Promise<BlogCategoryResponseDto[]> {
        return this.blogCategoryRepository.getCategoriesWithPostCount();
    }
}