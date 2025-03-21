// src/application/dtos/blog/create-blog-post.dto.ts
export interface CreateBlogPostDto {
    title: string;
    content: string;
    excerpt?: string;
    categoryId: string;
    status?: 'draft' | 'published';
    publishDate?: Date;
    featuredImage?: string;
    tags?: string[];
}