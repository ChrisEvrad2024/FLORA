// src/interfaces/repositories/blog-post-repository.interface.ts
import { BlogPostResponseDto } from '../../application/dtos/blog/blog-post-response.dto';
import { CreateBlogPostDto } from '../../application/dtos/blog/create-blog-post.dto';
import { UpdateBlogPostDto } from '../../application/dtos/blog/update-blog-post.dto';
import { BlogFilterDto } from '../../application/dtos/blog/blog-filter.dto';

export interface BlogPostRepositoryInterface {
    findById(id: string, includeComments?: boolean): Promise<BlogPostResponseDto | null>;
    findBySlug(slug: string, includeComments?: boolean): Promise<BlogPostResponseDto | null>;
    findAll(filter: BlogFilterDto): Promise<{ posts: BlogPostResponseDto[], total: number }>;
    create(userId: string, postData: CreateBlogPostDto): Promise<BlogPostResponseDto>;
    update(id: string, postData: UpdateBlogPostDto): Promise<BlogPostResponseDto | null>;
    delete(id: string): Promise<boolean>;
    incrementViewCount(id: string): Promise<boolean>;
    addTag(postId: string, tagName: string): Promise<boolean>;
    removeTag(postId: string, tagName: string): Promise<boolean>;
    getFeaturedPosts(limit?: number): Promise<BlogPostResponseDto[]>;
    getRecentPosts(limit?: number): Promise<BlogPostResponseDto[]>;
    getPopularPosts(limit?: number): Promise<BlogPostResponseDto[]>;
    getRelatedPosts(postId: string, limit?: number): Promise<BlogPostResponseDto[]>;
}