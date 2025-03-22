// src/interfaces/services/blog-search-service.interface.ts
import { BlogPostResponseDto } from "../../application/dtos/blog/blog-post.dto";

export interface BlogSearchOptions {
    query: string;
    categoryId?: string;
    tagIds?: string[];
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'views' | 'comments';
    sortOrder?: 'asc' | 'desc';
    dateFrom?: Date;
    dateTo?: Date;
}

export interface BlogSearchResult {
    posts: BlogPostResponseDto[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}

export interface BlogSearchServiceInterface {
    search(options: BlogSearchOptions): Promise<BlogSearchResult>;
    searchSuggestions(query: string, limit?: number): Promise<string[]>;
    indexPost(postId: string): Promise<boolean>;
    reindexAllPosts(): Promise<boolean>;
}