import { BlogCommentRepositoryInterface } from '../../interfaces/repositories/blog-comment-repository.interface';
import { BlogCommentResponseDto } from '../../application/dtos/blog/blog-comment.dto';
import BlogComment from '../database/models/blog-comment.model';
import User from '../database/models/user.model';
import BlogPost from '../database/models/blog-post.model';
import { Op } from 'sequelize';

export class BlogCommentRepository implements BlogCommentRepositoryInterface {
    async findByPostId(postId: string, options?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ comments: BlogCommentResponseDto[]; total: number }> {
        const where: any = { postId };
        
        if (options?.status) {
            where.status = options.status;
        }
        
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;
        
        const { count, rows } = await BlogComment.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: BlogPost,
                    as: 'post',
                    attributes: ['id', 'title', 'slug']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
        
        const comments = rows.map(comment => ({
            id: comment.id,
            postId: comment.postId,
            userId: comment.userId,
            userName: `${comment.user.firstName} ${comment.user.lastName}`,
            content: comment.content,
            status: comment.status,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        }));
        
        return {
            comments,
            total: count
        };
    }
    
    async create(userId: string, commentData: Omit<BlogCommentResponseDto, 'id' | 'userId' | 'userName' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BlogCommentResponseDto> {
        const comment = await BlogComment.create({
            ...commentData,
            userId,
            status: 'pending'
        });
        
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return {
            id: comment.id,
            postId: comment.postId,
            userId: comment.userId,
            userName: `${user.firstName} ${user.lastName}`,
            content: comment.content,
            status: comment.status,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        };
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
        
        return {
            id: comment.id,
            postId: comment.postId,
            userId: comment.userId,
            userName: `${comment.user.firstName} ${comment.user.lastName}`,
            content: comment.content,
            status: comment.status,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        };
    }
    
    async delete(id: string): Promise<boolean> {
        const result = await BlogComment.destroy({
            where: { id }
        });
        
        return result > 0;
    }
}