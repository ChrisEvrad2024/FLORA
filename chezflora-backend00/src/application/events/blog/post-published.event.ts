// src/application/events/blog/post-published.event.ts
import { BlogPostResponseDto } from '../../dtos/blog/blog-post.dto';

export class BlogPostPublishedEvent {
    constructor(
        public readonly post: BlogPostResponseDto,
        public readonly publishedBy: string,
        public readonly timestamp: Date = new Date()
    ) {}
}