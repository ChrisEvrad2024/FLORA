// src/infrastructure/repositories/blog-post.repository.ts
import { BlogPostRepositoryInterface } from '../../interfaces/repositories/blog-post-repository.interface';
import { BlogPostResponseDto } from '../../application/dtos/blog/blog-post-response.dto';
import { CreateBlogPostDto } from '../../application/dtos/blog/create-blog-post.dto';
import { UpdateBlogPostDto } from '../../application/dtos/blog/update-blog-post.dto';
import { BlogFilterDto } from '../../application/dtos/blog/blog-filter.dto';
import BlogPost from '../database/models/blog-post.model';
import BlogCategory from '../database/models/blog-category.model';
import User from '../database/models/user.model';
import Comment from '../database/models/comment.model';
import Tag from '../database/models/tag.model';
import PostTag from '../database/models/post-tag.model';
import { Op } from 'sequelize';
import slugify from 'slugify';

export class BlogPostRepository implements BlogPostRepositoryInterface {
    async findById(id: string, includeComments: boolean = false): Promise<BlogPostResponseDto | null> {
        try {
            const include:any[] = [
                {
                    model: BlogCategory,
                    attributes: ['id', 'name', 'slug']
                },
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Tag,
                    attributes: ['id', 'name', 'slug'],
                    through: { attributes: [] }
                }
            ];

            if (includeComments) {
                include.push({
                    model: Comment,
                    where: { status: 'approved' },
                    required: false,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'firstName', 'lastName']
                        }
                    ]
                });
            }

            const post = await BlogPost.findByPk(id, {
                include
            });

            if (!post) {
                return null;
            }

            return this.mapToResponseDto(post);
        } catch (error) {
            console.error('Error finding blog post by ID:', error);
            throw error;
        }
    }

    async findBySlug(slug: string, includeComments: boolean = false): Promise<BlogPostResponseDto | null> {
        try {
            const include: any[] = [
                {
                    model: BlogCategory,
                    attributes: ['id', 'name', 'slug']
                },
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Tag,
                    attributes: ['id', 'name', 'slug'],
                    through: { attributes: [] }
                }
            ];

            if (includeComments) {
                include.push({
                    model: Comment,
                    where: { status: 'approved' },
                    required: false,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'firstName', 'lastName']
                        }
                    ]
                });
            }

            const post = await BlogPost.findOne({
                where: { slug },
                include
            });

            if (!post) {
                return null;
            }

            return this.mapToResponseDto(post);
        } catch (error) {
            console.error('Error finding blog post by slug:', error);
            throw error;
        }
    }

    async findAll(filter: BlogFilterDto): Promise<{ posts: BlogPostResponseDto[], total: number }> {
        try {
            const { 
                categoryId, 
                search, 
                tag, 
                status = 'published', 
                authorId,
                page = 1, 
                limit = 10, 
                sortBy = 'createdAt', 
                sortOrder = 'DESC' 
            } = filter;

            // Calculate offset for pagination
            const offset = (page - 1) * limit;

            // Build the where condition
            const where: any = {};
            
            if (status) {
                where.status = status;
            }

            if (categoryId) {
                where.categoryId = categoryId;
            }

            if (authorId) {
                where.userId = authorId;
            }

            if (search) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } }
                ];
            }

            // Include models
            const include: any[] = [
                {
                    model: BlogCategory,
                    attributes: ['id', 'name', 'slug']
                },
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Tag,
                    attributes: ['id', 'name', 'slug'],
                    through: { attributes: [] }
                }
            ];

            // If searching by tag
            if (tag) {
                include[2].where = { name: tag };
            }

            // Execute query
            const { count, rows } = await BlogPost.findAndCountAll({
                where,
                include,
                limit,
                offset,
                order: [[sortBy, sortOrder]],
                distinct: true
            });

            // Map to DTOs
            const posts = rows.map(post => this.mapToResponseDto(post));

            return {
                posts,
                total: count
            };
        } catch (error) {
            console.error('Error finding all blog posts:', error);
            throw error;
        }
    }

    async create(userId: string, postData: CreateBlogPostDto): Promise<BlogPostResponseDto> {
        try {
            // Generate slug from title
            let slug = slugify(postData.title, { lower: true, strict: true });
            
            // Check if slug already exists
            const existingPost = await BlogPost.findOne({ where: { slug } });
            if (existingPost) {
                // Add a random suffix to make it unique
                slug = `${slug}-${Date.now().toString().slice(-4)}`;
            }

            // Create the post
            const post = await BlogPost.create({
                ...postData,
                userId,
                slug,
                excerpt: postData.excerpt || postData.content.substring(0, 150)
            });

            // Handle tags if provided
            if (postData.tags && postData.tags.length > 0) {
                for (const tagName of postData.tags) {
                    await this.addTag(post.id, tagName);
                }
            }

            // Return the created post with related data
            return this.findById(post.id) as Promise<BlogPostResponseDto>;
        } catch (error) {
            console.error('Error creating blog post:', error);
            throw error;
        }
    }

    async update(id: string, postData: UpdateBlogPostDto): Promise<BlogPostResponseDto | null> {
        try {
            // Find the post
            const post = await BlogPost.findByPk(id);
            if (!post) {
                return null;
            }

            // If title is being updated, update slug too
            if (postData.title) {
                let newSlug = slugify(postData.title, { lower: true, strict: true });
                
                // Check if new slug already exists (except for this post)
                const existingPost = await BlogPost.findOne({ 
                    where: { 
                        slug: newSlug,
                        id: { [Op.ne]: id }
                    } 
                });
                
                if (existingPost) {
                    // Add a random suffix to make it unique
                    newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
                }
                
                postData = { ...postData, slug: newSlug };
            }

            // Update the post
            await post.update(postData);

            // Update tags if provided
            if (postData.tags) {
                // Remove existing tags
                await PostTag.destroy({ where: { postId: id } });
                
                // Add new tags
                for (const tagName of postData.tags) {
                    await this.addTag(id, tagName);
                }
            }

            // Return the updated post with related data
            return this.findById(id) as Promise<BlogPostResponseDto>;
        } catch (error) {
            console.error('Error updating blog post:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const post = await BlogPost.findByPk(id);
            if (!post) {
                return false;
            }

            // Delete related post_tags (should be automatic with CASCADE, but just to be safe)
            await PostTag.destroy({ where: { postId: id } });
            
            // Delete the post
            await post.destroy();
            
            return true;
        } catch (error) {
            console.error('Error deleting blog post:', error);
            throw error;
        }
    }

    async incrementViewCount(id: string): Promise<boolean> {
        try {
            const post = await BlogPost.findByPk(id);
            if (!post) {
                return false;
            }

            await post.increment('views');
            return true;
        } catch (error) {
            console.error('Error incrementing view count:', error);
            throw error;
        }
    }

    async addTag(postId: string, tagName: string): Promise<boolean> {
        try {
            // Get or create the tag
            const [tag] = await Tag.findOrCreate({
                where: { name: tagName },
                defaults: {
                    name: tagName,
                    slug: slugify(tagName, { lower: true, strict: true })
                }
            });

            // Add relation between post and tag
            await PostTag.findOrCreate({
                where: {
                    postId,
                    tagId: tag.id
                }
            });

            return true;
        } catch (error) {
            console.error('Error adding tag to blog post:', error);
            throw error;
        }
    }

    async removeTag(postId: string, tagName: string): Promise<boolean> {
        try {
            // Find the tag
            const tag = await Tag.findOne({ where: { name: tagName } });
            if (!tag) {
                return false;
            }

            // Remove relation between post and tag
            const deleted = await PostTag.destroy({
                where: {
                    postId,
                    tagId: tag.id
                }
            });

            return deleted > 0;
        } catch (error) {
            console.error('Error removing tag from blog post:', error);
            throw error;
        }
    }

    async getFeaturedPosts(limit: number = 5): Promise<BlogPostResponseDto[]> {
        try {
            const posts = await BlogPost.findAll({
                where: { status: 'published' },
                include: [
                    {
                        model: BlogCategory,
                        attributes: ['id', 'name', 'slug']
                    },
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ],
                order: [['views', 'DESC']],
                limit
            });

            return posts.map(post => this.mapToResponseDto(post));
        } catch (error) {
            console.error('Error getting featured blog posts:', error);
            throw error;
        }
    }

    async getRecentPosts(limit: number = 5): Promise<BlogPostResponseDto[]> {
        try {
            const posts = await BlogPost.findAll({
                where: { status: 'published' },
                include: [
                    {
                        model: BlogCategory,
                        attributes: ['id', 'name', 'slug']
                    },
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ],
                order: [['publishDate', 'DESC']],
                limit
            });

            return posts.map(post => this.mapToResponseDto(post));
        } catch (error) {
            console.error('Error getting recent blog posts:', error);
            throw error;
        }
    }

    async getPopularPosts(limit: number = 5): Promise<BlogPostResponseDto[]> {
        try {
            const posts = await BlogPost.findAll({
                where: { status: 'published' },
                include: [
                    {
                        model: BlogCategory,
                        attributes: ['id', 'name', 'slug']
                    },
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ],
                order: [['views', 'DESC']],
                limit
            });

            return posts.map(post => this.mapToResponseDto(post));
        } catch (error) {
            console.error('Error getting popular blog posts:', error);
            throw error;
        }
    }

    async getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPostResponseDto[]> {
        try {
            // Get the current post to find its category
            const currentPost = await BlogPost.findByPk(postId);
            if (!currentPost) {
                return [];
            }

            // Find posts in the same category, excluding the current post
            const posts = await BlogPost.findAll({
                where: {
                    categoryId: currentPost.categoryId,
                    id: { [Op.ne]: postId },
                    status: 'published'
                },
                include: [
                    {
                        model: BlogCategory,
                        attributes: ['id', 'name', 'slug']
                    },
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ],
                order: [['publishDate', 'DESC']],
                limit
            });

            return posts.map(post => this.mapToResponseDto(post));
        } catch (error) {
            console.error('Error getting related blog posts:', error);
            throw error;
        }
    }

    private mapToResponseDto(post: any): BlogPostResponseDto {
        return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            categoryId: post.categoryId,
            userId: post.userId,
            status: post.status,
            publishDate: post.publishDate,
            featuredImage: post.featuredImage,
            views: post.views,
            author: post.author ? {
                id: post.author.id,
                firstName: post.author.firstName,
                lastName: post.author.lastName
            } : undefined,
            category: post.category ? {
                id: post.category.id,
                name: post.category.name
            } : undefined,
            tags: post.tags ? post.tags.map((tag: any) => tag.name) : [],
            comments: post.comments ? post.comments.map((comment: any) => ({
                id: comment.id,
                content: comment.content,
                userId: comment.userId,
                userName: `${comment.user.firstName} ${comment.user.lastName}`,
                createdAt: comment.createdAt,
                status: comment.status
            })) : [],
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        };
    }
}