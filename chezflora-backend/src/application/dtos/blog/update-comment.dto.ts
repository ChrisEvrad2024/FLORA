// src/application/dtos/blog/update-comment.dto.ts
export interface UpdateCommentDto {
    content?: string;
    status?: 'pending' | 'approved' | 'rejected';
}