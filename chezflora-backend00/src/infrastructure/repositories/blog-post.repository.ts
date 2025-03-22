import { BlogPostRepositoryInterface } from '../../interfaces/repositories/blog-post-repository.interface';
import { BlogPostResponseDto } from '../../application/dtos/blog/blog-post.dto';
import BlogPost from '../database/models/blog-post.model';
import BlogCategory from '../database/models/blog-category.model';
import User from '../database/models/user.model';
import BlogComment from '../database/models/blog-comment.model';
import { Op } from 'sequelize';
import slugify from 'slugify';

export class BlogPostRepository implements BlogPostRepositoryInterface {
    async findAll(options?: {
        categoryId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ posts: BlogPostResponseDto[]; total: number }> {
        const where: any = {};
        
        if (options?.categoryId) {
            where.categoryId = options.categoryId;
        }
        
        if (options?.status) {
            where.status = options.status;
        }
        
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;
        
        const { count, rows } = await BlogPost.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'slug']
                }
            ],
            attributes: {
                include: [
                    [
                        BlogPost.sequelize!.literal('(SELECT COUNT(*) FROM blog_comments WHERE blog_comments.post_id = blog_posts.id)'),
                        'commentCount'
                    ]
                ]
            },
            order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
            limit,
            offset
        });
        
        const posts = rows.map(post => ({
            id: post.id,
            authorId: post.authorId,
            authorName: `${post.author.firstName} ${post.author.lastName}`,
            categoryId: post.categoryId,
            categoryName: post.category.name,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            status: post.status,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount: post.get('commentCount') as number
        }));
        
        return {
            posts,
            total: count
        };
    }
    
    async findById(id: string): Promise<BlogPostResponseDto | null> {
        const post = await BlogPost.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'slug']
                }
            ],
            attributes: {
                include: [
                    [
                        BlogPost.sequelize!.literal('(SELECT COUNT(*) FROM blog_comments WHERE blog_comments.post_id = blog_posts.id)'),
                        'commentCount'
                    ]
                ]
            }
        });
        
        if (!post) {
            return null;
        }
        
        return {
            id: post.id,
            authorId: post.authorId,
            authorName: `${post.author.firstName} ${post.author.lastName}`,
            categoryId: post.categoryId,
            categoryName: post.category.name,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            status: post.status,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount: post.get('commentCount') as number
        };
    }
    
    async findBySlug(slug: string): Promise<BlogPostResponseDto | null> {
        const post = await BlogPost.findOne({
            where: { slug },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'slug']
                }
            ],
            attributes: {
                include: [
                    [
                        BlogPost.sequelize!.literal('(SELECT COUNT(*) FROM blog_comments WHERE blog_comments.post_id = blog_posts.id)'),
                        'commentCount'
                    ]
                ]
            }
        });
        
        if (!post) {
            return null;
        }
        
        return {
            id: post.id,
            authorId: post.authorId,
            authorName: `${post.author.firstName} ${post.author.lastName}`,
            categoryId: post.categoryId,
            categoryName: post.category.name,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            status: post.status,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount: post.get('commentCount') as number
        };
    }
    
    async create(authorId: string, postData: Omit<BlogPostResponseDto, 'id' | 'authorId' | 'authorName' | 'categoryName' | 'createdAt' | 'updatedAt' | 'commentCount'>): Promise<BlogPostResponseDto> {
        // Generate slug from title if not provided
        const slug = postData.slug || slugify(postData.title, { lower: true });
        
        const post = await BlogPost.create({
            ...postData,
            authorId,
            slug
        });
        
        const createdPost = await this.findById(post.id);
        
        if (!createdPost) {
            throw new Error('Failed to retrieve created post');
        }
        
        return createdPost;
    }
    
    async update(id: string, postData: Partial<BlogPostResponseDto>): Promise<BlogPostResponseDto | null> {
        const post = await BlogPost.findByPk(id);
        
        if (!post) {
            return null;
        }
        
        // Generate slug from title if title is provided but slug isn't
        if (postData.title && !postData.slug) {
            postData.slug = slugify(postData.title, { lower: true });
        }
        
        await post.update({
            ...postData
        });
        
        return this.findById(id);
    }
    
    async delete(id: string): Promise<boolean> {
        const result = await BlogPost.destroy({
            where: { id }
        });
        
        return result > 0;
    }
    
    async publishPost(id: string): Promise<BlogPostResponseDto | null> {
        const post = await BlogPost.findByPk(id);
        
        if (!post) {
            return null;
        }
        
        await post.update({
            status: 'published',
            publishedAt: new Date()
        });
        
        return this.findById(id);
    }
    
    async archivePost(id: string): Promise<BlogPostResponseDto | null> {
        const post = await BlogPost.findByPk(id);
        
        if (!post) {
            return null;
        }
        
        await post.update({
            status: 'archived'
        });
        
        return this.findById(id);
    }
}