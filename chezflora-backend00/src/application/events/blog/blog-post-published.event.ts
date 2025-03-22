// src/application/events/blog/blog-post-published.event.ts
import { BlogPostResponseDto } from "../../dtos/blog/blog-post.dto";

export class BlogPostPublishedEvent {
    constructor(
        public readonly post: BlogPostResponseDto,
        public readonly publishedBy: string
    ) {}
}