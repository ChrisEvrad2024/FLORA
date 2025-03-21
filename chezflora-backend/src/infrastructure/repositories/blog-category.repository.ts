// src/infrastructure/repositories/blog-category.repository.ts
import { BlogCategoryRepositoryInterface } from '../../interfaces/repositories/blog-category-repository.interface';
import { BlogCategoryResponseDto } from '../../application/dtos/blog/blog-category-response.dto';
import { CreateBlogCategoryDto } from '../../application/dtos/blog/create-blog-category.dto';
import { UpdateBlogCategoryDto } from '../../application/dtos/blog/update-blog-category.dto';
import BlogCategory from '../database/models/blog-category.model';
import BlogPost from '../database/models/blog-post.model';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import slugify from 'slugify';

export class BlogCategoryRepository implements BlogCategoryRepositoryInterface {
    async findById(id: string): Promise<BlogCategoryResponseDto | null> {
        try {
            const category = await BlogCategory.findByPk(id);
            
            if (!category) {
                return null;
            }

            return this.mapToResponseDto(category);
        } catch (error) {
            console.error('Error finding blog category by ID:', error);
            throw error;
        }
    }

    async findBySlug(slug: string): Promise<BlogCategoryResponseDto | null> {
        try {
            const category = await BlogCategory.findOne({
                where: { slug }
            });
            
            if (!category) {
                return null;
            }

            return this.mapToResponseDto(category);
        } catch (error) {
            console.error('Error finding blog category by slug:', error);
            throw error;
        }
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ categories: BlogCategoryResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            
            const { count, rows } = await BlogCategory.findAndCountAll({
                limit,
                offset,
                order: [['name', 'ASC']]
            });

            // Map to DTOs
            const categories = await Promise.all(rows.map(async category => {
                const postCount = await BlogPost.count({
                    where: { 
                        categoryId: category.id,
                        status: 'published'
                    }
                });
                
                return {
                    ...this.mapToResponseDto(category),
                    postCount
                };
            }));

            return {
                categories,
                total: count
            };
        } catch (error) {
            console.error('Error finding all blog categories:', error);
            throw error;
        }
    }

    async create(categoryData: CreateBlogCategoryDto): Promise<BlogCategoryResponseDto> {
        try {
            // Generate slug from name
            let slug = slugify(categoryData.name, { lower: true, strict: true });
            
            // Check if slug already exists
            const existingCategory = await BlogCategory.findOne({ where: { slug } });
            if (existingCategory) {
                // Add a random suffix to make it unique
                slug = `${slug}-${Date.now().toString().slice(-4)}`;
            }

            // Create the category
            const category = await BlogCategory.create({
                ...categoryData,
                slug
            });

            return this.mapToResponseDto(category);
        } catch (error) {
            console.error('Error creating blog category:', error);
            throw error;
        }
    }

    async update(id: string, categoryData: UpdateBlogCategoryDto): Promise<BlogCategoryResponseDto | null> {
        try {
            // Find the category
            const category = await BlogCategory.findByPk(id);
            if (!category) {
                return null;
            }

            // If name is being updated, update slug too
            if (categoryData.name) {
                let newSlug = slugify(categoryData.name, { lower: true, strict: true });
                
                // Check if new slug already exists (except for this category)
                const existingCategory = await BlogCategory.findOne({ 
                    where: { 
                        slug: newSlug,
                        id: { [Op.ne]: id }
                    } 
                });
                
                if (existingCategory) {
                    // Add a random suffix to make it unique
                    newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
                }
                
                categoryData = { ...categoryData, slug: newSlug };
            }

            // Update the category
            await category.update(categoryData);

            return this.mapToResponseDto(category);
        } catch (error) {
            console.error('Error updating blog category:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const category = await BlogCategory.findByPk(id);
            if (!category) {
                return false;
            }

            // Check if there are any posts in this category
            const postsCount = await BlogPost.count({ where: { categoryId: id } });
            if (postsCount > 0) {
                throw new Error('Cannot delete category with associated posts');
            }

            // Delete the category
            await category.destroy();
            
            return true;
        } catch (error) {
            console.error('Error deleting blog category:', error);
            throw error;
        }
    }

    async getCategoriesWithPostCount(): Promise<BlogCategoryResponseDto[]> {
        try {
            const categories = await BlogCategory.findAll({
                order: [['name', 'ASC']]
            });

            // Map to DTOs with post count
            const categoriesWithCount = await Promise.all(categories.map(async category => {
                const postCount = await BlogPost.count({
                    where: { 
                        categoryId: category.id,
                        status: 'published'
                    }
                });
                
                return {
                    ...this.mapToResponseDto(category),
                    postCount
                };
            }));

            return categoriesWithCount;
        } catch (error) {
            console.error('Error getting categories with post count:', error);
            throw error;
        }
    }

    private mapToResponseDto(category: any): BlogCategoryResponseDto {
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