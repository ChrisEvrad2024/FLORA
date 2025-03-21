// src/infrastructure/http/controllers/blog-post.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogPostServiceInterface } from '../../../interfaces/services/blog-post-service.interface';
import { CreateBlogPostDto } from '../../../application/dtos/blog/create-blog-post.dto';
import { UpdateBlogPostDto } from '../../../application/dtos/blog/update-blog-post.dto';
import { BlogFilterDto } from '../../../application/dtos/blog/blog-filter.dto';
import { AppError } from '../middlewares/error.middleware';

export class BlogPostController {
    constructor(private blogPostService: BlogPostServiceInterface) {}

    getBlogPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const includeComments = req.query.includeComments === 'true';
            
            const post = await this.blogPostService.getBlogPostById(id, includeComments);
            
            res.status(200).json({
                success: true,
                message: 'Blog post retrieved successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    getBlogPostBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const slug = req.params.slug;
            const includeComments = req.query.includeComments === 'true';
            
            const post = await this.blogPostService.getBlogPostBySlug(slug, includeComments);
            
            // Increment view count asynchronously (don't wait for it to complete)
            if (post) {
                this.blogPostService.viewBlogPost(post.id).catch(error => {
                    console.error('Error incrementing view count:', error);
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Blog post retrieved successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    getAllBlogPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filter: BlogFilterDto = {
                categoryId: req.query.categoryId as string,
                search: req.query.search as string,
                tag: req.query.tag as string,
                status: (req.query.status as 'draft' | 'published' | 'archived') || 'published',
                authorId: req.query.authorId as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                sortBy: req.query.sortBy as string,
                sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC'
            };
            
            // Non-admins can only see published posts
            if (req.user?.role !== 'admin') {
                filter.status = 'published';
            }
            
            const result = await this.blogPostService.getAllBlogPosts(filter);
            
            res.status(200).json({
                success: true,
                message: 'Blog posts retrieved successfully',
                data: result.posts,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    createBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const postData: CreateBlogPostDto = req.body;
            const post = await this.blogPostService.createBlogPost(userId, postData);
            
            res.status(201).json({
                success: true,
                message: 'Blog post created successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    updateBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const postData: UpdateBlogPostDto = req.body;
            const post = await this.blogPostService.updateBlogPost(id, postData);
            
            res.status(200).json({
                success: true,
                message: 'Blog post updated successfully',
                data: post
            });
        } catch (error) {
            next(error);
        }
    };

    deleteBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            await this.blogPostService.deleteBlogPost(id);
            
            res.status(200).json({
                success: true,
                message: 'Blog post deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    addTagToBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const { tagName } = req.body;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            if (!tagName) {
                throw new AppError('Tag name is required', 400);
            }
            
            await this.blogPostService.addTagToBlogPost(id, tagName);
            
            res.status(200).json({
                success: true,
                message: 'Tag added to blog post successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    removeTagFromBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const { tagName } = req.params;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            if (!tagName) {
                throw new AppError('Tag name is required', 400);
            }
            
            await this.blogPostService.removeTagFromBlogPost(id, tagName);
            
            res.status(200).json({
                success: true,
                message: 'Tag removed from blog post successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getFeaturedBlogPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            
            const posts = await this.blogPostService.getFeaturedBlogPosts(limit);
            
            res.status(200).json({
                success: true,
                message: 'Featured blog posts retrieved successfully',
                data: posts
            });
        } catch (error) {
            next(error);
        }
    };

    getRecentBlogPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            
            const posts = await this.blogPostService.getRecentBlogPosts(limit);
            
            res.status(200).json({
                success: true,
                message: 'Recent blog posts retrieved successfully',
                data: posts
            });
        } catch (error) {
            next(error);
        }
    };

    getPopularBlogPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            
            const posts = await this.blogPostService.getPopularBlogPosts(limit);
            
            res.status(200).json({
                success: true,
                message: 'Popular blog posts retrieved successfully',
                data: posts
            });
        } catch (error) {
            next(error);
        }
    };

    getRelatedBlogPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
            
            const posts = await this.blogPostService.getRelatedBlogPosts(id, limit);
            
            res.status(200).json({
                success: true,
                message: 'Related blog posts retrieved successfully',
                data: posts
            });
        } catch (error) {
            next(error);
        }
    };
}