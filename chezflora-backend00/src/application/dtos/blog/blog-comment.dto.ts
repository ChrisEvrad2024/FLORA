// src/application/dtos/blog/blog-comment.dto.ts
export interface BlogCommentDto {
    postId: string;
    content: string;
}

export interface BlogCommentResponseDto {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    content: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}