// src/interfaces/repositories/blog-comment-repository.interface.ts
import { BlogCommentResponseDto } from '../../application/dtos/blog/blog-comment.dto';

export interface BlogCommentRepositoryInterface {
    findByPostId(postId: string, options?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ comments: BlogCommentResponseDto[]; total: number }>;
    create(userId: string, commentData: Omit<BlogCommentResponseDto, 'id' | 'userId' | 'userName' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BlogCommentResponseDto>;
    updateStatus(id: string, status: string): Promise<BlogCommentResponseDto | null>;
    delete(id: string): Promise<boolean>;
}