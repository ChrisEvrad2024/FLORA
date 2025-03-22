// src/infrastructure/http/controllers/blog-tag.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogTagService } from '../../../application/services/blog/blog-tag.service';

export class BlogTagController {
    constructor(private blogTagService: BlogTagService) {}

    getTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tags = await this.blogTagService.getAllTags();
            
            res.status(200).json({
                success: true,
                message: 'Tags retrieved successfully',
                data: tags
            });
        } catch (error) {
            next(error);
        }
    };

    getTagById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const tag = await this.blogTagService.getTagById(id);
            
            res.status(200).json({
                success: true,
                message: 'Tag retrieved successfully',
                data: tag
            });
        } catch (error) {
            next(error);
        }
    };

    getTagBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params;
            const tag = await this.blogTagService.getTagBySlug(slug);
            
            res.status(200).json({
                success: true,
                message: 'Tag retrieved successfully',
                data: tag
            });
        } catch (error) {
            next(error);
        }
    };

    getTagsByPostId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId } = req.params;
            const tags = await this.blogTagService.getTagsByPostId(postId);
            
            res.status(200).json({
                success: true,
                message: 'Tags retrieved successfully',
                data: tags
            });
        } catch (error) {
            next(error);
        }
    };

    createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tagData = req.body;
            const tag = await this.blogTagService.createTag(tagData);
            
            res.status(201).json({
                success: true,
                message: 'Tag created successfully',
                data: tag
            });
        } catch (error) {
            next(error);
        }
    };

    updateTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const tagData = req.body;
            const tag = await this.blogTagService.updateTag(id, tagData);
            
            res.status(200).json({
                success: true,
                message: 'Tag updated successfully',
                data: tag
            });
        } catch (error) {
            next(error);
        }
    };

    deleteTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.blogTagService.deleteTag(id);
            
            res.status(200).json({
                success: true,
                message: 'Tag deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    addTagToPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId, tagId } = req.params;
            await this.blogTagService.addTagToPost(postId, tagId);
            
            res.status(200).json({
                success: true,
                message: 'Tag added to post successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    removeTagFromPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId, tagId } = req.params;
            await this.blogTagService.removeTagFromPost(postId, tagId);
            
            res.status(200).json({
                success: true,
                message: 'Tag removed from post successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    setPostTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId } = req.params;
            const { tagIds } = req.body;
            
            if (!Array.isArray(tagIds)) {
                res.status(400).json({
                    success: false,
                    message: 'tagIds must be an array'
                });
                return;
            }
            
            await this.blogTagService.setPostTags(postId, tagIds);
            
            res.status(200).json({
                success: true,
                message: 'Post tags updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}