// src/application/dtos/blog/blog-comment.dto.ts
export interface BlogCommentDto {
    postId: string;
    content: string;
}

export interface BlogCommentResponseDto extends BlogCommentDto {
    id: string;
    userId: string;
    userName: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}