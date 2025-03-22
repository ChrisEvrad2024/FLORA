// src/infrastructure/repositories/blog-comment.repository.ts
import { BlogCommentRepositoryInterface } from '../../interfaces/repositories/blog-comment-repository.interface';
import { BlogCommentResponseDto } from '../../application/dtos/blog/blog-comment.dto';
import BlogComment from '../database/models/blog-comment.model';
import User from '../database/models/user.model';
import BlogPost from '../database/models/blog-post.model';
import { AppError } from '../http/middlewares/error.middleware';

export class BlogCommentRepository implements BlogCommentRepositoryInterface {
    async findByPostId(postId: string, options?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ comments: BlogCommentResponseDto[]; total: number }> {
        const whereClause: any = {
            postId
        };
        
        if (options?.status) {
            whereClause.status = options.status;
        }
        
        const queryOptions: any = {
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        };
        
        // Pagination
        if (options?.page && options?.limit) {
            queryOptions.limit = options.limit;
            queryOptions.offset = (options.page - 1) * options.limit;
        }
        
        const { rows, count } = await BlogComment.findAndCountAll(queryOptions);
        
        // Mapper les résultats
        const comments = rows.map(comment => this.mapToCommentResponseDto(comment));
        
        return {
            comments,
            total: count
        };
    }
    
    async create(userId: string, commentData: Omit<BlogCommentResponseDto, 'id' | 'userId' | 'userName' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BlogCommentResponseDto> {
        // Vérifier si l'article existe
        const post = await BlogPost.findByPk(commentData.postId);
        
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        
        // Créer le commentaire
        const comment = await BlogComment.create({
            ...commentData,
            userId,
            status: 'pending' // Par défaut, les commentaires sont en attente de modération
        });
        
        // Charger les relations pour construire la réponse
        const commentWithUser = await BlogComment.findByPk(comment.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });
        
        if (!commentWithUser) {
            throw new AppError('Failed to create comment', 500);
        }
        
        return this.mapToCommentResponseDto(commentWithUser);
    }
    
    async updateStatus(id: string, status: string): Promise<BlogCommentResponseDto | null> {
        const comment = await BlogComment.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });
        
        if (!comment) {
            return null;
        }
        
        await comment.update({ status });
        
        return this.mapToCommentResponseDto(comment);
    }
    
    async delete(id: string): Promise<boolean> {
        const deleted = await BlogComment.destroy({
            where: {
                id
            }
        });
        
        return deleted > 0;
    }
    
    private mapToCommentResponseDto(comment: BlogComment): BlogCommentResponseDto {
        return {
            id: comment.id,
            postId: comment.postId,
            userId: comment.userId,
            userName: comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Anonymous',
            content: comment.content,
            status: comment.status,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        };
    }
}