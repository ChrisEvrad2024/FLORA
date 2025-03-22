// src/infrastructure/http/controllers/blog-post.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogPostService } from '../../../application/services/blog/blog-post.service';
import { AppError } from '../../http/middlewares/error.middleware';

export class BlogPostController {
    constructor(private blogPostService: BlogPostService) {}

    getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categoryId = req.query.categoryId as string;
            const tagId = req.query.tagId as string;
            const status = req.query.status as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            
            const { posts, total, totalPages } = await this.blogPostService.getAllPosts({
                categoryId,
                tagId,
                status,
                page,
                limit,
                search
            });
            
            res.status(200).json({
                success: true,
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
            
            // For view tracking middleware
            res.locals.blogPost = post;
            
            res.status(200).json({
                success: true,
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
            
            // Handle file upload (if any)
            const featuredImage = req.file ? req.file.path : undefined;
            
            // Combine post data
            const postData = {
                ...req.body,
                featuredImage
            };
            
            // Parse tags if they come as a string
            if (typeof postData.tags === 'string') {
                try {
                    postData.tags = JSON.parse(postData.tags);
                } catch (e) {
                    // If parsing fails, split by comma
                    postData.tags = postData.tags.split(',').map((tag:any) => tag.trim());
                }
            }
            
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
            
            // Handle file upload (if any)
            const featuredImage = req.file ? req.file.path : undefined;
            
            // Combine post data
            const postData = {
                ...req.body,
                ...(featuredImage && { featuredImage })
            };
            
            // Parse tags if they come as a string
            if (typeof postData.tags === 'string') {
                try {
                    postData.tags = JSON.parse(postData.tags);
                } catch (e) {
                    // If parsing fails, split by comma
                    postData.tags = postData.tags.split(',').map((tag:any) => tag.trim());
                }
            }
            
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
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const post = await this.blogPostService.publishPost(id, userId);
            
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