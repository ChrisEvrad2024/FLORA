// src/application/services/blog/blog-post.service.ts
import { BlogPostServiceInterface } from '../../../interfaces/services/blog-post-service.interface';
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import { BlogPostResponseDto } from '../../dtos/blog/blog-post-response.dto';
import { CreateBlogPostDto } from '../../dtos/blog/create-blog-post.dto';
import { UpdateBlogPostDto } from '../../dtos/blog/update-blog-post.dto';
import { BlogFilterDto } from '../../dtos/blog/blog-filter.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class BlogPostService implements BlogPostServiceInterface {
    constructor(private blogPostRepository: BlogPostRepositoryInterface) {}

    async getBlogPostById(id: string, includeComments: boolean = false): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.findById(id, includeComments);
        
        if (!post) {
            throw new AppError('Blog post not found', 404);
        }
        
        return post;
    }

    async getBlogPostBySlug(slug: string, includeComments: boolean = false): Promise<BlogPostResponseDto> {
        const post = await this.blogPostRepository.findBySlug(slug, includeComments);
        
        if (!post) {
            throw new AppError('Blog post not found', 404);
        }
        
        return post;
    }

    async getAllBlogPosts(filter: BlogFilterDto): Promise<{ posts: BlogPostResponseDto[], pagination: any }> {
        const page = filter.page || 1;
        const limit = filter.limit || 10;
        
        const { posts, total } = await this.blogPostRepository.findAll(filter);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async createBlogPost(userId: string, postData: CreateBlogPostDto): Promise<BlogPostResponseDto> {
        if (!userId) {
            throw new AppError('User ID is required', 400);
        }
        
        if (!postData.title) {
            throw new AppError('Title is required', 400);
        }
        
        if (!postData.content) {
            throw new AppError('Content is required', 400);
        }
        
        if (!postData.categoryId) {
            throw new AppError('Category ID is required', 400);
        }
        
        // Create the blog post
        return this.blogPostRepository.create(userId, postData);
    }

    async updateBlogPost(id: string, postData: UpdateBlogPostDto): Promise<BlogPostResponseDto> {
        const updatedPost = await this.blogPostRepository.update(id, postData);
        
        if (!updatedPost) {
            throw new AppError('Blog post not found', 404);
        }
        
        return updatedPost;
    }

    async deleteBlogPost(id: string): Promise<boolean> {
        const deleted = await this.blogPostRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Blog post not found', 404);
        }
        
        return true;
    }

    async viewBlogPost(id: string): Promise<boolean> {
        const incremented = await this.blogPostRepository.incrementViewCount(id);
        
        if (!incremented) {
            throw new AppError('Blog post not found', 404);
        }
        
        return true;
    }

    async addTagToBlogPost(postId: string, tagName: string): Promise<boolean> {
        const post = await this.blogPostRepository.findById(postId);
        
        if (!post) {
            throw new AppError('Blog post not found', 404);
        }
        
        return this.blogPostRepository.addTag(postId, tagName);
    }

    async removeTagFromBlogPost(postId: string, tagName: string): Promise<boolean> {
        const post = await this.blogPostRepository.findById(postId);
        
        if (!post) {
            throw new AppError('Blog post not found', 404);
        }
        
        return this.blogPostRepository.removeTag(postId, tagName);
    }

    async getFeaturedBlogPosts(limit: number = 5): Promise<BlogPostResponseDto[]> {
        return this.blogPostRepository.getFeaturedPosts(limit);
    }

    async getRecentBlogPosts(limit: number = 5): Promise<BlogPostResponseDto[]> {
        return this.blogPostRepository.getRecentPosts(limit);
    }

    async getPopularBlogPosts(limit: number = 5): Promise<BlogPostResponseDto[]> {
        return this.blogPostRepository.getPopularPosts(limit);
    }

    async getRelatedBlogPosts(postId: string, limit: number = 3): Promise<BlogPostResponseDto[]> {
        const post = await this.blogPostRepository.findById(postId);
        
        if (!post) {
            throw new AppError('Blog post not found', 404);
        }
        
        return this.blogPostRepository.getRelatedPosts(postId, limit);
    }
}