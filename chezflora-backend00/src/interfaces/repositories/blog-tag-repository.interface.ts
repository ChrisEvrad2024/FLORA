// src/interfaces/repositories/blog-tag-repository.interface.ts
import { BlogTagResponseDto } from "../../application/dtos/blog/blog-tag.dto";

export interface BlogTagRepositoryInterface {
    findAll(): Promise<BlogTagResponseDto[]>;
    findById(id: string): Promise<BlogTagResponseDto | null>;
    findBySlug(slug: string): Promise<BlogTagResponseDto | null>;
    findByPostId(postId: string): Promise<BlogTagResponseDto[]>;
    create(tagData: Omit<BlogTagResponseDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogTagResponseDto>;
    update(id: string, tagData: Partial<BlogTagResponseDto>): Promise<BlogTagResponseDto | null>;
    delete(id: string): Promise<boolean>;
    addTagToPost(postId: string, tagId: string): Promise<boolean>;
    removeTagFromPost(postId: string, tagId: string): Promise<boolean>;
    setPostTags(postId: string, tagIds: string[]): Promise<boolean>;
    findOrCreateByName(name: string): Promise<BlogTagResponseDto>;
}