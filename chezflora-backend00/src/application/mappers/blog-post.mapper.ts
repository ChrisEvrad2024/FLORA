// src/application/mappers/blog-post.mapper.ts
import { BlogPostResponseDto } from '../dtos/blog/blog-post.dto';
import { BlogTagResponseDto } from '../dtos/blog/blog-tag.dto';

export class BlogPostMapper {
    /**
     * Map database entity to DTO
     */
    static toDto(post: any, tags: BlogTagResponseDto[] = []): BlogPostResponseDto {
        return {
            id: post.id,
            authorId: post.authorId,
            authorName: post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Unknown',
            categoryId: post.categoryId,
            categoryName: post.category ? post.category.name : 'Uncategorized',
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            status: post.status,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount: post.commentCount || 0,
            viewCount: post.viewCount || 0,
            tags: tags
        };
    }

    /**
     * Map multiple database entities to DTOs
     */
    static toDtoList(posts: any[], tagsMap: { [postId: string]: BlogTagResponseDto[] } = {}): BlogPostResponseDto[] {
        return posts.map(post => this.toDto(post, tagsMap[post.id] || []));
    }
}