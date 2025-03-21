// src/interfaces/repositories/comment-repository.interface.ts
import { CommentResponseDto } from '../../application/dtos/blog/comment-response.dto';
import { CreateCommentDto } from '../../application/dtos/blog/create-comment.dto';
import { UpdateCommentDto } from '../../application/dtos/blog/update-comment.dto';

export interface CommentRepositoryInterface {
    findById(id: string): Promise<CommentResponseDto | null>;
    findByPostId(postId: string, page?: number, limit?: number): Promise<{ comments: CommentResponseDto[], total: number }>;
    findPendingComments(page?: number, limit?: number): Promise<{ comments: CommentResponseDto[], total: number }>;
    create(userId: string, commentData: CreateCommentDto): Promise<CommentResponseDto>;
    update(id: string, commentData: UpdateCommentDto): Promise<CommentResponseDto | null>;
    delete(id: string): Promise<boolean>;
    moderateComment(id: string, status: 'approved' | 'rejected'): Promise<CommentResponseDto | null>;
}