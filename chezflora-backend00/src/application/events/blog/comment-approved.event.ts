// src/application/events/blog/comment-approved.event.ts
import { BlogCommentResponseDto } from '../../dtos/blog/blog-comment.dto';

export class BlogCommentApprovedEvent {
    constructor(
        public readonly comment: BlogCommentResponseDto,
        public readonly approvedBy: string,
        public readonly timestamp: Date = new Date()
    ) {}
}