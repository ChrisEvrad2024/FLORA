// src/application/services/blog/blog-post.service.ts
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import { BlogTagRepositoryInterface } from '../../../interfaces/repositories/blog-tag-repository.interface';
import { BlogPostDto, BlogPostResponseDto } from '../../../application/dtos/blog/blog-post.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import { BlogPostPublishedEvent } from '../../events/blog/post-published.event';
import { BlogEventsHandler } from '../../events/handlers/blog-events.handler';
import slugify from 'slugify';

export class BlogPostService {
    constructor(
        private blogPostRepository: BlogPostRepositoryInterface,
        private blogTagRepository: BlogTagRepositoryInterface
    ) {}

    async getAllPosts(options?: {
        categoryId?: string;
        tagId?: string;
        status?: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{ posts: BlogPostResponseDto[]; total: number; totalPages: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        
        const { posts, total } = await this.blogPostRepository.findAll({
            ...options,
            page,
            limit
        });
        
        const totalPages = Math.ceil(total / limit);
        
        // Pour chaque post, récupérer les tags associés
        for (const post of posts) {
            const tags = await this.blogTagRepository.findByPostId(post.id);
            post.tags = tags;
        }
        
        return {
            posts,
            total,
            totalPages
        };
    }

    async getPostById(id: string): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.findById(id);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        // Récupérer les tags associés au post
        const tags = await this.blogTagRepository.findByPostId(id);
        post.tags = tags;
        
        return post;
    }

    async getPostBySlug(slug: string): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.findBySlug(slug);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        // Récupérer les tags associés au post
        const tags = await this.blogTagRepository.findByPostId(post.id);
        post.tags = tags;
        
        return post;
    }

    async createPost(authorId: string, postData: BlogPostDto): Promise<BlogPostResponseDto> {
        // Générer le slug à partir du titre
        const slug = slugify(postData.title, { lower: true });
        
        // Vérifier si le slug existe déjà
        const existingPost = await this.blogPostRepository.findBySlug(slug);
        if (existingPost) {
            throw new AppError('A post with this title already exists', 400);
        }
        
        // Générer l'extrait s'il n'est pas fourni
        const excerpt = postData.excerpt || postData.content.substring(0, 150) + '...';
        
        // Ensure status has a default value if not provided
        const status = postData.status || 'draft';
        
        // Créer le post
        const post = await this.blogPostRepository.create(authorId, {
            ...postData,
            slug,
            excerpt,
            status
        });
        
        // Si des tags sont fournis, les associer au post
        if (postData.tags && Array.isArray(postData.tags) && postData.tags.length > 0) {
            await this.processPostTags(post.id, postData.tags);
        }
        
        // Récupérer le post avec les tags
        return this.getPostById(post.id);
    }

    async updatePost(id: string, postData: Partial<BlogPostDto>): Promise<BlogPostResponseDto> {
        // Si le titre est modifié, mettre à jour le slug
        let slug;
        if (postData.title) {
            slug = slugify(postData.title, { lower: true });
            
            // Vérifier si le slug existe déjà pour un autre post
            const existingPost = await this.blogPostRepository.findBySlug(slug);
            if (existingPost && existingPost.id !== id) {
                throw new AppError('A post with this title already exists', 400);
            }
        }
        
        // Mettre à jour l'extrait si le contenu est modifié
        let excerpt;
        if (postData.content && !postData.excerpt) {
            excerpt = postData.content.substring(0, 150) + '...';
        }
        
        // Get the existing post to merge with updates
        const existingPost = await this.blogPostRepository.findById(id);
        if (!existingPost) {
            throw new AppError('Post not found', 404);
        }
        
        // Mettre à jour le post
        const post = await this.blogPostRepository.update(id, {
            ...postData,
            status: postData.status || existingPost.status,
            slug: slug || existingPost.slug,
            excerpt: excerpt || postData.excerpt || existingPost.excerpt
        });
        
        // Si des tags sont fournis, mettre à jour les associations
        if (postData.tags !== undefined) {
            await this.processPostTags(id, postData.tags);
        }
        
        // Récupérer le post mis à jour avec les tags
        return this.getPostById(id);
    }

    async deletePost(id: string): Promise<boolean> {
        const deleted = await this.blogPostRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Post not found', 404);
        }
        
        return true;
    }

    async publishPost(id: string, publishedBy: string): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.publishPost(id);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        // Récupérer les tags associés au post
        const tags = await this.blogTagRepository.findByPostId(id);
        post.tags = tags;
        
        // Déclencher l'événement de publication
        const publishEvent = new BlogPostPublishedEvent(post, publishedBy);
        BlogEventsHandler.handlePostPublished(publishEvent);
        
        return post;
    }

    async archivePost(id: string): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.archivePost(id);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        // Récupérer les tags associés au post
        const tags = await this.blogTagRepository.findByPostId(id);
        post.tags = tags;
        
        return post;
    }

    private async processPostTags(postId: string, tags: any[]): Promise<void> {
        // Si ce sont des noms de tags, créer ou récupérer les tags existants
        if (tags.length > 0) {
            let tagIds: string[] = [];
            
            if (typeof tags[0] === 'string') {
                const tagObjects = await Promise.all(
                    (tags as string[]).map(tagName => 
                        this.blogTagRepository.findOrCreateByName(tagName)
                    )
                );
                tagIds = tagObjects.map(tag => tag.id);
            } 
            // Si ce sont des IDs de tags ou des objets avec des IDs
            else if (typeof tags[0] === 'object') {
                tagIds = tags.map(tag => typeof tag === 'object' && tag.id ? tag.id : tag);
            }
            
            await this.blogTagRepository.setPostTags(postId, tagIds);
        } else {
            // Si le tableau est vide, supprimer toutes les associations
            await this.blogTagRepository.setPostTags(postId, []);
        }
    }
}