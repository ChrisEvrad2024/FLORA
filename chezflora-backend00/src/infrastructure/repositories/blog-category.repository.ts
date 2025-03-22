// src/infrastructure/repositories/blog-category.repository.ts
import { BlogCategoryRepositoryInterface } from '../../interfaces/repositories/blog-category-repository.interface';
import { BlogCategoryResponseDto } from '../../application/dtos/blog/blog-category.dto';
import BlogCategory from '../database/models/blog-category.model';
import BlogPost from '../database/models/blog-post.model';
import { AppError } from '../http/middlewares/error.middleware';
import slugify from 'slugify';

export class BlogCategoryRepository implements BlogCategoryRepositoryInterface {
    async findAll(): Promise<BlogCategoryResponseDto[]> {
        const categories = await BlogCategory.findAll({
            order: [['name', 'ASC']]
        });
        
        // Récupérer le nombre d'articles pour chaque catégorie
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const postCount = await BlogPost.count({
                    where: {
                        categoryId: category.id,
                        status: 'published'
                    }
                });
                
                return {
                    ...this.mapToCategoryResponseDto(category),
                    postCount
                };
            })
        );
        
        return categoriesWithCounts;
    }
    
    async findById(id: string): Promise<BlogCategoryResponseDto | null> {
        const category = await BlogCategory.findByPk(id);
        
        if (!category) {
            return null;
        }
        
        const postCount = await BlogPost.count({
            where: {
                categoryId: id,
                status: 'published'
            }
        });
        
        return {
            ...this.mapToCategoryResponseDto(category),
            postCount
        };
    }
    
    async findBySlug(slug: string): Promise<BlogCategoryResponseDto | null> {
        const category = await BlogCategory.findOne({
            where: {
                slug
            }
        });
        
        if (!category) {
            return null;
        }
        
        const postCount = await BlogPost.count({
            where: {
                categoryId: category.id,
                status: 'published'
            }
        });
        
        return {
            ...this.mapToCategoryResponseDto(category),
            postCount
        };
    }
    
    async create(categoryData: Omit<BlogCategoryResponseDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogCategoryResponseDto> {
        try {
            // Generate slug if not provided
            if (!categoryData.slug) {
                categoryData.slug = slugify(categoryData.name, { lower: true });
            }
            
            const category = await BlogCategory.create(categoryData);
            
            return this.mapToCategoryResponseDto(category);
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new AppError('A category with this name or slug already exists', 400);
            }
            
            throw error;
        }
    }
    
    async update(id: string, categoryData: Partial<BlogCategoryResponseDto>): Promise<BlogCategoryResponseDto | null> {
        try {
            const category = await BlogCategory.findByPk(id);
            
            if (!category) {
                return null;
            }
            
            // Generate slug if name is updated but slug is not provided
            if (categoryData.name && !categoryData.slug) {
                categoryData.slug = slugify(categoryData.name, { lower: true });
            }
            
            await category.update(categoryData);
            
            return this.mapToCategoryResponseDto(category);
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new AppError('A category with this name or slug already exists', 400);
            }
            
            throw error;
        }
    }
    
    async delete(id: string): Promise<boolean> {
        const deleted = await BlogCategory.destroy({
            where: {
                id
            }
        });
        
        return deleted > 0;
    }
    
    private mapToCategoryResponseDto(category: BlogCategory): BlogCategoryResponseDto {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }
}