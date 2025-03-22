// src/infrastructure/repositories/blog-tag.repository.ts
import { BlogTagRepositoryInterface } from '../../interfaces/repositories/blog-tag-repository.interface';
import { BlogTagResponseDto } from '../../application/dtos/blog/blog-tag.dto';
import BlogTag from '../database/models/blog-tag.model';
import BlogPostTag from '../database/models/blog-post-tag.model';
import { Op } from 'sequelize';
import { AppError } from '../http/middlewares/error.middleware';
import slugify from 'slugify';
import BlogPost from '../database/models/blog-post.model';

export class BlogTagRepository implements BlogTagRepositoryInterface {
    async findAll(): Promise<BlogTagResponseDto[]> {
        const tags = await BlogTag.findAll({
            order: [['name', 'ASC']]
        });

        // Récupérer le nombre d'articles pour chaque tag
        const tagsWithCounts = await Promise.all(
            tags.map(async (tag) => {
                const postCount = await BlogPostTag.count({
                    where: {
                        tagId: tag.id
                    }
                });

                return {
                    ...this.mapToTagResponseDto(tag),
                    postCount
                };
            })
        );

        return tagsWithCounts;
    }

    async findById(id: string): Promise<BlogTagResponseDto | null> {
        const tag = await BlogTag.findByPk(id);

        if (!tag) {
            return null;
        }

        const postCount = await BlogPostTag.count({
            where: {
                tagId: id
            }
        });

        return {
            ...this.mapToTagResponseDto(tag),
            postCount
        };
    }

    async findBySlug(slug: string): Promise<BlogTagResponseDto | null> {
        const tag = await BlogTag.findOne({
            where: {
                slug
            }
        });

        if (!tag) {
            return null;
        }

        const postCount = await BlogPostTag.count({
            where: {
                tagId: tag.id
            }
        });

        return {
            ...this.mapToTagResponseDto(tag),
            postCount
        };
    }

    async findByPostId(postId: string): Promise<BlogTagResponseDto[]> {
        try {
            // Utiliser l'association entre BlogPost et BlogTag
            const post = await BlogPost.findByPk(postId, {
                include: [{
                    model: BlogTag,
                    as: 'tags',
                    through: { attributes: [] } // Ne pas inclure les attributs de la table de jonction
                }]
            });

            if (!post) return [];

            return post.tags.map(tag => this.mapToTagResponseDto(tag));
        } catch (error) {
            console.error('Error fetching tags for post:', error);
            return [];
        }
    }

    async create(tagData: Omit<BlogTagResponseDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogTagResponseDto> {
        try {
            const tag = await BlogTag.create(tagData);

            return this.mapToTagResponseDto(tag);
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new AppError('A tag with this name or slug already exists', 400);
            }

            throw error;
        }
    }

    async update(id: string, tagData: Partial<BlogTagResponseDto>): Promise<BlogTagResponseDto | null> {
        try {
            const tag = await BlogTag.findByPk(id);

            if (!tag) {
                return null;
            }

            await tag.update(tagData);

            return this.mapToTagResponseDto(tag);
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new AppError('A tag with this name or slug already exists', 400);
            }

            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await BlogTag.destroy({
            where: {
                id
            }
        });

        return deleted > 0;
    }

    async addTagToPost(postId: string, tagId: string): Promise<boolean> {
        try {
            const [postTag, created] = await BlogPostTag.findOrCreate({
                where: {
                    postId,
                    tagId
                },
                defaults: {
                    postId,
                    tagId
                }
            });

            return true;
        } catch (error) {
            console.error('Error adding tag to post:', error);
            return false;
        }
    }

    async removeTagFromPost(postId: string, tagId: string): Promise<boolean> {
        try {
            const deleted = await BlogPostTag.destroy({
                where: {
                    postId,
                    tagId
                }
            });

            return deleted > 0;
        } catch (error) {
            console.error('Error removing tag from post:', error);
            return false;
        }
    }

    async setPostTags(postId: string, tagIds: string[]): Promise<boolean> {
        try {
            // Supprimer toutes les associations existantes
            await BlogPostTag.destroy({
                where: {
                    postId
                }
            });

            // Créer les nouvelles associations
            for (const tagId of tagIds) {
                await BlogPostTag.create({
                    postId,
                    tagId
                });
            }

            return true;
        } catch (error) {
            console.error('Error setting post tags:', error);
            return false;
        }
    }

    async findOrCreateByName(name: string): Promise<BlogTagResponseDto> {
        const normalizedName = name.trim();
        const slug = slugify(normalizedName, { lower: true });

        try {
            const [tag, created] = await BlogTag.findOrCreate({
                where: {
                    [Op.or]: [
                        { name: normalizedName },
                        { slug }
                    ]
                },
                defaults: {
                    name: normalizedName,
                    slug
                }
            });

            return this.mapToTagResponseDto(tag);
        } catch (error) {
            console.error('Error finding or creating tag:', error);
            throw new AppError('Failed to create or find tag', 500);
        }
    }

    private mapToTagResponseDto(tag: BlogTag): BlogTagResponseDto {
        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
        };
    }
}