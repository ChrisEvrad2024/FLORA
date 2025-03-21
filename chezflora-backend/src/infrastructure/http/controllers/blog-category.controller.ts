// src/infrastructure/http/controllers/blog-category.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogCategoryServiceInterface } from '../../../interfaces/services/blog-category-service.interface';
import { CreateBlogCategoryDto } from '../../../application/dtos/blog/create-blog-category.dto';
import { UpdateBlogCategoryDto } from '../../../application/dtos/blog/update-blog-category.dto';
import { AppError } from '../middlewares/error.middleware';

export class BlogCategoryController {
    constructor(private blogCategoryService: BlogCategoryServiceInterface) {}

    getBlogCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            const category = await this.blogCategoryService.getBlogCategoryById(id);
            
            res.status(200).json({
                success: true,
                message: 'Blog category retrieved successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    getBlogCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const slug = req.params.slug;
            
            const category = await this.blogCategoryService.getBlogCategoryBySlug(slug);
            
            res.status(200).json({
                success: true,
                message: 'Blog category retrieved successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    getAllBlogCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            
            const result = await this.blogCategoryService.getAllBlogCategories(page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Blog categories retrieved successfully',
                data: result.categories,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    getBlogCategoriesWithPostCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categories = await this.blogCategoryService.getBlogCategoriesWithPostCount();
            
            res.status(200).json({
                success: true,
                message: 'Blog categories with post count retrieved successfully',
                data: categories
            });
        } catch (error) {
            next(error);
        }
    };

    createBlogCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const categoryData: CreateBlogCategoryDto = req.body;
            const category = await this.blogCategoryService.createBlogCategory(categoryData);
            
            res.status(201).json({
                success: true,
                message: 'Blog category created successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    updateBlogCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const categoryData: UpdateBlogCategoryDto = req.body;
            const category = await this.blogCategoryService.updateBlogCategory(id, categoryData);
            
            res.status(200).json({
                success: true,
                message: 'Blog category updated successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    deleteBlogCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            await this.blogCategoryService.deleteBlogCategory(id);
            
            res.status(200).json({
                success: true,
                message: 'Blog category deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}