// src/application/services/blog/comment.service.ts
import { CommentServiceInterface } from '../../../interfaces/services/comment-service.interface';
import { CommentRepositoryInterface } from '../../../interfaces/repositories/comment-repository.interface';
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import { CommentResponseDto } from '../../dtos/blog/comment-response.dto';
import { CreateCommentDto } from '../../dtos/blog/create-comment.dto';
import { UpdateCommentDto } from '../../dtos/blog/update-comment.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class CommentService implements CommentServiceInterface {
    constructor(
        private commentRepository: CommentRepositoryInterface,
        private blogPostRepository: BlogPostRepositoryInterface
    ) {}

    async getCommentById(id: string): Promise<CommentResponseDto> {
        const comment = await this.commentRepository.findById(id);
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }
        
        return comment;
    }

    async getCommentsByPostId(postId: string, page: number = 1, limit: number = 10): Promise<{ comments: CommentResponseDto[], pagination: any }> {
        // Check if the post exists
        const post = await this.blogPostRepository.findById(postId);
        
        if (!post) {
            throw new AppError('Blog post not found', 404);
        }
        
        const { comments, total } = await this.commentRepository.findByPostId(postId, page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            comments,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getPendingComments(page: number = 1, limit: number = 10): Promise<{ comments: CommentResponseDto[], pagination: any }> {
        const { comments, total } = await this.commentRepository.findPendingComments(page, limit);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            comments,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async createComment(userId: string, commentData: CreateCommentDto): Promise<CommentResponseDto> {
        if (!userId) {
            throw new AppError('User ID is required', 400);
        }
        
        if (!commentData.postId) {
            throw new AppError('Post ID is required', 400);
        }
        
        if (!commentData.content || commentData.content.trim() === '') {
            throw new AppError('Comment content is required', 400);
        }
        
        // Check if the post exists
        const post = await this.blogPostRepository.findById(commentData.postId);
        
        if (!post) {
            throw new AppError('Blog post not found', 404);
        }
        
        return this.commentRepository.create(userId, commentData);
    }

    async updateComment(id: string, userId: string, commentData: UpdateCommentDto): Promise<CommentResponseDto> {
        // Check if the comment exists
        const comment = await this.commentRepository.findById(id);
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }
        
        // Check if the user is the author of the comment
        if (comment.userId !== userId) {
            throw new AppError('You can only update your own comments', 403);
        }
        
        // Make sure content is provided
        if (!commentData.content || commentData.content.trim() === '') {
            throw new AppError('Comment content is required', 400);
        }
        
        // Users can only update the content, not the status
        const updatedComment = await this.commentRepository.update(id, { content: commentData.content });
        
        if (!updatedComment) {
            throw new AppError('Failed to update comment', 500);
        }
        
        return updatedComment;
    }

    async deleteComment(id: string, userId: string): Promise<boolean> {
        // Check if the comment exists
        const comment = await this.commentRepository.findById(id);
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }
        
        // Check if the user is the author of the comment
        if (comment.userId !== userId) {
            throw new AppError('You can only delete your own comments', 403);
        }
        
        const deleted = await this.commentRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Failed to delete comment', 500);
        }
        
        return true;
    }

    async moderateComment(id: string, status: 'approved' | 'rejected'): Promise<CommentResponseDto> {
        // Check if the comment exists
        const comment = await this.commentRepository.findById(id);
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }
        
        const moderatedComment = await this.commentRepository.moderateComment(id, status);
        
        if (!moderatedComment) {
            throw new AppError('Failed to moderate comment', 500);
        }
        
        return moderatedComment;
    }
}