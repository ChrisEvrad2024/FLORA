// src/infrastructure/http/controllers/blog-category.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogCategoryService } from '../../../application/services/blog/blog-category.service';

export class BlogCategoryController {
    constructor(private blogCategoryService: BlogCategoryService) {}

    getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categories = await this.blogCategoryService.getCategories();
            
            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            next(error);
        }
    };

    getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            
            const category = await this.blogCategoryService.getCategoryById(id);
            
            res.status(200).json({
                success: true,
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params;
            
            const category = await this.blogCategoryService.getCategoryBySlug(slug);
            
            res.status(200).json({
                success: true,
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categoryData = req.body;
            
            const category = await this.blogCategoryService.createCategory(categoryData);
            
            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const categoryData = req.body;
            
            const category = await this.blogCategoryService.updateCategory(id, categoryData);
            
            res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: category
            });
        } catch (error) {
            next(error);
        }
    };

    deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            
            await this.blogCategoryService.deleteCategory(id);
            
            res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}