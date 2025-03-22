// src/application/services/blog/blog-category.service.ts
import { BlogCategoryRepositoryInterface } from '../../../interfaces/repositories/blog-category-repository.interface';
import { BlogCategoryDto, BlogCategoryResponseDto } from '../../../application/dtos/blog/blog-category.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import slugify from 'slugify';

export class BlogCategoryService {
    constructor(private blogCategoryRepository: BlogCategoryRepositoryInterface) {}

    async getAllCategories(): Promise<BlogCategoryResponseDto[]> {
        return this.blogCategoryRepository.findAll();
    }

    async getCategoryById(id: string): Promise<BlogCategoryResponseDto> {
        const category = await this.blogCategoryRepository.findById(id);
        
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        
        return category;
    }

    async createCategory(categoryData: BlogCategoryDto): Promise<BlogCategoryResponseDto> {
        // Générer le slug si non fourni
        const slug = categoryData.slug || slugify(categoryData.name, { lower: true });
        
        // Vérifier si le slug existe déjà
        const existingCategory = await this.blogCategoryRepository.findBySlug(slug);
        if (existingCategory) {
            throw new AppError('A category with this slug already exists', 400);
        }
        
        return this.blogCategoryRepository.create({
            ...categoryData,
            slug
        });
    }

    async updateCategory(id: string, categoryData: Partial<BlogCategoryDto>): Promise<BlogCategoryResponseDto> {
        // Si le nom est modifié, mettre à jour le slug
        let slug = categoryData.slug;
        if (categoryData.name && !categoryData.slug) {
            slug = slugify(categoryData.name, { lower: true });
            
            // Vérifier si le slug existe déjà pour une autre catégorie
            const existingCategory = await this.blogCategoryRepository.findBySlug(slug);
            if (existingCategory && existingCategory.id !== id) {
                throw new AppError('A category with this slug already exists', 400);
            }
        }
        
        const category = await this.blogCategoryRepository.update(id, {
            ...categoryData,
            slug
        });
        
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        
        return category;
    }

    async deleteCategory(id: string): Promise<boolean> {
        const deleted = await this.blogCategoryRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Category not found', 404);
        }
        
        return true;
    }
}