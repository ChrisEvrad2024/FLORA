// src/application/dtos/blog/blog-post.dto.ts
import { BlogTagResponseDto } from "../../application/dtos/blog/blog-tag.dto";

export interface BlogPostDto {
    title: string;
    content: string;
    excerpt?: string;
    slug?: string;
    categoryId?: string;
    featuredImage?: string;
    status?: string;
    tags?: (string | { id: string })[];
}

export interface BlogPostResponseDto {
    id: string;
    authorId: string;
    authorName: string;
    categoryId: string | null;
    categoryName: string | null;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage: string | null;
    status: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    commentCount: number;
    tags?: BlogTagResponseDto[];
    viewCount?: number;
}