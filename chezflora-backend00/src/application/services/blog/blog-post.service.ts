// src/application/services/blog/blog-post.service.ts
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import { BlogPostDto, BlogPostResponseDto } from '../../../application/dtos/blog/blog-post.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import slugify from 'slugify';

export class BlogPostService {
    constructor(private blogPostRepository: BlogPostRepositoryInterface) {}

    async getAllPosts(options?: {
        categoryId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ posts: BlogPostResponseDto[]; total: number; totalPages: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        
        const { posts, total } = await this.blogPostRepository.findAll({
            ...options,
            page,
            limit
        });
        
        const totalPages = Math.ceil(total / limit);
        
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
        
        return post;
    }

    async getPostBySlug(slug: string): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.findBySlug(slug);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
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
        
        return this.blogPostRepository.create(authorId, {
            ...postData,
            slug,
            excerpt,
            status
        });
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
        
        const post = await this.blogPostRepository.update(id, {
            ...postData,
            status: postData.status || existingPost.status,
            slug: slug || existingPost.slug,
            excerpt: excerpt || postData.excerpt || existingPost.excerpt
        });
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        return post;
    }

    async deletePost(id: string): Promise<boolean> {
        const deleted = await this.blogPostRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Post not found', 404);
        }
        
        return true;
    }

    async publishPost(id: string): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.publishPost(id);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        return post;
    }

    async archivePost(id: string): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.archivePost(id);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        return post;
    }
}