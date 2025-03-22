// src/interfaces/services/blog-statistics-service.interface.ts
export interface BlogStatisticsServiceInterface {
    getPostCount(filter?: { categoryId?: string; status?: string; timeRange?: string }): Promise<number>;
    getCommentCount(filter?: { postId?: string; status?: string; timeRange?: string }): Promise<number>;
    getViewCount(filter?: { postId?: string; timeRange?: string }): Promise<number>;
    getMostViewedPosts(limit?: number, timeRange?: string): Promise<Array<{ id: string; title: string; views: number }>>;
    getMostCommentedPosts(limit?: number, timeRange?: string): Promise<Array<{ id: string; title: string; comments: number }>>;
    getCategoryDistribution(): Promise<Array<{ id: string; name: string; posts: number }>>;
    getPostsPerMonth(months?: number): Promise<Array<{ month: string; count: number }>>;
    getCommentsPerMonth(months?: number): Promise<Array<{ month: string; count: number }>>;
    trackView(postId: string, userId?: string, metadata?: Record<string, any>): Promise<void>;
}