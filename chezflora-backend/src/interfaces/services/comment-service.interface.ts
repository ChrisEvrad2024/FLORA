// src/interfaces/services/comment-service.interface.ts
import { CommentResponseDto } from '../../application/dtos/blog/comment-response.dto';
import { CreateCommentDto } from '../../application/dtos/blog/create-comment.dto';
import { UpdateCommentDto } from '../../application/dtos/blog/update-comment.dto';

export interface CommentServiceInterface {
    getCommentById(id: string): Promise<CommentResponseDto>;
    getCommentsByPostId(postId: string, page?: number, limit?: number): Promise<{ comments: CommentResponseDto[], pagination: any }>;
    getPendingComments(page?: number, limit?: number): Promise<{ comments: CommentResponseDto[], pagination: any }>;
    createComment(userId: string, commentData: CreateCommentDto): Promise<CommentResponseDto>;
    updateComment(id: string, userId: string, commentData: UpdateCommentDto): Promise<CommentResponseDto>;
    deleteComment(id: string, userId: string): Promise<boolean>;
    moderateComment(id: string, status: 'approved' | 'rejected'): Promise<CommentResponseDto>;
}