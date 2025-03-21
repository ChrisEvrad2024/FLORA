// src/application/dtos/blog/blog-post-response.dto.ts
export interface BlogPostResponseDto {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    categoryId: string;
    userId: string;
    status: 'draft' | 'published' | 'archived';
    publishDate?: Date;
    featuredImage?: string;
    views: number;
    author?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    category?: {
        id: string;
        name: string;
    };
    tags?: string[];
    comments?: {
        id: string;
        content: string;
        userId: string;
        userName: string;
        createdAt: Date;
        status: 'pending' | 'approved' | 'rejected';
    }[];
    createdAt: Date;
    updatedAt: Date;
}