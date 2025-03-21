// src/application/dtos/blog/comment-response.dto.ts
export interface CommentResponseDto {
    id: string;
    postId: string;
    userId: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    user?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: Date;
    updatedAt: Date;
}