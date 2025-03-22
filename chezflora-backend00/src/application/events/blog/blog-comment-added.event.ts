// src/application/events/blog/blog-comment-added.event.ts
import { BlogCommentResponseDto } from "../../dtos/blog/blog-comment.dto";

export class BlogCommentAddedEvent {
    constructor(
        public readonly comment: BlogCommentResponseDto,
        public readonly postId: string
    ) {}
}