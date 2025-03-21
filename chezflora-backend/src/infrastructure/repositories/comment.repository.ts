// src/infrastructure/repositories/comment.repository.ts
import { CommentRepositoryInterface } from '../../interfaces/repositories/comment-repository.interface';
import { CommentResponseDto } from '../../application/dtos/blog/comment-response.dto';
import { CreateCommentDto } from '../../application/dtos/blog/create-comment.dto';
import { UpdateCommentDto } from '../../application/dtos/blog/update-comment.dto';
import Comment from '../database/models/comment.model';
import User from '../database/models/user.model';
import BlogPost from '../database/models/blog-post.model';

export class CommentRepository implements CommentRepositoryInterface {
    async findById(id: string): Promise<CommentResponseDto | null> {
        try {
            const comment = await Comment.findByPk(id, {
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

            return this.mapToResponseDto(comment);
        } catch (error) {
            console.error('Error finding comment by ID:', error);
            throw error;
        }
    }

    async findByPostId(postId: string, page: number = 1, limit: number = 10): Promise<{ comments: CommentResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            
            const { count, rows } = await Comment.findAndCountAll({
                where: { 
                    postId,
                    status: 'approved'
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            const comments = rows.map(comment => this.mapToResponseDto(comment));

            return {
                comments,
                total: count
            };
        } catch (error) {
            console.error('Error finding comments by post ID:', error);
            throw error;
        }
    }

    async findPendingComments(page: number = 1, limit: number = 10): Promise<{ comments: CommentResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            
            const { count, rows } = await Comment.findAndCountAll({
                where: { status: 'pending' },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName']
                    },
                    {
                        model: BlogPost,
                        attributes: ['id', 'title', 'slug']
                    }
                ],
                order: [['createdAt', 'ASC']],
                limit,
                offset
            });

            const comments = rows.map(comment => ({
                ...this.mapToResponseDto(comment),
                post: comment.post ? {
                    id: comment.post.id,
                    title: comment.post.title,
                    slug: comment.post.slug
                } : undefined
            }));

            return {
                comments,
                total: count
            };
        } catch (error) {
            console.error('Error finding pending comments:', error);
            throw error;
        }
    }

    async create(userId: string, commentData: CreateCommentDto): Promise<CommentResponseDto> {
        try {
            // Check if the post exists
            const post = await BlogPost.findByPk(commentData.postId);
            if (!post) {
                throw new Error('Post not found');
            }

            // Create the comment
            const comment = await Comment.create({
                ...commentData,
                userId,
                status: 'pending' // All comments start as pending and need moderation
            });

            // Return the created comment with user data
            return this.findById(comment.id) as Promise<CommentResponseDto>;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    }

    async update(id: string, commentData: UpdateCommentDto): Promise<CommentResponseDto | null> {
        try {
            const comment = await Comment.findByPk(id);
            if (!comment) {
                return null;
            }

            // Update the comment
            await comment.update(commentData);

            // Return the updated comment with user data
            return this.findById(id) as Promise<CommentResponseDto>;
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const comment = await Comment.findByPk(id);
            if (!comment) {
                return false;
            }

            // Delete the comment
            await comment.destroy();
            
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }

    async moderateComment(id: string, status: 'approved' | 'rejected'): Promise<CommentResponseDto | null> {
        try {
            const comment = await Comment.findByPk(id);
            if (!comment) {
                return null;
            }

            // Update the status
            await comment.update({ status });

            // Return the updated comment with user data
            return this.findById(id) as Promise<CommentResponseDto>;
        } catch (error) {
            console.error('Error moderating comment:', error);
            throw error;
        }
    }

    private mapToResponseDto(comment: any): CommentResponseDto {
        return {
            id: comment.id,
            postId: comment.postId,
            userId: comment.userId,
            content: comment.content,
            status: comment.status,
            user: comment.user ? {
                id: comment.user.id,
                firstName: comment.user.firstName,
                lastName: comment.user.lastName
            } : undefined,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        };
    }
}