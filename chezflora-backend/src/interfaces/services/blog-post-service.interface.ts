// src/interfaces/services/blog-post-service.interface.ts
import { BlogPostResponseDto } from '../../application/dtos/blog/blog-post-response.dto';
import { CreateBlogPostDto } from '../../application/dtos/blog/create-blog-post.dto';
import { UpdateBlogPostDto } from '../../application/dtos/blog/update-blog-post.dto';
import { BlogFilterDto } from '../../application/dtos/blog/blog-filter.dto';

export interface BlogPostServiceInterface {
    getBlogPostById(id: string, includeComments?: boolean): Promise<BlogPostResponseDto>;
    getBlogPostBySlug(slug: string, includeComments?: boolean): Promise<BlogPostResponseDto>;
    getAllBlogPosts(filter: BlogFilterDto): Promise<{ posts: BlogPostResponseDto[], pagination: any }>;
    createBlogPost(userId: string, postData: CreateBlogPostDto): Promise<BlogPostResponseDto>;
    updateBlogPost(id: string, postData: UpdateBlogPostDto): Promise<BlogPostResponseDto>;
    deleteBlogPost(id: string): Promise<boolean>;
    viewBlogPost(id: string): Promise<boolean>;
    addTagToBlogPost(postId: string, tagName: string): Promise<boolean>;
    removeTagFromBlogPost(postId: string, tagName: string): Promise<boolean>;
    getFeaturedBlogPosts(limit?: number): Promise<BlogPostResponseDto[]>;
    getRecentBlogPosts(limit?: number): Promise<BlogPostResponseDto[]>;
    getPopularBlogPosts(limit?: number): Promise<BlogPostResponseDto[]>;
    getRelatedBlogPosts(postId: string, limit?: number): Promise<BlogPostResponseDto[]>;
}