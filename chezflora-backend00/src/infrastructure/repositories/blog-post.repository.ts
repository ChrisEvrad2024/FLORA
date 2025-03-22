// src/infrastructure/repositories/blog-post.repository.ts
import { BlogPostRepositoryInterface } from '../../interfaces/repositories/blog-post-repository.interface';
import { BlogPostResponseDto } from '../../application/dtos/blog/blog-post.dto';
import BlogPost from '../database/models/blog-post.model';
import BlogCategory from '../database/models/blog-category.model';
import User from '../database/models/user.model';
import BlogComment from '../database/models/blog-comment.model';
import { Op, Sequelize } from 'sequelize';
import { AppError } from '../http/middlewares/error.middleware';

export class BlogPostRepository implements BlogPostRepositoryInterface {
    async findAll(options?: {
        categoryId?: string;
        tagId?: string;
        status?: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{ posts: BlogPostResponseDto[]; total: number }> {
        const whereClause: any = {};
        
        if (options?.categoryId) {
            whereClause.categoryId = options.categoryId;
        }
        
        if (options?.status) {
            whereClause.status = options.status;
        } else {
            // Par défaut, retourne uniquement les articles publiés
            whereClause.status = 'published';
        }
        
        // Si une recherche est fournie
        if (options?.search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${options.search}%` } },
                { content: { [Op.like]: `%${options.search}%` } },
                { excerpt: { [Op.like]: `%${options.search}%` } }
            ];
        }
        
        // Construire les options de requête
        const queryOptions: any = {
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        };
        
        // Si le tagId est fourni, ajouter une condition pour les tags
        if (options?.tagId) {
            queryOptions.include.push({
                model: BlogPost.associations.tags.target,
                as: 'tags',
                where: { id: options.tagId },
                attributes: [],
                through: { attributes: [] }
            });
        }
        
        // Pagination
        if (options?.page && options?.limit) {
            queryOptions.limit = options.limit;
            queryOptions.offset = (options.page - 1) * options.limit;
        }
        
        // Exécuter la requête
        const { rows, count } = await BlogPost.findAndCountAll(queryOptions);
        
        // Mapper les résultats
        const posts = await Promise.all(
            rows.map(async (post) => {
                const commentCount = await BlogComment.count({
                    where: {
                        postId: post.id,
                        status: 'approved'
                    }
                });
                
                return this.mapToPostResponseDto(post, commentCount);
            })
        );
        
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
                    attributes: ['id', 'name']
                }
            ]
        });
        
        if (!post) {
            return null;
        }
        
        const commentCount = await BlogComment.count({
            where: {
                postId: post.id,
                status: 'approved'
            }
        });
        
        return this.mapToPostResponseDto(post, commentCount);
    }
    
    async findBySlug(slug: string): Promise<BlogPostResponseDto | null> {
        const post = await BlogPost.findOne({
            where: {
                slug
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }
            ]
        });
        
        if (!post) {
            return null;
        }
        
        const commentCount = await BlogComment.count({
            where: {
                postId: post.id,
                status: 'approved'
            }
        });
        
        // Incrémenter le compteur de vues
        await this.incrementViewCount(post.id);
        
        return this.mapToPostResponseDto(post, commentCount);
    }
    
    async create(authorId: string, postData: Omit<BlogPostResponseDto, 'id' | 'authorId' | 'authorName' | 'categoryName' | 'createdAt' | 'updatedAt' | 'commentCount'>): Promise<BlogPostResponseDto> {
        try {
            const post = await BlogPost.create({
                ...postData,
                authorId
            });
            
            // Charger les relations pour construire la réponse
            const postWithRelations = await BlogPost.findByPk(post.id, {
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: BlogCategory,
                        as: 'category',
                        attributes: ['id', 'name']
                    }
                ]
            });
            
            if (!postWithRelations) {
                throw new AppError('Failed to create post', 500);
            }
            
            return this.mapToPostResponseDto(postWithRelations, 0);
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new AppError('A post with this title or slug already exists', 400);
            }
            
            throw error;
        }
    }
    
    async update(id: string, postData: Partial<BlogPostResponseDto>): Promise<BlogPostResponseDto | null> {
        try {
            const post = await BlogPost.findByPk(id);
            
            if (!post) {
                return null;
            }
            
            // Filtrer les données à mettre à jour
            const dataToUpdate: any = { ...postData };
            delete dataToUpdate.authorName;
            delete dataToUpdate.categoryName;
            delete dataToUpdate.commentCount;
            delete dataToUpdate.tags;
            
            await post.update(dataToUpdate);
            
            // Récupérer le post mis à jour avec les relations
            const updatedPost = await BlogPost.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: BlogCategory,
                        as: 'category',
                        attributes: ['id', 'name']
                    }
                ]
            });
            
            if (!updatedPost) {
                throw new AppError('Failed to update post', 500);
            }
            
            const commentCount = await BlogComment.count({
                where: {
                    postId: id,
                    status: 'approved'
                }
            });
            
            return this.mapToPostResponseDto(updatedPost, commentCount);
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new AppError('A post with this title or slug already exists', 400);
            }
            
            throw error;
        }
    }
    
    async delete(id: string): Promise<boolean> {
        const deleted = await BlogPost.destroy({
            where: {
                id
            }
        });
        
        return deleted > 0;
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
        
        // Récupérer le post mis à jour avec les relations
        const publishedPost = await BlogPost.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }
            ]
        });
        
        if (!publishedPost) {
            throw new AppError('Failed to publish post', 500);
        }
        
        const commentCount = await BlogComment.count({
            where: {
                postId: id,
                status: 'approved'
            }
        });
        
        return this.mapToPostResponseDto(publishedPost, commentCount);
    }
    
    async archivePost(id: string): Promise<BlogPostResponseDto | null> {
        const post = await BlogPost.findByPk(id);
        
        if (!post) {
            return null;
        }
        
        await post.update({
            status: 'archived'
        });
        
        // Récupérer le post mis à jour avec les relations
        const archivedPost = await BlogPost.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }
            ]
        });
        
        if (!archivedPost) {
            throw new AppError('Failed to archive post', 500);
        }
        
        const commentCount = await BlogComment.count({
            where: {
                postId: id,
                status: 'approved'
            }
        });
        
        return this.mapToPostResponseDto(archivedPost, commentCount);
    }
    
    private async incrementViewCount(postId: string): Promise<void> {
        try {
            // Si une table de comptage de vues existe, incrémenter le compteur
            await this.sequelize.query(`
                INSERT INTO blog_post_views (post_id, view_count, created_at, updated_at)
                VALUES (:postId, 1, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    view_count = view_count + 1,
                    updated_at = NOW()
            `, {
                replacements: { postId }
            });
        } catch (error) {
            // Si la table n'existe pas encore, ignorer l'erreur
            console.log('View tracking not available, skipping...');
        }
    }
    
    private mapToPostResponseDto(post: BlogPost, commentCount: number): BlogPostResponseDto {
        return {
            id: post.id,
            authorId: post.authorId,
            authorName: post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Unknown',
            categoryId: post.categoryId,
            categoryName: post.category ? post.category.name : 'Unknown',
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            status: post.status,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount: commentCount
        };
    }
    
    // Propriété pour accéder à Sequelize
    private get sequelize(): Sequelize {
        return BlogPost.sequelize!;
    }
}