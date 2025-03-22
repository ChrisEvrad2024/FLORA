// src/application/services/blog/blog-comment.service.ts
import { BlogCommentRepositoryInterface } from '../../../interfaces/repositories/blog-comment-repository.interface';
import { BlogCommentDto, BlogCommentResponseDto } from '../../../application/dtos/blog/blog-comment.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class BlogCommentService {
    constructor(private blogCommentRepository: BlogCommentRepositoryInterface) {}

    async getCommentsByPostId(postId: string, options?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ comments: BlogCommentResponseDto[]; total: number; totalPages: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        
        const { comments, total } = await this.blogCommentRepository.findByPostId(postId, {
            ...options,
            page,
            limit
        });
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            comments,
            total,
            totalPages
        };
    }

    async createComment(userId: string, commentData: BlogCommentDto): Promise<BlogCommentResponseDto> {
        return this.blogCommentRepository.create(userId, commentData);
    }

    async approveComment(id: string): Promise<BlogCommentResponseDto> {
        const comment = await this.blogCommentRepository.updateStatus(id, 'approved');
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }
        
        return comment;
    }

    async rejectComment(id: string): Promise<BlogCommentResponseDto> {
        const comment = await this.blogCommentRepository.updateStatus(id, 'rejected');
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }
        
        return comment;
    }

    async deleteComment(id: string): Promise<boolean> {
        const deleted = await this.blogCommentRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Comment not found', 404);
        }
        
        return true;
    }
}