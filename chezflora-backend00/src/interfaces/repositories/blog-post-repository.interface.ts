// src/interfaces/repositories/blog-post-repository.interface.ts
import { BlogPostResponseDto } from '../../application/dtos/blog/blog-post.dto';

export interface BlogPostRepositoryInterface {
    findAll(options?: {
        categoryId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ posts: BlogPostResponseDto[]; total: number }>;
    findById(id: string): Promise<BlogPostResponseDto | null>;
    findBySlug(slug: string): Promise<BlogPostResponseDto | null>;
    create(authorId: string, postData: Omit<BlogPostResponseDto, 'id' | 'authorId' | 'authorName' | 'categoryName' | 'createdAt' | 'updatedAt' | 'commentCount'>): Promise<BlogPostResponseDto>;
    update(id: string, postData: Partial<BlogPostResponseDto>): Promise<BlogPostResponseDto | null>;
    delete(id: string): Promise<boolean>;
    publishPost(id: string): Promise<BlogPostResponseDto | null>;
    archivePost(id: string): Promise<BlogPostResponseDto | null>;
}