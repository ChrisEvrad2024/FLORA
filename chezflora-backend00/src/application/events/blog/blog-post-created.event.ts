// src/application/events/blog/blog-post-created.event.ts
import { BlogPostResponseDto } from "../../dtos/blog/blog-post.dto";

export class BlogPostCreatedEvent {
    constructor(
        public readonly post: BlogPostResponseDto,
        public readonly createdBy: string
    ) {}
}