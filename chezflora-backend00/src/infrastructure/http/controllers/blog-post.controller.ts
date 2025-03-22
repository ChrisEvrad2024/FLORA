import { Request, Response, NextFunction } from 'express';
import { BlogPostService } from '../../../application/services/blog/blog-post.service';
import { AppError } from '../../http/middlewares/error.middleware';

export class BlogPostController {
    constructor(private blogPostService: BlogPostService) {}

    getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categoryId = req.query.categoryId as string;
            const status = req.query.status as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const { posts, total, totalPages } = await this.blogPostService.getAllPosts({
                categoryId,
                status,
                page,
                limit
            });
            
            res.status(200).json({
                success: true,
                message: 'Posts retrieved successfully',
                data: posts,
                pagination: {
                    current: page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const post = await this.blogPostService.getPostById(id);
            
            res.status(200).json({
                success: true,
                message: 'Post retrieved successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    getPostBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params;
            const post = await this.blogPostService.getPostBySlug(slug);
            
            res.status(200).json({
                success: true,
                message: 'Post retrieved successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const postData = req.body;
            const post = await this.blogPostService.createPost(userId, postData);
            
            res.status(201).json({
                success: true,
                message: 'Post created successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const postData = req.body;
            const post = await this.blogPostService.updatePost(id, postData);
            
            res.status(200).json({
                success: true,
                message: 'Post updated successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.blogPostService.deletePost(id);
            
            res.status(200).json({
                success: true,
                message: 'Post deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    publishPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const post = await this.blogPostService.publishPost(id);
            
            res.status(200).json({
                success: true,
                message: 'Post published successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    archivePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const post = await this.blogPostService.archivePost(id);
            
            res.status(200).json({
                success: true,
                message: 'Post archived successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };
}