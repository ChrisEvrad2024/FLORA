// src/services/blog.service.ts
import apiService from './api';
import { BlogPost, BlogComment } from '@/types/blog';

interface BlogResponse {
    success: boolean;
    message: string;
    data: {
        posts: BlogPost[];
        totalCount: number;
        totalPages: number;
    }
}

interface BlogPostResponse {
    success: boolean;
    message: string;
    data: BlogPost;
}

interface CommentsResponse {
    success: boolean;
    message: string;
    data: BlogComment[];
}

interface CommentResponse {
    success: boolean;
    message: string;
    data: BlogComment;
}

interface BlogParams {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    sort?: string;
}

class BlogService {
    async getBlogPosts(params: BlogParams = {}): Promise<BlogResponse> {
        return apiService.get<BlogResponse>('/blog/posts', { params });
    }

    async getBlogPostById(id: number): Promise<BlogPostResponse> {
        return apiService.get<BlogPostResponse>(`/blog/posts/${id}`);
    }

    async getBlogPostBySlug(slug: string): Promise<BlogPostResponse> {
        return apiService.get<BlogPostResponse>(`/blog/posts/slug/${slug}`);
    }

    async getBlogPostsByCategory(category: string): Promise<BlogResponse> {
        return apiService.get<BlogResponse>('/blog/posts', {
            params: { category }
        });
    }

    async getBlogPostsByTag(tag: string): Promise<BlogResponse> {
        return apiService.get<BlogResponse>('/blog/posts', {
            params: { tag }
        });
    }

    async getRecentBlogPosts(limit: number = 3): Promise<BlogResponse> {
        return apiService.get<BlogResponse>('/blog/posts', {
            params: { limit, sort: 'date:desc' }
        });
    }

    async getPopularBlogPosts(limit: number = 3): Promise<BlogResponse> {
        return apiService.get<BlogResponse>('/blog/posts', {
            params: { limit, sort: 'views:desc' }
        });
    }

    async getCommentsByPostId(postId: number): Promise<CommentsResponse> {
        return apiService.get<CommentsResponse>(`/blog/posts/${postId}/comments`);
    }

    async addComment(postId: number, content: string, parentId?: number): Promise<CommentResponse> {
        return apiService.post<CommentResponse>('/blog/comments', {
            postId,
            content,
            parentId
        });
    }

    // Track view - increment view count
    async trackView(postId: number): Promise<void> {
        await apiService.post(`/blog/stats/views/track/${postId}`);
    }

    // Admin methods
    async createBlogPost(postData: FormData): Promise<BlogPostResponse> {
        return apiService.post<BlogPostResponse>('/blog/posts', postData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async updateBlogPost(id: number, postData: FormData): Promise<BlogPostResponse> {
        return apiService.put<BlogPostResponse>(`/blog/posts/${id}`, postData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async deleteBlogPost(id: number): Promise<any> {
        return apiService.delete(`/blog/posts/${id}`);
    }
}

export const blogService = new BlogService();
export default blogService;