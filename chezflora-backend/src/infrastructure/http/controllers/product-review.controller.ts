// src/infrastructure/http/controllers/product-review.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductReviewServiceInterface } from '../../../interfaces/services/product-review-service.interface';
import { CreateProductReviewDto } from '../../../application/dtos/review/create-product-review.dto';
import { UpdateProductReviewDto } from '../../../application/dtos/review/update-product-review.dto';
import { AppError } from '../middlewares/error.middleware';

export class ProductReviewController {
    constructor(private productReviewService: ProductReviewServiceInterface) {}

    getReviewById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            const review = await this.productReviewService.getReviewById(id);
            
            res.status(200).json({
                success: true,
                message: 'Review retrieved successfully',
                data: review
            });
        } catch (error) {
            next(error);
        }
    };

    getReviewsByProductId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const productId = req.params.productId;
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            
            const result = await this.productReviewService.getReviewsByProductId(productId, page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Reviews retrieved successfully',
                data: result.reviews,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    getUserReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            
            const result = await this.productReviewService.getUserReviews(userId, page, limit);
            
            res.status(200).json({
                success: true,
                message: 'User reviews retrieved successfully',
                data: result.reviews,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    getPendingReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            
            const result = await this.productReviewService.getPendingReviews(page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Pending reviews retrieved successfully',
                data: result.reviews,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const reviewData: CreateProductReviewDto = req.body;
            const review = await this.productReviewService.createReview(userId, reviewData);
            
            res.status(201).json({
                success: true,
                message: 'Review submitted successfully. It will be visible after moderation.',
                data: review
            });
        } catch (error) {
            next(error);
        }
    };

    updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const reviewData: UpdateProductReviewDto = req.body;
            const review = await this.productReviewService.updateReview(id, userId, reviewData);
            
            res.status(200).json({
                success: true,
                message: 'Review updated successfully',
                data: review
            });
        } catch (error) {
            next(error);
        }
    };

    deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            await this.productReviewService.deleteReview(id, userId);
            
            res.status(200).json({
                success: true,
                message: 'Review deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    checkUserCanReviewProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            const productId = req.params.productId;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const canReview = await this.productReviewService.checkUserCanReviewProduct(userId, productId);
            
            res.status(200).json({
                success: true,
                message: 'User review eligibility checked successfully',
                data: { canReview }
            });
        } catch (error) {
            next(error);
        }
    };

    getProductAverageRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const productId = req.params.productId;
            
            const averageRating = await this.productReviewService.getProductAverageRating(productId);
            
            res.status(200).json({
                success: true,
                message: 'Product average rating retrieved successfully',
                data: { averageRating }
            });
        } catch (error) {
            next(error);
        }
    };

    moderateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            
            // Check admin rights
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }
            
            const { status } = req.body;
            
            if (status !== 'approved' && status !== 'rejected') {
                throw new AppError('Invalid status. Must be either "approved" or "rejected"', 400);
            }
            
            const review = await this.productReviewService.moderateReview(id, status);
            
            res.status(200).json({
                success: true,
                message: `Review ${status} successfully`,
                data: review
            });
        } catch (error) {
            next(error);
        }
    };
}