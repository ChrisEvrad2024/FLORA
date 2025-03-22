// src/application/services/blog/blog-comment.service.ts
import { BlogCommentRepositoryInterface } from '../../../interfaces/repositories/blog-comment-repository.interface';
import { BlogCommentDto, BlogCommentResponseDto } from '../../dtos/blog/blog-comment.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import { BlogCommentApprovedEvent } from '../../events/blog/comment-approved.event';
import { BlogEventsHandler } from '../../events/handlers/blog-events.handler';

export class BlogCommentService {
    constructor(
        private blogCommentRepository: BlogCommentRepositoryInterface
    ) {}

    async getCommentsByPostId(
        postId: string,
        options?: {
            status?: string;
            page?: number;
            limit?: number;
        }
    ): Promise<{ comments: BlogCommentResponseDto[]; total: number }> {
        return this.blogCommentRepository.findByPostId(postId, options);
    }

    async createComment(
        userId: string,
        commentData: Omit<BlogCommentDto, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
    ): Promise<BlogCommentResponseDto> {
        return this.blogCommentRepository.create(userId, commentData);
    }

    async approveComment(id: string, approvedBy: string): Promise<BlogCommentResponseDto> {
        const comment = await this.blogCommentRepository.updateStatus(id, 'approved');
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }
        
        // Déclencher l'événement d'approbation
        const commentApprovedEvent = new BlogCommentApprovedEvent(comment, approvedBy);
        BlogEventsHandler.handleCommentApproved(commentApprovedEvent);
        
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