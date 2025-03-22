// src/application/services/blog/blog-search.service.ts
import { BlogSearchServiceInterface, BlogSearchOptions, BlogSearchResult } from '../../../interfaces/services/blog-search-service.interface';
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import { BlogTagRepositoryInterface } from '../../../interfaces/repositories/blog-tag-repository.interface';
import { Sequelize, Op } from 'sequelize';
import BlogPost from '../../../infrastructure/database/models/blog-post.model';
import BlogCategory from '../../../infrastructure/database/models/blog-category.model';
import BlogTag from '../../../infrastructure/database/models/blog-tag.model';
import BlogPostTag from '../../../infrastructure/database/models/blog-post-tag.model';
import User from '../../../infrastructure/database/models/user.model';
import { BlogEventsHandler } from '../../events/handlers/blog-events.handler';
import { BlogPostCreatedEvent } from '../../events/blog/blog-post-created.event';
import { BlogPostUpdatedEvent } from '../../events/blog/blog-post-updated.event';
import { BlogPostPublishedEvent } from '../../events/blog/blog-post-published.event';

export class BlogSearchService implements BlogSearchServiceInterface {
    constructor(
        private blogPostRepository: BlogPostRepositoryInterface,
        private blogTagRepository: BlogTagRepositoryInterface,
        private sequelize: Sequelize
    ) {
        // S'abonner aux événements du blog pour mettre à jour l'index de recherche
        this.registerEventListeners();
    }

    /**
     * Rechercher des articles de blog
     */
    async search(options: BlogSearchOptions): Promise<BlogSearchResult> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const offset = (page - 1) * limit;
        
        // Construire les conditions de recherche
        const whereConditions: any = {};
        const categoryCondition: any = {};
        const tagCondition: any = {};
        const authorCondition: any = {};
        
        // Condition de statut
        if (options.status) {
            whereConditions.status = options.status;
        } else {
            // Par défaut, ne montrer que les articles publiés
            whereConditions.status = 'published';
        }
        
        // Condition de catégorie
        if (options.categoryId) {
            whereConditions.categoryId = options.categoryId;
        }
        
        // Condition de date
        if (options.dateFrom) {
            whereConditions.createdAt = {
                ...whereConditions.createdAt,
                [Op.gte]: options.dateFrom
            };
        }
        
        if (options.dateTo) {
            whereConditions.createdAt = {
                ...whereConditions.createdAt,
                [Op.lte]: options.dateTo
            };
        }
        
        // Condition de recherche textuelle
        if (options.query) {
            const searchTerms = options.query.split(' ').filter(term => term.length > 2);
            
            if (searchTerms.length > 0) {
                const searchConditions = [];
                
                // Recherche dans le titre
                searchConditions.push({
                    title: {
                        [Op.like]: `%${options.query}%`
                    }
                });
                
                // Recherche dans le contenu
                searchConditions.push({
                    content: {
                        [Op.like]: `%${options.query}%`
                    }
                });
                
                // Recherche dans l'extrait
                searchConditions.push({
                    excerpt: {
                        [Op.like]: `%${options.query}%`
                    }
                });
                
                // Condition pour le nom de la catégorie
                categoryCondition.name = {
                    [Op.like]: `%${options.query}%`
                };
                
                // Condition pour le nom des tags
                tagCondition.name = {
                    [Op.like]: `%${options.query}%`
                };
                
                // Combiner toutes les conditions de recherche avec OR
                whereConditions[Op.or] = searchConditions;
            }
        }
        
        // Condition de tags
        let tagInclude = null;
        if (options.tagIds && options.tagIds.length > 0) {
            tagInclude = {
                model: BlogTag,
                through: {
                    where: {
                        tagId: {
                            [Op.in]: options.tagIds
                        }
                    }
                },
                required: true
            };
        } else {
            tagInclude = {
                model: BlogTag,
                required: false
            };
        }
        
        // Déterminer l'ordre de tri
        let order: any[] = [];
        
        switch (options.sortBy) {
            case 'date':
                order.push(['createdAt', options.sortOrder || 'desc']);
                break;
            case 'views':
                // Supposons qu'il y a une colonne viewCount
                order.push(['viewCount', options.sortOrder || 'desc']);
                break;
            case 'comments':
                // Tri par nombre de commentaires nécessite un subquery ou un left join avec comptage
                // Pour simplifier, nous allons compter les commentaires dans l'application
                break;
            case 'relevance':
            default:
                if (options.query) {
                    // Tri par pertinence - par défaut pour les recherches textuelles
                    // Implémentation basique : les articles dont le titre contient la requête sont priorisés
                    order.push([
                        Sequelize.literal(`CASE 
                            WHEN title LIKE '%${options.query}%' THEN 1 
                            WHEN excerpt LIKE '%${options.query}%' THEN 2 
                            ELSE 3 
                        END`),
                        'ASC'
                    ]);
                } else {
                    // Si pas de requête de recherche, tri par date décroissante
                    order.push(['createdAt', 'DESC']);
                }
                break;
        }
        
        // Effectuer la requête avec tous les filtres
        const { rows, count } = await BlogPost.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: BlogCategory,
                    where: Object.keys(categoryCondition).length ? categoryCondition : undefined,
                    required: false
                },
                tagInclude,
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                }
            ],
            order,
            limit,
            offset,
            distinct: true
        });
        
        // Convertir les résultats de Sequelize en DTOs
        const posts = await Promise.all(rows.map(async (post) => {
            const tags = await this.blogTagRepository.findByPostId(post.id);
            
            return {
                id: post.id,
                authorId: post.authorId,
                authorName: `${post.author.firstName} ${post.author.lastName}`,
                categoryId: post.categoryId,
                categoryName: post.category.name,
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt,
                featuredImage: post.featuredImage,
                status: post.status,
                publishedAt: post.publishedAt,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                commentCount: post.comments ? post.comments.length : 0,
                tags,
                viewCount: post.viewCount || 0
            };
        }));
        
        return {
            posts,
            total: count,
            totalPages: Math.ceil(count / limit),
            page,
            limit
        };
    }

    /**
     * Obtenir des suggestions de recherche basées sur la requête
     */
    async searchSuggestions(query: string, limit: number = 5): Promise<string[]> {
        if (!query || query.length < 3) {
            return [];
        }
        
        // Rechercher des suggestions basées sur les titres des articles
        const titleSuggestions = await BlogPost.findAll({
            attributes: ['title'],
            where: {
                title: {
                    [Op.like]: `%${query}%`
                },
                status: 'published'
            },
            limit
        });
        
        // Rechercher des suggestions basées sur les noms des tags
        const tagSuggestions = await BlogTag.findAll({
            attributes: ['name'],
            where: {
                name: {
                    [Op.like]: `%${query}%`
                }
            },
            limit
        });
        
        // Fusionner et dédupliquer les suggestions
        const suggestions = [
            ...titleSuggestions.map(post => post.title),
            ...tagSuggestions.map(tag => tag.name)
        ];
        
        return [...new Set(suggestions)].slice(0, limit);
    }

    /**
     * Indexer un article pour la recherche
     * Dans une implémentation réelle, cela pourrait interagir avec un moteur de recherche comme Elasticsearch
     */
    async indexPost(postId: string): Promise<boolean> {
        try {
            // Pour l'instant, cette méthode est un placeholder
            // Dans une implémentation réelle, elle synchroniserait l'article avec un index de recherche
            console.log(`Indexing post ${postId} for search`);
            
            // Vérifier que l'article existe
            const post = await this.blogPostRepository.findById(postId);
            if (!post) {
                console.error(`Post ${postId} not found for indexing`);
                return false;
            }
            
            // Simuler une indexation réussie
            return true;
        } catch (error) {
            console.error('Error indexing post:', error);
            return false;
        }
    }

    /**
     * Réindexer tous les articles
     */
    async reindexAllPosts(): Promise<boolean> {
        try {
            console.log('Reindexing all posts for search');
            
            // Récupérer tous les IDs des articles publiés
            const posts = await BlogPost.findAll({
                attributes: ['id'],
                where: {
                    status: 'published'
                }
            });
            
            // Indexer chaque article
            const results = await Promise.all(
                posts.map(post => this.indexPost(post.id))
            );
            
            // Vérifier si tous les articles ont été indexés avec succès
            return results.every(result => result === true);
        } catch (error) {
            console.error('Error reindexing all posts:', error);
            return false;
        }
    }

    /**
     * S'abonner aux événements du blog pour maintenir l'index de recherche à jour
     */
    private registerEventListeners(): void {
        BlogEventsHandler.registerListeners(
            (event: BlogPostCreatedEvent) => {
                if (event.post.status === 'published') {
                    this.indexPost(event.post.id);
                }
            },
            (event: BlogPostUpdatedEvent) => {
                if (event.post.status === 'published') {
                    this.indexPost(event.post.id);
                }
            },
            (event: BlogPostPublishedEvent) => {
                this.indexPost(event.post.id);
            }
        );
    }
}