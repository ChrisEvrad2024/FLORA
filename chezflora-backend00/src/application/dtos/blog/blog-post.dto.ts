// src/application/dtos/blog/blog-post.dto.ts
export interface BlogPostDto {
    categoryId: string;
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status?: 'draft' | 'published' | 'archived';
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
}