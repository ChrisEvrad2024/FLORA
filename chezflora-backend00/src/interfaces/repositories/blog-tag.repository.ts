// src/infrastructure/repositories/blog-tag.repository.ts
import { BlogTagRepositoryInterface } from '../../interfaces/repositories/blog-tag-repository.interface';
import { BlogTagResponseDto } from '../../application/dtos/blog/blog-tag.dto';
import BlogTag from '../../infrastructure/database/models/blog-tag.model';
import BlogPost from '../../infrastructure/database/models/blog-post.model';
import BlogPostTag from '../../infrastructure/database/models/blog-post-tag.model';
import { Op } from 'sequelize';
import slugify from 'slugify';

export class BlogTagRepository implements BlogTagRepositoryInterface {
    async findAll(): Promise<BlogTagResponseDto[]> {
        const tags = await BlogTag.findAll({
            attributes: {
                include: [
                    [
                        BlogTag.sequelize!.literal('(SELECT COUNT(*) FROM blog_post_tags WHERE blog_post_tags.tag_id = blog_tags.id)'),
                        'postCount'
                    ]
                ]
            },
            order: [['name', 'ASC']]
        });

        return tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
            postCount: tag.get('postCount') as number
        }));
    }

    async findById(id: string): Promise<BlogTagResponseDto | null> {
        const tag = await BlogTag.findByPk(id, {
            attributes: {
                include: [
                    [
                        BlogTag.sequelize!.literal('(SELECT COUNT(*) FROM blog_post_tags WHERE blog_post_tags.tag_id = blog_tags.id)'),
                        'postCount'
                    ]
                ]
            }
        });

        if (!tag) {
            return null;
        }

        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
            postCount: tag.get('postCount') as number
        };
    }

    async findBySlug(slug: string): Promise<BlogTagResponseDto | null> {
        const tag = await BlogTag.findOne({
            where: { slug },
            attributes: {
                include: [
                    [
                        BlogTag.sequelize!.literal('(SELECT COUNT(*) FROM blog_post_tags WHERE blog_post_tags.tag_id = blog_tags.id)'),
                        'postCount'
                    ]
                ]
            }
        });

        if (!tag) {
            return null;
        }

        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
            postCount: tag.get('postCount') as number
        };
    }

    async findByPostId(postId: string): Promise<BlogTagResponseDto[]> {
        const tags = await BlogTag.findAll({
            include: [
                {
                    model: BlogPost,
                    as: 'posts',
                    where: { id: postId },
                    through: { attributes: [] },
                    attributes: []
                }
            ],
            order: [['name', 'ASC']]
        });

        return tags.map((tag:any) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
        }));
    }

    async create(tagData: Omit<BlogTagResponseDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogTagResponseDto> {
        // Generate slug if not provided
        const slug = tagData.slug || slugify(tagData.name, { lower: true });
        
        const tag = await BlogTag.create({
            name: tagData.name,
            slug
        });

        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
        };
    }

    async update(id: string, tagData: Partial<BlogTagResponseDto>): Promise<BlogTagResponseDto | null> {
        const tag = await BlogTag.findByPk(id);
        
        if (!tag) {
            return null;
        }

        // If name is updated, update slug if slug is not provided
        if (tagData.name && !tagData.slug) {
            tagData.slug = slugify(tagData.name, { lower: true });
        }

        await tag.update({
            name: tagData.name,
            slug: tagData.slug
        });

        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
        };
    }

    async delete(id: string): Promise<boolean> {
        // Check if the tag is still associated with any posts
        const postTagCount = await BlogPostTag.count({
            where: { tagId: id }
        });
        
        if (postTagCount > 0) {
            // If tag is still in use, we should either throw an error or remove the associations first
            // For now, we'll remove the associations
            await BlogPostTag.destroy({
                where: { tagId: id }
            });
        }
        
        const result = await BlogTag.destroy({
            where: { id }
        });

        return result > 0;
    }

    async addTagToPost(postId: string, tagId: string): Promise<boolean> {
        // Check if post and tag exist
        const post = await BlogPost.findByPk(postId);
        const tag = await BlogTag.findByPk(tagId);
        
        if (!post || !tag) {
            return false;
        }
        
        // Check if association already exists
        const existingAssociation = await BlogPostTag.findOne({
            where: {
                postId,
                tagId
            }
        });
        
        if (existingAssociation) {
            return true; // Association already exists
        }
        
        // Create the association
        await BlogPostTag.create({
            postId,
            tagId
        });
        
        return true;
    }

    async removeTagFromPost(postId: string, tagId: string): Promise<boolean> {
        const result = await BlogPostTag.destroy({
            where: {
                postId,
                tagId
            }
        });
        
        return result > 0;
    }

    async setPostTags(postId: string, tagIds: string[]): Promise<boolean> {
        // Check if post exists
        const post = await BlogPost.findByPk(postId);
        
        if (!post) {
            return false;
        }
        
        // Get existing tag associations
        const existingTags = await BlogPostTag.findAll({
            where: { postId }
        });
        
        const existingTagIds = existingTags.map((tag:any) => tag.tagId);
        
        // Determine tags to add and remove
        const tagsToAdd = tagIds.filter(id => !existingTagIds.includes(id));
        const tagsToRemove = existingTagIds.filter((id:any) => !tagIds.includes(id));
        
        // Remove associations that are no longer needed
        if (tagsToRemove.length > 0) {
            await BlogPostTag.destroy({
                where: {
                    postId,
                    tagId: {
                        [Op.in]: tagsToRemove
                    }
                }
            });
        }
        
        // Add new associations
        for (const tagId of tagsToAdd) {
            // Verify the tag exists
            const tag = await BlogTag.findByPk(tagId);
            if (tag) {
                await BlogPostTag.create({
                    postId,
                    tagId
                });
            }
        }
        
        return true;
    }

    async findOrCreateByName(name: string): Promise<BlogTagResponseDto> {
        // Normalize name and create slug
        const normalizedName = name.trim();
        const slug = slugify(normalizedName, { lower: true });
        
        // Try to find existing tag
        let tag = await BlogTag.findOne({
            where: {
                [Op.or]: [
                    { name: normalizedName },
                    { slug }
                ]
            }
        });
        
        // Create if it doesn't exist
        if (!tag) {
            tag = await BlogTag.create({
                name: normalizedName,
                slug
            });
        }
        
        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
        };
    }
}