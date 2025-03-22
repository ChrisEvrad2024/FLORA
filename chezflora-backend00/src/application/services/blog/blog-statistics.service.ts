// src/application/services/blog/blog-statistics.service.ts
import { BlogStatisticsServiceInterface } from '../../../interfaces/services/blog-statistics-service.interface';
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import { BlogCommentRepositoryInterface } from '../../../interfaces/repositories/blog-comment-repository.interface';
import { BlogCategoryRepositoryInterface } from '../../../interfaces/repositories/blog-category-repository.interface';
import { Sequelize } from 'sequelize-typescript';
import BlogPost from '../../../infrastructure/database/models/blog-post.model';
import BlogComment from '../../../infrastructure/database/models/blog-comment.model';
import { BlogEventsHandler } from '../../events/handlers/blog-events.handler';
import { BlogPostPublishedEvent } from '../../events/blog/blog-post-published.event';
import { BlogCommentAddedEvent } from '../../events/blog/blog-comment-added.event';

export class BlogStatisticsService implements BlogStatisticsServiceInterface {
    // Cache pour optimiser les requêtes fréquentes
    private statsCache: Map<string, { data: any; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes en ms

    constructor(
        private blogPostRepository: BlogPostRepositoryInterface,
        private blogCommentRepository: BlogCommentRepositoryInterface,
        private blogCategoryRepository: BlogCategoryRepositoryInterface,
        private sequelize: Sequelize
    ) {
        // S'abonner aux événements du blog pour invalider le cache quand nécessaire
        this.registerEventListeners();
    }

    /**
     * Obtenir le nombre total d'articles selon les filtres
     */
    async getPostCount(filter?: { categoryId?: string; status?: string; timeRange?: string }): Promise<number> {
        const cacheKey = `post-count-${JSON.stringify(filter || {})}`;
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        const whereClause: any = {};
        
        if (filter?.categoryId) {
            whereClause.categoryId = filter.categoryId;
        }
        
        if (filter?.status) {
            whereClause.status = filter.status;
        }
        
        if (filter?.timeRange) {
            const dateFilter = this.getDateRangeFilter(filter.timeRange);
            if (dateFilter) {
                whereClause.createdAt = dateFilter;
            }
        }
        
        const count = await BlogPost.count({ where: whereClause });
        this.setCacheData(cacheKey, count);
        
        return count;
    }

    /**
     * Obtenir le nombre total de commentaires selon les filtres
     */
    async getCommentCount(filter?: { postId?: string; status?: string; timeRange?: string }): Promise<number> {
        const cacheKey = `comment-count-${JSON.stringify(filter || {})}`;
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        const whereClause: any = {};
        
        if (filter?.postId) {
            whereClause.postId = filter.postId;
        }
        
        if (filter?.status) {
            whereClause.status = filter.status;
        }
        
        if (filter?.timeRange) {
            const dateFilter = this.getDateRangeFilter(filter.timeRange);
            if (dateFilter) {
                whereClause.createdAt = dateFilter;
            }
        }
        
        const count = await BlogComment.count({ where: whereClause });
        this.setCacheData(cacheKey, count);
        
        return count;
    }

    /**
     * Obtenir le nombre total de vues selon les filtres
     */
    async getViewCount(filter?: { postId?: string; timeRange?: string }): Promise<number> {
        const cacheKey = `view-count-${JSON.stringify(filter || {})}`;
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        // Requête SQL directe pour les statistiques de vues (supposons qu'il y a une table blog_post_views)
        const query = `
            SELECT SUM(view_count) as total_views 
            FROM blog_post_views 
            WHERE 1=1
            ${filter?.postId ? `AND post_id = '${filter.postId}'` : ''}
            ${filter?.timeRange ? this.getTimeRangeCondition('created_at', filter.timeRange) : ''}
        `;
        
        const [results] = await this.sequelize.query(query);
        const totalViews = results[0]?.total_views || 0;
        
        this.setCacheData(cacheKey, totalViews);
        
        return totalViews;
    }

    /**
     * Obtenir les articles les plus vus
     */
    async getMostViewedPosts(limit: number = 5, timeRange?: string): Promise<Array<{ id: string; title: string; views: number }>> {
        const cacheKey = `most-viewed-posts-${limit}-${timeRange || 'all'}`;
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        // Requête SQL pour obtenir les articles les plus vus
        const query = `
            SELECT p.id, p.title, SUM(v.view_count) as total_views
            FROM blog_posts p
            JOIN blog_post_views v ON p.id = v.post_id
            WHERE p.status = 'published'
            ${timeRange ? this.getTimeRangeCondition('v.created_at', timeRange) : ''}
            GROUP BY p.id, p.title
            ORDER BY total_views DESC
            LIMIT ${limit}
        `;
        
        const [results] = await this.sequelize.query(query);
        const formattedResults = results.map((row: any) => ({
            id: row.id,
            title: row.title,
            views: parseInt(row.total_views, 10)
        }));
        
        this.setCacheData(cacheKey, formattedResults);
        
        return formattedResults;
    }

    /**
     * Obtenir les articles avec le plus de commentaires
     */
    async getMostCommentedPosts(limit: number = 5, timeRange?: string): Promise<Array<{ id: string; title: string; comments: number }>> {
        const cacheKey = `most-commented-posts-${limit}-${timeRange || 'all'}`;
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        // Requête SQL pour obtenir les articles avec le plus de commentaires
        const query = `
            SELECT p.id, p.title, COUNT(c.id) as comment_count
            FROM blog_posts p
            JOIN blog_comments c ON p.id = c.post_id
            WHERE p.status = 'published' AND c.status = 'approved'
            ${timeRange ? this.getTimeRangeCondition('c.created_at', timeRange) : ''}
            GROUP BY p.id, p.title
            ORDER BY comment_count DESC
            LIMIT ${limit}
        `;
        
        const [results] = await this.sequelize.query(query);
        const formattedResults = results.map((row: any) => ({
            id: row.id,
            title: row.title,
            comments: parseInt(row.comment_count, 10)
        }));
        
        this.setCacheData(cacheKey, formattedResults);
        
        return formattedResults;
    }

    /**
     * Obtenir la distribution des articles par catégorie
     */
    async getCategoryDistribution(): Promise<Array<{ id: string; name: string; posts: number }>> {
        const cacheKey = 'category-distribution';
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        // Requête SQL pour obtenir la distribution des articles par catégorie
        const query = `
            SELECT c.id, c.name, COUNT(p.id) as post_count
            FROM blog_categories c
            LEFT JOIN blog_posts p ON c.id = p.category_id AND p.status = 'published'
            GROUP BY c.id, c.name
            ORDER BY post_count DESC
        `;
        
        const [results] = await this.sequelize.query(query);
        const formattedResults = results.map((row: any) => ({
            id: row.id,
            name: row.name,
            posts: parseInt(row.post_count, 10)
        }));
        
        this.setCacheData(cacheKey, formattedResults);
        
        return formattedResults;
    }

    /**
     * Obtenir le nombre d'articles publiés par mois
     */
    async getPostsPerMonth(months: number = 12): Promise<Array<{ month: string; count: number }>> {
        const cacheKey = `posts-per-month-${months}`;
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        // Requête SQL pour obtenir le nombre d'articles publiés par mois
        const query = `
            SELECT 
                DATE_FORMAT(published_at, '%Y-%m') as month,
                COUNT(id) as post_count
            FROM blog_posts
            WHERE 
                status = 'published' 
                AND published_at IS NOT NULL
                AND published_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ${months} MONTH)
            GROUP BY month
            ORDER BY month ASC
        `;
        
        const [results] = await this.sequelize.query(query);
        const formattedResults = results.map((row: any) => ({
            month: row.month,
            count: parseInt(row.post_count, 10)
        }));
        
        this.setCacheData(cacheKey, formattedResults);
        
        return formattedResults;
    }

    /**
     * Obtenir le nombre de commentaires par mois
     */
    async getCommentsPerMonth(months: number = 12): Promise<Array<{ month: string; count: number }>> {
        const cacheKey = `comments-per-month-${months}`;
        const cachedData = this.getCachedData(cacheKey);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        // Requête SQL pour obtenir le nombre de commentaires par mois
        const query = `
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(id) as comment_count
            FROM blog_comments
            WHERE 
                status = 'approved'
                AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ${months} MONTH)
            GROUP BY month
            ORDER BY month ASC
        `;
        
        const [results] = await this.sequelize.query(query);
        const formattedResults = results.map((row: any) => ({
            month: row.month,
            count: parseInt(row.comment_count, 10)
        }));
        
        this.setCacheData(cacheKey, formattedResults);
        
        return formattedResults;
    }

    /**
     * Suivre une vue d'article
     */
    async trackView(postId: string, userId?: string, metadata?: Record<string, any>): Promise<void> {
        try {
            // Insérer dans la table des vues
            await this.sequelize.query(`
                INSERT INTO blog_post_views (
                    id, 
                    post_id, 
                    user_id, 
                    view_count, 
                    metadata,
                    created_at, 
                    updated_at
                ) VALUES (
                    UUID(), 
                    :postId, 
                    :userId,
                    1,
                    :metadata,
                    NOW(), 
                    NOW()
                )
                ON DUPLICATE KEY UPDATE 
                    view_count = view_count + 1,
                    updated_at = NOW()
            `, {
                replacements: {
                    postId,
                    userId: userId || null,
                    metadata: metadata ? JSON.stringify(metadata) : null
                }
            });
            
            // Invalider les caches liés aux vues
            this.invalidateViewCaches(postId);
        } catch (error) {
            console.error('Error tracking view:', error);
            // Ne pas propager l'erreur pour éviter d'interrompre le flux principal
        }
    }

    /**
     * Méthodes privées pour gérer le cache
     */
    private getCachedData(key: string): any | null {
        const cached = this.statsCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        return null;
    }

    private setCacheData(key: string, data: any): void {
        this.statsCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    private invalidateViewCaches(postId?: string): void {
        // Invalider tous les caches liés aux vues
        for (const key of this.statsCache.keys()) {
            if (key.startsWith('view-count') || 
                key.startsWith('most-viewed-posts') ||
                (postId && key.includes(postId))) {
                this.statsCache.delete(key);
            }
        }
    }

    private invalidateCommentCaches(postId?: string): void {
        // Invalider tous les caches liés aux commentaires
        for (const key of this.statsCache.keys()) {
            if (key.startsWith('comment-count') || 
                key.startsWith('most-commented-posts') ||
                key.startsWith('comments-per-month') ||
                (postId && key.includes(postId))) {
                this.statsCache.delete(key);
            }
        }
    }

    private invalidatePostCaches(categoryId?: string): void {
        // Invalider tous les caches liés aux articles
        for (const key of this.statsCache.keys()) {
            if (key.startsWith('post-count') || 
                key.startsWith('posts-per-month') ||
                key.startsWith('category-distribution') ||
                (categoryId && key.includes(categoryId))) {
                this.statsCache.delete(key);
            }
        }
    }

    private getDateRangeFilter(timeRange: string): any {
        const now = new Date();
        const Op = Sequelize.Op;
        
        switch (timeRange) {
            case 'today':
                return {
                    [Op.gte]: new Date(now.setHours(0, 0, 0, 0))
                };
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                return {
                    [Op.gte]: weekStart
                };
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return {
                    [Op.gte]: monthStart
                };
            case 'year':
                const yearStart = new Date(now.getFullYear(), 0, 1);
                return {
                    [Op.gte]: yearStart
                };
            default:
                return null;
        }
    }

    private getTimeRangeCondition(field: string, timeRange: string): string {
        switch (timeRange) {
            case 'today':
                return `AND ${field} >= DATE(NOW())`;
            case 'week':
                return `AND ${field} >= DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY)`;
            case 'month':
                return `AND ${field} >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')`;
            case 'year':
                return `AND ${field} >= DATE_FORMAT(CURRENT_DATE(), '%Y-01-01')`;
            default:
                return '';
        }
    }

    /**
     * S'abonner aux événements du blog pour mettre à jour les statistiques
     */
    private registerEventListeners(): void {
        BlogEventsHandler.registerListeners(
            undefined,
            undefined,
            (event: BlogPostPublishedEvent) => {
                // Quand un article est publié, invalider les caches de posts
                this.invalidatePostCaches(event.post.categoryId);
            },
            (event: BlogCommentAddedEvent) => {
                // Quand un commentaire est ajouté, invalider les caches de commentaires
                this.invalidateCommentCaches(event.postId);
            }
        );
    }
}