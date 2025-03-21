// src/application/services/blog/blog-scheduler.service.ts
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import BlogPost from '../../../infrastructure/database/models/blog-post.model';
import { Op } from 'sequelize';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import User from '../../../infrastructure/database/models/user.model';

export class BlogSchedulerService {
    constructor(private blogPostRepository: BlogPostRepositoryInterface) {}

    /**
     * Planifie la publication d'un article de blog pour une date future
     */
    async scheduleBlogPost(postId: string, scheduledDate: Date): Promise<boolean> {
        try {
            // Vérifier si l'article existe
            const post = await this.blogPostRepository.findById(postId);
            
            if (!post) {
                throw new AppError('Blog post not found', 404);
            }
            
            // Vérifier que la date est dans le futur
            const now = new Date();
            if (scheduledDate <= now) {
                throw new AppError('Scheduled date must be in the future', 400);
            }
            
            // Mettre à jour l'article avec la date planifiée
            await this.blogPostRepository.update(postId, {
                scheduledPublishDate: scheduledDate,
                status: 'draft' // Remettre en brouillon pour être publié plus tard
            });
            
            return true;
        } catch (error) {
            console.error('Error scheduling blog post:', error);
            throw error;
        }
    }

    /**
     * Annule la publication planifiée d'un article
     */
    async cancelScheduledPublication(postId: string): Promise<boolean> {
        try {
            // Vérifier si l'article existe
            const post = await this.blogPostRepository.findById(postId);
            
            if (!post) {
                throw new AppError('Blog post not found', 404);
            }
            
            if (!post.scheduledPublishDate) {
                throw new AppError('This post has no scheduled publication', 400);
            }
            
            // Annuler la planification
            await this.blogPostRepository.update(postId, {
                scheduledPublishDate: null
            });
            
            return true;
        } catch (error) {
            console.error('Error canceling scheduled publication:', error);
            throw error;
        }
    }

    /**
     * Publie tous les articles dont la date de publication planifiée est atteinte
     * Cette méthode devrait être exécutée par un cron job périodiquement
     */
    async publishScheduledPosts(): Promise<number> {
        try {
            const now = new Date();
            
            // Trouver tous les articles en attente de publication planifiée
            const scheduledPosts = await BlogPost.findAll({
                where: {
                    status: 'draft',
                    scheduledPublishDate: {
                        [Op.lte]: now // Date planifiée inférieure ou égale à maintenant
                    }
                }
            });
            
            // Compteur d'articles publiés
            let publishedCount = 0;
            
            // Publier chaque article
            for (const post of scheduledPosts) {
                await post.update({
                    status: 'published',
                    publishDate: now,
                    scheduledPublishDate: null // Effacer la date planifiée
                });
                
                publishedCount++;
            }
            
            return publishedCount;
        } catch (error) {
            console.error('Error publishing scheduled posts:', error);
            throw error;
        }
    }

    /**
     * Obtient la liste des articles planifiés pour publication
     */
    async getScheduledPosts(page: number = 1, limit: number = 10): Promise<{ posts: any[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            
            const { count, rows } = await BlogPost.findAndCountAll({
                where: {
                    scheduledPublishDate: {
                        [Op.not]: null
                    }
                },
                order: [['scheduledPublishDate', 'ASC']],
                limit,
                offset,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ]
            });
            
            // Mapper vers DTO
            const posts = rows.map(post => ({
                id: post.id,
                title: post.title,
                scheduledPublishDate: post.scheduledPublishDate,
                author: post.user ? {
                    id: post.user.id,
                    name: `${post.user.firstName} ${post.user.lastName}`
                } : undefined
            }));
            
            return {
                posts,
                total: count
            };
        } catch (error) {
            console.error('Error getting scheduled posts:', error);
            throw error;
        }
    }
}