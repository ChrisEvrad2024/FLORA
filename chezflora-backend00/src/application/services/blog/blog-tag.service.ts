// src/application/services/blog/blog-tag.service.ts
import { BlogTagRepositoryInterface } from '../../../interfaces/repositories/blog-tag-repository.interface';
import { BlogTagDto, BlogTagResponseDto } from '../../dtos/blog/blog-tag.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import slugify from 'slugify';

export class BlogTagService {
    constructor(
        private blogTagRepository: BlogTagRepositoryInterface
    ) {}

    async getTags(): Promise<BlogTagResponseDto[]> {
        return this.blogTagRepository.findAll();
    }

    async getTagById(id: string): Promise<BlogTagResponseDto> {
        const tag = await this.blogTagRepository.findById(id);
        
        if (!tag) {
            throw new AppError('Tag not found', 404);
        }
        
        return tag;
    }

    async getTagBySlug(slug: string): Promise<BlogTagResponseDto> {
        const tag = await this.blogTagRepository.findBySlug(slug);
        
        if (!tag) {
            throw new AppError('Tag not found', 404);
        }
        
        return tag;
    }

    async getTagsByPostId(postId: string): Promise<BlogTagResponseDto[]> {
        return this.blogTagRepository.findByPostId(postId);
    }

    async createTag(tagData: BlogTagDto): Promise<BlogTagResponseDto> {
        // Générer le slug à partir du nom si non fourni
        if (!tagData.slug) {
            tagData.slug = slugify(tagData.name, { lower: true });
        }
        
        // Vérifier si le slug existe déjà
        const existingTag = await this.blogTagRepository.findBySlug(tagData.slug);
        if (existingTag) {
            throw new AppError('A tag with this slug already exists', 400);
        }
        
        return this.blogTagRepository.create(tagData);
    }

    async updateTag(id: string, tagData: Partial<BlogTagDto>): Promise<BlogTagResponseDto> {
        // Si le nom est mis à jour, mettre à jour le slug
        if (tagData.name && !tagData.slug) {
            tagData.slug = slugify(tagData.name, { lower: true });
        }
        
        // Si le slug est mis à jour, vérifier qu'il n'existe pas déjà
        if (tagData.slug) {
            const existingTag = await this.blogTagRepository.findBySlug(tagData.slug);
            if (existingTag && existingTag.id !== id) {
                throw new AppError('A tag with this slug already exists', 400);
            }
        }
        
        const updatedTag = await this.blogTagRepository.update(id, tagData);
        
        if (!updatedTag) {
            throw new AppError('Tag not found', 404);
        }
        
        return updatedTag;
    }

    async deleteTag(id: string): Promise<boolean> {
        const deleted = await this.blogTagRepository.delete(id);
        
        if (!deleted) {
            throw new AppError('Tag not found', 404);
        }
        
        return true;
    }

    async addTagToPost(postId: string, tagId: string): Promise<boolean> {
        const success = await this.blogTagRepository.addTagToPost(postId, tagId);
        
        if (!success) {
            throw new AppError('Failed to add tag to post', 500);
        }
        
        return true;
    }

    async removeTagFromPost(postId: string, tagId: string): Promise<boolean> {
        const success = await this.blogTagRepository.removeTagFromPost(postId, tagId);
        
        if (!success) {
            throw new AppError('Failed to remove tag from post', 500);
        }
        
        return true;
    }

    async setPostTags(postId: string, tagIds: string[]): Promise<boolean> {
        const success = await this.blogTagRepository.setPostTags(postId, tagIds);
        
        if (!success) {
            throw new AppError('Failed to set post tags', 500);
        }
        
        return true;
    }
}