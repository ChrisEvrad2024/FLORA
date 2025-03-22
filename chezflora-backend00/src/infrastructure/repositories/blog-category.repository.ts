// src/infrastructure/repositories/blog-category.repository.ts
import { BlogCategoryRepositoryInterface } from '../../interfaces/repositories/blog-category-repository.interface';
import { BlogCommentRepositoryInterface } from '../../interfaces/repositories/blog-comment-repository.interface';
import { BlogCommentResponseDto } from '../../application/dtos/blog/blog-comment.dto';
import BlogComment from '../database/models/blog-comment.model';
import BlogPost from '../database/models/blog-post.model';
import User from '../database/models/user.model';
import { Op, Sequelize } from 'sequelize';
import { BlogCommentAddedEvent } from '../../application/events/blog/blog-comment-added.event';
import { BlogEventsHandler } from '../../application/events/handlers/blog-events.handler';

export class BlogCommentRepository implements BlogCommentRepositoryInterface {
    async findByPostId(
        postId: string,
        options?: {
            status?: string;
            page?: number;
            limit?: number;
        }
    ): Promise<{ comments: BlogCommentResponseDto[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;

        const whereConditions: any = {
            postId
        };

        // Filtrer par statut si spécifié
        if (options?.status) {
            whereConditions.status = options.status;
        }

        // Si postId est "all", supprimer la condition pour récupérer tous les commentaires
        if (postId === 'all') {
            delete whereConditions.postId;
        }

        const { rows, count } = await BlogComment.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: BlogPost,
                    attributes: ['id', 'title']
                }
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });

        return {
            comments: rows.map(comment => this.mapToDto(comment)),
            total: count
        };
    }

    async create(
        userId: string,
        commentData: Omit<BlogCommentResponseDto, 'id' | 'userId' | 'userName' | 'status' | 'createdAt' | 'updatedAt'>
    ): Promise<BlogCommentResponseDto> {
        const comment = await BlogComment.create({
            userId,
            postId: commentData.postId,
            content: commentData.content,
            status: 'pending' // Par défaut, les commentaires sont en attente de modération
        });

        // Charger les relations pour obtenir les noms
        await comment.reload({
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        const commentDto = this.mapToDto(comment);

        // Déclencher l'événement de création de commentaire
        const commentAddedEvent = new BlogCommentAddedEvent(commentDto, commentData.postId);
        BlogEventsHandler.handleCommentAdded(commentAddedEvent);

        return commentDto;
    }

    async updateStatus(id: string, status: string): Promise<BlogCommentResponseDto | null> {
        const comment = await BlogComment.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        if (!comment) {
            return null;
        }

        await comment.update({ status });

        return this.mapToDto(comment);
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await BlogComment.destroy({
            where: { id }
        });

        return deleted > 0;
    }

    // Méthodes avancées
    async findRecentComments(
        limit: number = 10,
        status: string = 'approved'
    ): Promise<BlogCommentResponseDto[]> {
        const comments = await BlogComment.findAll({
            where: {
                status
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: BlogPost,
                    attributes: ['id', 'title']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit
        });

        return comments.map(comment => this.mapToDto(comment));
    }

    async findCommentsByUser(
        userId: string,
        options?: {
            status?: string;
            page?: number;
            limit?: number;
        }
    ): Promise<{ comments: BlogCommentResponseDto[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;

        const whereConditions: any = {
            userId
        };

        if (options?.status) {
            whereConditions.status = options.status;
        }

        const { rows, count } = await BlogComment.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: BlogPost,
                    attributes: ['id', 'title']
                }
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });

        return {
            comments: rows.map(comment => this.mapToDto(comment)),
            total: count
        };
    }

    async countCommentsByStatus(): Promise<Array<{ status: string; count: number }>> {
        const results = await BlogComment.findAll({
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        return results.map(result => ({
            status: result.status,
            count: parseInt(result.getDataValue('count'), 10)
        }));
    }

    private mapToDto(comment: BlogComment): BlogCommentResponseDto {
        return {
            id: comment.id,
            postId: comment.postId,
            userId: comment.userId,
            userName: comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown',
            content: comment.content,
            status: comment.status,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        };
    }
}
