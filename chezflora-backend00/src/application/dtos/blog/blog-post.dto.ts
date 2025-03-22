// src/application/dtos/blog/blog-post.dto.ts
import { BlogTagResponseDto } from './blog-tag.dto';

export interface BlogPostDto {
    categoryId: string;
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status?: 'draft' | 'published' | 'archived';
    tags?: string[] | { id: string; name: string }[];
}

export interface BlogPostResponseDto {
    id: string;
    authorId: string;
    authorName: string;
    categoryId: string;
    categoryName: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status: string;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    commentCount?: number;
    tags?: BlogTagResponseDto[];
    viewCount?: number;
}