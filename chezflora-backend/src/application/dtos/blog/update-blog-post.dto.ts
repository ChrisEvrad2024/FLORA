// src/application/dtos/blog/update-blog-post.dto.ts
export interface UpdateBlogPostDto {
    title?: string;
    content?: string;
    excerpt?: string;
    categoryId?: string;
    status?: 'draft' | 'published' | 'archived';
    publishDate?: Date;
    featuredImage?: string;
    tags?: string[];
    slug?: string;
}