// src/application/events/blog/blog-post-updated.event.ts
import { BlogPostResponseDto } from "../../dtos/blog/blog-post.dto";

export class BlogPostUpdatedEvent {
    constructor(
        public readonly post: BlogPostResponseDto,
        public readonly updatedBy: string
    ) {}
}