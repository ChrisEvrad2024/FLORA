import { BlogCategoryRepositoryInterface } from '../../interfaces/repositories/blog-category-repository.interface';
import { BlogCategoryResponseDto } from '../../application/dtos/blog/blog-category.dto';
import BlogCategory from '../database/models/blog-category.model';
import BlogPost from '../database/models/blog-post.model';
import { Op } from 'sequelize';
import slugify from 'slugify';

export class BlogCategoryRepository implements BlogCategoryRepositoryInterface {
    async findAll(): Promise<BlogCategoryResponseDto[]> {
        const categories = await BlogCategory.findAll({
            include: [
                {
                    model: BlogPost,
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [
                        // Count the number of posts in each category
                        // This is equivalent to: SELECT COUNT(*) FROM blog_posts WHERE blog_posts.category_id = blog_categories.id
                        // As a virtual field named 'postCount'
                        BlogCategory.sequelize!.literal('(SELECT COUNT(*) FROM blog_posts WHERE blog_posts.category_id = blog_categories.id)'),
                        'postCount'
                    ]
                ]
            },
            order: [['name', 'ASC']]
        });

        return categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        }));
    }

    async findById(id: string): Promise<BlogCategoryResponseDto | null> {
        const category = await BlogCategory.findByPk(id, {
            include: [
                {
                    model: BlogPost,
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [
                        BlogCategory.sequelize!.literal('(SELECT COUNT(*) FROM blog_posts WHERE blog_posts.category_id = blog_categories.id)'),
                        'postCount'
                    ]
                ]
            }
        });

        if (!category) {
            return null;
        }

        return {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }

    async findBySlug(slug: string): Promise<BlogCategoryResponseDto | null> {
        const category = await BlogCategory.findOne({
            where: { slug },
            include: [
                {
                    model: BlogPost,
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [
                        BlogCategory.sequelize!.literal('(SELECT COUNT(*) FROM blog_posts WHERE blog_posts.category_id = blog_categories.id)'),
                        'postCount'
                    ]
                ]
            }
        });

        if (!category) {
            return null;
        }

        return {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }

    async create(categoryData: Omit<BlogCategoryResponseDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogCategoryResponseDto> {
        // Generate slug if not provided
        const slug = categoryData.slug || slugify(categoryData.name, { lower: true });
        
        const category = await BlogCategory.create({
            ...categoryData,
            slug
        });

        return {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }

    async update(id: string, categoryData: Partial<BlogCategoryResponseDto>): Promise<BlogCategoryResponseDto | null> {
        const category = await BlogCategory.findByPk(id);
        
        if (!category) {
            return null;
        }

        // If name is updated, update slug if slug is not provided
        if (categoryData.name && !categoryData.slug) {
            categoryData.slug = slugify(categoryData.name, { lower: true });
        }

        await category.update(categoryData);

        return {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        };
    }

    async delete(id: string): Promise<boolean> {
        const result = await BlogCategory.destroy({
            where: { id }
        });

        return result > 0;
    }
}