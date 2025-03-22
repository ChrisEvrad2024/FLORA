// src/application/services/blog/blog-category.service.ts
import { BlogCategoryRepositoryInterface } from '../../../interfaces/repositories/blog-category-repository.interface';
import { BlogCategoryDto, BlogCategoryResponseDto } from '../../dtos/blog/blog-category.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import slugify from 'slugify';

export class BlogCategoryService {
    constructor(
        private blogCategoryRepository: BlogCategoryRepositoryInterface
    ) {}

    async getCategories(): Promise<BlogCategoryResponseDto[]> {
        return this.blogCategoryRepository.findAll();
    }

    async getCategoryById(id: string): Promise<BlogCategoryResponseDto> {
        const category = await this.blogCategoryRepository.findById(id);
        
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        
        return category;
    }

    async getCategoryBySlug(slug: string): Promise<BlogCategoryResponseDto> {
        const category = await this.blogCategoryRepository.findBySlug(slug);
        
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        
        return category;
    }

    async createCategory(categoryData: BlogCategoryDto): Promise<BlogCategoryResponseDto> {
        // Générer le slug à partir du nom si non fourni
        if (!categoryData.slug) {
            categoryData.slug = slugify(categoryData.name, { lower: true });
        }
        
        // Vérifier si le slug existe déjà
        const existingCategory = await this.blogCategoryRepository.findBySlug(categoryData.slug);
        if (existingCategory) {
            throw new AppError('A category with this slug already exists', 400);
        }
        
        return this.blogCategoryRepository.create(categoryData);
    }

    async updateCategory(id: string, categoryData: Partial<BlogCategoryDto>): Promise<BlogCategoryResponseDto> {
        // Si le nom est mis à jour, mettre à jour le slug
        if (categoryData.name && !categoryData.slug) {
            categoryData.slug = slugify(categoryData.name, { lower: true });
        }
        
        // Si le slug est mis à jour, vérifier qu'il n'existe pas déjà
        if (categoryData.slug) {
            const existingCategory = await this.blogCategoryRepository.findBySlug(categoryData.slug);
            if (existingCategory && existingCategory.id !== id) {
                throw new AppError('A category with this slug already exists', 400);
            }
        }
        
        const updatedCategory = await this.blogCategoryRepository.update(id, categoryData);
        
        if (!updatedCategory) {
            throw new AppError('Category not found', 404);
        }
        
        return updatedCategory;
    }

    async deleteCategory(id: string): Promise<boolean> {
        const deleted = await this.blogCategoryRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Category not found', 404);
        }
        
        return true;
    }
}