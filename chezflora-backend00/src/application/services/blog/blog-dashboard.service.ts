// src/application/services/blog/blog-dashboard.service.ts
import { BlogStatisticsServiceInterface } from '../../../interfaces/services/blog-statistics-service.interface';
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import { BlogCommentRepositoryInterface } from '../../../interfaces/repositories/blog-comment-repository.interface';
import { BlogCategoryRepositoryInterface } from '../../../interfaces/repositories/blog-category-repository.interface';
import { BlogTagRepositoryInterface } from '../../../interfaces/repositories/blog-tag-repository.interface';
import { BlogPostResponseDto } from '../../dtos/blog/blog-post.dto';
import { BlogCommentResponseDto } from '../../dtos/blog/blog-comment.dto';
import { Sequelize } from 'sequelize-typescript';

interface DashboardSummary {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    archivedPosts: number;
    totalComments: number;
    pendingComments: number;
    totalViews: number;
    totalCategories: number;
    totalTags: number;
    recentPosts: BlogPostResponseDto[];
    recentComments: BlogCommentResponseDto[];
    postsPerMonth: Array<{ month: string; count: number }>;
    commentsPerMonth: Array<{ month: string; count: number }>;
    categoryDistribution: Array<{ id: string; name: string; posts: number }>;
    mostViewedPosts: Array<{ id: string; title: string; views: number }>;
    mostCommentedPosts: Array<{ id: string; title: string; comments: number }>;
}

export class BlogDashboardService {
    constructor(
        private blogStatisticsService: BlogStatisticsServiceInterface,
        private blogPostRepository: BlogPostRepositoryInterface,
        private blogCommentRepository: BlogCommentRepositoryInterface,
        private blogCategoryRepository: BlogCategoryRepositoryInterface,
        private blogTagRepository: BlogTagRepositoryInterface,
        private sequelize: Sequelize
    ) {}

    /**
     * Récupérer un résumé complet pour le tableau de bord
     */
    async getDashboardSummary(): Promise<DashboardSummary> {
        try {
            // Exécuter toutes les requêtes en parallèle pour de meilleures performances
            const [
                totalPosts,
                publishedPosts,
                draftPosts,
                archivedPosts,
                totalComments,
                pendingComments,
                totalViews,
                totalCategories,
                totalTags,
                recentPostsData,
                recentCommentsData,
                postsPerMonth,
                commentsPerMonth,
                categoryDistribution,
                mostViewedPosts,
                mostCommentedPosts
            ] = await Promise.all([
                // Comptes des posts par statut
                this.blogStatisticsService.getPostCount(),
                this.blogStatisticsService.getPostCount({ status: 'published' }),
                this.blogStatisticsService.getPostCount({ status: 'draft' }),
                this.blogStatisticsService.getPostCount({ status: 'archived' }),
                
                // Comptes des commentaires
                this.blogStatisticsService.getCommentCount(),
                this.blogStatisticsService.getCommentCount({ status: 'pending' }),
                
                // Total des vues
                this.blogStatisticsService.getViewCount(),
                
                // Comptage des catégories et tags
                this.countCategories(),
                this.countTags(),
                
                // Posts récents
                this.getRecentPosts(5),
                
                // Commentaires récents
                this.getRecentComments(5),
                
                // Graphiques temporels
                this.blogStatisticsService.getPostsPerMonth(6),
                this.blogStatisticsService.getCommentsPerMonth(6),
                
                // Distribution par catégorie
                this.blogStatisticsService.getCategoryDistribution(),
                
                // Posts les plus populaires
                this.blogStatisticsService.getMostViewedPosts(5),
                this.blogStatisticsService.getMostCommentedPosts(5)
            ]);

            return {
                totalPosts,
                publishedPosts,
                draftPosts,
                archivedPosts,
                totalComments,
                pendingComments,
                totalViews,
                totalCategories,
                totalTags,
                recentPosts: recentPostsData,
                recentComments: recentCommentsData,
                postsPerMonth,
                commentsPerMonth,
                categoryDistribution,
                mostViewedPosts,
                mostCommentedPosts
            };
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            throw error;
        }
    }

    /**
     * Récupérer un résumé rapide (léger) pour le tableau de bord
     */
    async getQuickSummary(): Promise<Partial<DashboardSummary>> {
        try {
            // Exécuter uniquement les requêtes essentielles
            const [
                totalPosts,
                publishedPosts,
                draftPosts,
                totalComments,
                pendingComments,
                recentPostsData
            ] = await Promise.all([
                this.blogStatisticsService.getPostCount(),
                this.blogStatisticsService.getPostCount({ status: 'published' }),
                this.blogStatisticsService.getPostCount({ status: 'draft' }),
                this.blogStatisticsService.getCommentCount(),
                this.blogStatisticsService.getCommentCount({ status: 'pending' }),
                this.getRecentPosts(3)
            ]);

            return {
                totalPosts,
                publishedPosts,
                draftPosts,
                totalComments,
                pendingComments,
                recentPosts: recentPostsData
            };
        } catch (error) {
            console.error('Error fetching quick summary:', error);
            throw error;
        }
    }

    /**
     * Récupérer les statistiques des articles pour une période donnée
     */
    async getPostStatistics(timeRange: string = 'month'): Promise<any> {
        try {
            const [
                totalCount,
                postsPerCategory,
                postsPerTag,
                postsByStatus
            ] = await Promise.all([
                this.blogStatisticsService.getPostCount({ timeRange }),
                this.getPostsPerCategory(timeRange),
                this.getPostsPerTag(timeRange),
                this.getPostsByStatus(timeRange)
            ]);

            return {
                totalCount,
                postsPerCategory,
                postsPerTag,
                postsByStatus
            };
        } catch (error) {
            console.error(`Error fetching post statistics for ${timeRange}:`, error);
            throw error;
        }
    }

    /**
     * Récupérer les statistiques des commentaires pour une période donnée
     */
    async getCommentStatistics(timeRange: string = 'month'): Promise<any> {
        try {
            const [
                totalCount,
                commentsByStatus,
                commentsPerPost
            ] = await Promise.all([
                this.blogStatisticsService.getCommentCount({ timeRange }),
                this.getCommentsByStatus(timeRange),
                this.getCommentsPerPost(timeRange, 5)
            ]);

            return {
                totalCount,
                commentsByStatus,
                commentsPerPost
            };
        } catch (error) {
            console.error(`Error fetching comment statistics for ${timeRange}:`, error);
            throw error;
        }
    }

    /**
     * Méthodes privées auxiliaires
     */
    
    private async countCategories(): Promise<number> {
        const categories = await this.blogCategoryRepository.findAll();
        return categories.length;
    }

    private async countTags(): Promise<number> {
        const tags = await this.blogTagRepository.findAll();
        return tags.length;
    }

    private async getRecentPosts(limit: number = 5): Promise<BlogPostResponseDto[]> {
        const { posts } = await this.blogPostRepository.findAll({
            limit,
            page: 1
        });
        return posts;
    }

    private async getRecentComments(limit: number = 5): Promise<BlogCommentResponseDto[]> {
        // Adapter selon l'interface de votre repository
        const { comments } = await this.blogCommentRepository.findByPostId('all', {
            limit,
            page: 1
        });
        return comments;
    }

    private async getPostsPerCategory(timeRange: string): Promise<Array<{ id: string; name: string; count: number }>> {
        const dateFilter = this.getDateFilter(timeRange);
        
        // Requête SQL pour obtenir le nombre d'articles par catégorie
        const query = `
            SELECT 
                c.id, 
                c.name, 
                COUNT(p.id) as post_count
            FROM 
                blog_categories c
            LEFT JOIN 
                blog_posts p ON c.id = p.category_id
                ${dateFilter ? `AND p.created_at ${dateFilter}` : ''}
            GROUP BY 
                c.id, c.name
            ORDER BY 
                post_count DESC
        `;
        
        const [results] = await this.sequelize.query(query);
        
        return results.map((row: any) => ({
            id: row.id,
            name: row.name,
            count: parseInt(row.post_count, 10)
        }));
    }

    private async getPostsPerTag(timeRange: string): Promise<Array<{ id: string; name: string; count: number }>> {
        const dateFilter = this.getDateFilter(timeRange);
        
        // Requête SQL pour obtenir le nombre d'articles par tag
        const query = `
            SELECT 
                t.id, 
                t.name, 
                COUNT(DISTINCT pt.post_id) as post_count
            FROM 
                blog_tags t
            LEFT JOIN 
                blog_post_tags pt ON t.id = pt.tag_id
            LEFT JOIN 
                blog_posts p ON pt.post_id = p.id
                ${dateFilter ? `AND p.created_at ${dateFilter}` : ''}
            GROUP BY 
                t.id, t.name
            ORDER BY 
                post_count DESC
        `;
        
        const [results] = await this.sequelize.query(query);
        
        return results.map((row: any) => ({
            id: row.id,
            name: row.name,
            count: parseInt(row.post_count, 10)
        }));
    }

    private async getPostsByStatus(timeRange: string): Promise<Array<{ status: string; count: number }>> {
        const dateFilter = this.getDateFilter(timeRange);
        
        // Requête SQL pour obtenir le nombre d'articles par statut
        const query = `
            SELECT 
                status, 
                COUNT(id) as post_count
            FROM 
                blog_posts
            WHERE 
                1=1
                ${dateFilter ? `AND created_at ${dateFilter}` : ''}
            GROUP BY 
                status
        `;
        
        const [results] = await this.sequelize.query(query);
        
        return results.map((row: any) => ({
            status: row.status,
            count: parseInt(row.post_count, 10)
        }));
    }

    private async getCommentsByStatus(timeRange: string): Promise<Array<{ status: string; count: number }>> {
        const dateFilter = this.getDateFilter(timeRange);
        
        // Requête SQL pour obtenir le nombre de commentaires par statut
        const query = `
            SELECT 
                status, 
                COUNT(id) as comment_count
            FROM 
                blog_comments
            WHERE 
                1=1
                ${dateFilter ? `AND created_at ${dateFilter}` : ''}
            GROUP BY 
                status
        `;
        
        const [results] = await this.sequelize.query(query);
        
        return results.map((row: any) => ({
            status: row.status,
            count: parseInt(row.comment_count, 10)
        }));
    }

    private async getCommentsPerPost(timeRange: string, limit: number = 5): Promise<Array<{ id: string; title: string; count: number }>> {
        const dateFilter = this.getDateFilter(timeRange);
        
        // Requête SQL pour obtenir les articles avec le plus de commentaires
        const query = `
            SELECT 
                p.id, 
                p.title, 
                COUNT(c.id) as comment_count
            FROM 
                blog_posts p
            LEFT JOIN 
                blog_comments c ON p.id = c.post_id
                ${dateFilter ? `AND c.created_at ${dateFilter}` : ''}
            GROUP BY 
                p.id, p.title
            ORDER BY 
                comment_count DESC
            LIMIT ${limit}
        `;
        
        const [results] = await this.sequelize.query(query);
        
        return results.map((row: any) => ({
            id: row.id,
            title: row.title,
            count: parseInt(row.comment_count, 10)
        }));
    }

    private getDateFilter(timeRange: string): string | null {
        switch (timeRange) {
            case 'today':
                return ">= DATE(NOW())";
            case 'week':
                return ">= DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY)";
            case 'month':
                return ">= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')";
            case 'year':
                return ">= DATE_FORMAT(CURRENT_DATE(), '%Y-01-01')";
            default:
                return null;
        }
    }
}