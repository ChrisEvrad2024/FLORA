// src/infrastructure/http/controllers/blog-revision.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogRevisionService } from '../../../application/services/blog/blog-revision.service';
import { AppError } from '../../http/middlewares/error.middleware';

export class BlogRevisionController {
    constructor(private blogRevisionService: BlogRevisionService) {}

    getRevisionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const includeDiffs = req.query.includeDiffs === 'true';
            
            const { revisions, total, totalPages } = await this.blogRevisionService.getRevisionHistory(postId, {
                page,
                limit,
                includeDiffs
            });
            
            res.status(200).json({
                success: true,
                data: revisions,
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

    getRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId, revisionNumber } = req.params;
            
            const revision = await this.blogRevisionService.getRevision(
                postId, 
                parseInt(revisionNumber)
            );
            
            res.status(200).json({
                success: true,
                data: revision
            });
        } catch (error) {
            next(error);
        }
    };

    createRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const { updatedData, comment, minor } = req.body;
            
            const revision = await this.blogRevisionService.createRevision(
                postId,
                userId,
                updatedData,
                { comment, minor }
            );
            
            res.status(201).json({
                success: true,
                message: 'Revision created successfully',
                data: revision
            });
        } catch (error) {
            next(error);
        }
    };

    compareRevisions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId, fromRevision, toRevision } = req.params;
            
            const comparison = await this.blogRevisionService.compareRevisions(
                postId,
                parseInt(fromRevision),
                parseInt(toRevision)
            );
            
            res.status(200).json({
                success: true,
                data: comparison
            });
        } catch (error) {
            next(error);
        }
    };

    restoreRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId, revisionNumber } = req.params;
            const userId = req.user?.id;
            
            if (!userId) {
                throw new AppError('Authentication required', 401);
            }
            
            const { comment, minor } = req.body;
            
            const revision = await this.blogRevisionService.restoreRevision(
                postId,
                parseInt(revisionNumber),
                userId,
                { comment, minor }
            );
            
            res.status(200).json({
                success: true,
                message: 'Revision restored successfully',
                data: revision
            });
        } catch (error) {
            next(error);
        }
    };

    deleteRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { revisionId } = req.params;
            
            const deleted = await this.blogRevisionService.deleteRevision(revisionId);
            
            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: 'Revision deleted successfully'
                });
            } else {
                throw new AppError('Failed to delete revision', 400);
            }
        } catch (error) {
            next(error);
        }
    };
}