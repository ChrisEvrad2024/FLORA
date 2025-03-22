// src/application/services/blog/blog-revision.service.ts
import { BlogPostRepositoryInterface } from '../../../interfaces/repositories/blog-post-repository.interface';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import { Sequelize } from 'sequelize-typescript';
import { diff_match_patch } from 'diff-match-patch';
import { v4 as uuidv4 } from 'uuid';

// Définir les interfaces pour les révisions
export interface BlogPostRevision {
    id: string;
    postId: string;
    authorId: string;
    title: string;
    content: string;
    excerpt?: string;
    revisionNumber: number;
    changes: Array<{
        field: string;
        oldValue: string;
        newValue: string;
        diffs?: string; // Stocke les différences sous format de patch
    }>;
    comment?: string;
    createdAt: Date;
}

export interface CreateRevisionOptions {
    comment?: string;
    minor?: boolean;
}

export class BlogRevisionService {
    private diffTool: diff_match_patch;

    constructor(
        private blogPostRepository: BlogPostRepositoryInterface,
        private sequelize: Sequelize
    ) {
        // Initialiser l'outil de différence pour générer des diffs entre les versions
        this.diffTool = new diff_match_patch();
    }

    /**
     * Créer une nouvelle révision d'un article
     */
    async createRevision(
        postId: string,
        authorId: string,
        updatedData: any,
        options: CreateRevisionOptions = {}
    ): Promise<BlogPostRevision> {
        const transaction = await this.sequelize.transaction();

        try {
            // Récupérer l'article original
            const originalPost = await this.blogPostRepository.findById(postId);
            if (!originalPost) {
                throw new AppError('Post not found', 404);
            }

            // Récupérer le numéro de la dernière révision
            const lastRevision = await this.getLatestRevision(postId);
            const revisionNumber = lastRevision ? lastRevision.revisionNumber + 1 : 1;

            // Préparer les données pour comparer les changements
            const fieldsToTrack = ['title', 'content', 'excerpt', 'categoryId', 'status'];
            const changes = [];

            // Comparer les champs et générer les différences
            for (const field of fieldsToTrack) {
                if (updatedData[field] !== undefined && updatedData[field] !== originalPost[field]) {
                    const oldValue = originalPost[field] || '';
                    const newValue = updatedData[field] || '';

                    const change = {
                        field,
                        oldValue,
                        newValue
                    };

                    // Pour le contenu textuel, générer également un diff
                    if (typeof oldValue === 'string' && typeof newValue === 'string') {
                        const diffs = this.diffTool.diff_main(oldValue, newValue);
                        this.diffTool.diff_cleanupSemantic(diffs);
                        const patches = this.diffTool.patch_make(oldValue, diffs);
                        const patchText = this.diffTool.patch_toText(patches);

                        change['diffs'] = patchText;
                    }

                    changes.push(change);
                }
            }

            // Si aucun changement, ne pas créer de révision
            if (changes.length === 0) {
                return null;
            }

            // Créer la révision
            const revision: BlogPostRevision = {
                id: uuidv4(),
                postId,
                authorId,
                title: originalPost.title,
                content: originalPost.content,
                excerpt: originalPost.excerpt,
                revisionNumber,
                changes,
                comment: options.comment || '',
                createdAt: new Date()
            };

            // Enregistrer la révision en base de données
            await this.sequelize.query(`
                INSERT INTO blog_post_revisions (
                    id,
                    post_id,
                    author_id,
                    title,
                    content,
                    excerpt,
                    revision_number,
                    changes,
                    comment,
                    minor_edit,
                    created_at
                ) VALUES (
                    :id,
                    :postId,
                    :authorId,
                    :title,
                    :content,
                    :excerpt,
                    :revisionNumber,
                    :changes,
                    :comment,
                    :minor,
                    NOW()
                )
            `, {
                replacements: {
                    id: revision.id,
                    postId: revision.postId,
                    authorId: revision.authorId,
                    title: revision.title,
                    content: revision.content,
                    excerpt: revision.excerpt || null,
                    revisionNumber: revision.revisionNumber,
                    changes: JSON.stringify(revision.changes),
                    comment: revision.comment || null,
                    minor: options.minor ? 1 : 0
                },
                transaction
            });

            await transaction.commit();

            return revision;
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating blog post revision:', error);
            throw error;
        }
    }

    /**
     * Récupérer l'historique des révisions d'un article
     */
    async getRevisionHistory(
        postId: string,
        options: { page?: number; limit?: number; includeDiffs?: boolean } = {}
    ): Promise<{ revisions: BlogPostRevision[]; total: number; totalPages: number }> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const offset = (page - 1) * limit;

        try {
            // Requête SQL pour obtenir les révisions d'un article
            const query = `
                SELECT 
                    id,
                    post_id,
                    author_id,
                    title,
                    ${options.includeDiffs ? 'content, excerpt,' : ''}
                    revision_number,
                    changes,
                    comment,
                    created_at
                FROM 
                    blog_post_revisions
                WHERE 
                    post_id = :postId
                ORDER BY 
                    revision_number DESC
                LIMIT :limit OFFSET :offset
            `;

            const countQuery = `
                SELECT COUNT(*) as total
                FROM blog_post_revisions
                WHERE post_id = :postId
            `;

            const [revisions] = await this.sequelize.query(query, {
                replacements: {
                    postId,
                    limit,
                    offset
                }
            });

            const [countResult] = await this.sequelize.query(countQuery, {
                replacements: {
                    postId
                }
            });

            const total = parseInt(countResult[0].total, 10);
            const totalPages = Math.ceil(total / limit);

            // Formater les résultats
            const formattedRevisions = revisions.map((rev: any) => ({
                id: rev.id,
                postId: rev.post_id,
                authorId: rev.author_id,
                title: rev.title,
                content: rev.content,
                excerpt: rev.excerpt,
                revisionNumber: rev.revision_number,
                changes: typeof rev.changes === 'string' ? JSON.parse(rev.changes) : rev.changes,
                comment: rev.comment,
                createdAt: rev.created_at
            }));

            return {
                revisions: formattedRevisions,
                total,
                totalPages
            };
        } catch (error) {
            console.error('Error fetching blog post revisions:', error);
            throw error;
        }
    }

    /**
     * Récupérer une révision spécifique d'un article
     */
    async getRevision(postId: string, revisionNumber: number): Promise<BlogPostRevision> {
        try {
            const [results] = await this.sequelize.query(`
                SELECT 
                    id,
                    post_id,
                    author_id,
                    title,
                    content,
                    excerpt,
                    revision_number,
                    changes,
                    comment,
                    created_at
                FROM 
                    blog_post_revisions
                WHERE 
                    post_id = :postId
                    AND revision_number = :revisionNumber
            `, {
                replacements: {
                    postId,
                    revisionNumber
                }
            });

            if (results.length === 0) {
                throw new AppError('Revision not found', 404);
            }

            const rev = results[0];

            return {
                id: rev.id,
                postId: rev.post_id,
                authorId: rev.author_id,
                title: rev.title,
                content: rev.content,
                excerpt: rev.excerpt,
                revisionNumber: rev.revision_number,
                changes: typeof rev.changes === 'string' ? JSON.parse(rev.changes) : rev.changes,
                comment: rev.comment,
                createdAt: rev.created_at
            };
        } catch (error) {
            console.error('Error fetching blog post revision:', error);
            throw error;
        }
    }

    /**
     * Récupérer la dernière révision d'un article
     */
    async getLatestRevision(postId: string): Promise<BlogPostRevision | null> {
        try {
            const [results] = await this.sequelize.query(`
                SELECT 
                    id,
                    post_id,
                    author_id,
                    title,
                    content,
                    excerpt,
                    revision_number,
                    changes,
                    comment,
                    created_at
                FROM 
                    blog_post_revisions
                WHERE 
                    post_id = :postId
                ORDER BY 
                    revision_number DESC
                LIMIT 1
            `, {
                replacements: {
                    postId
                }
            });

            if (results.length === 0) {
                return null;
            }

            const rev = results[0];

            return {
                id: rev.id,
                postId: rev.post_id,
                authorId: rev.author_id,
                title: rev.title,
                content: rev.content,
                excerpt: rev.excerpt,
                revisionNumber: rev.revision_number,
                changes: typeof rev.changes === 'string' ? JSON.parse(rev.changes) : rev.changes,
                comment: rev.comment,
                createdAt: rev.created_at
            };
        } catch (error) {
            console.error('Error fetching latest blog post revision:', error);
            throw error;
        }
    }

    /**
     * Comparer deux révisions d'un article
     */
    async compareRevisions(
        postId: string,
        fromRevision: number,
        toRevision: number
    ): Promise<any> {
        try {
            const fromRev = await this.getRevision(postId, fromRevision);
            const toRev = await this.getRevision(postId, toRevision);

            // Générer les différences entre les deux révisions
            const fieldsToCompare = ['title', 'content', 'excerpt'];
            const comparisons = {};

            for (const field of fieldsToCompare) {
                const oldText = fromRev[field] || '';
                const newText = toRev[field] || '';

                // Générer le diff entre les deux textes
                const diffs = this.diffTool.diff_main(oldText, newText);
                this.diffTool.diff_cleanupSemantic(diffs);

                comparisons[field] = {
                    diffs,
                    htmlDiff: this.diffToHtml(diffs),
                    unchanged: oldText === newText
                };
            }

            return {
                fromRevision: fromRev,
                toRevision: toRev,
                comparisons
            };
        } catch (error) {
            console.error('Error comparing blog post revisions:', error);
            throw error;
        }
    }

    /**
     * Restaurer une révision précédente d'un article
     */
    async restoreRevision(
        postId: string,
        revisionNumber: number,
        authorId: string,
        options: CreateRevisionOptions = {}
    ): Promise<BlogPostRevision> {
        const transaction = await this.sequelize.transaction();

        try {
            // Récupérer la révision à restaurer
            const revisionToRestore = await this.getRevision(postId, revisionNumber);
            if (!revisionToRestore) {
                throw new AppError('Revision not found', 404);
            }

            // Préparer les données pour la mise à jour
            const updateData = {
                title: revisionToRestore.title,
                content: revisionToRestore.content,
                excerpt: revisionToRestore.excerpt
            };

            // Créer une nouvelle révision pour documenter la restauration
            const restorationComment = options.comment || `Restored from revision #${revisionNumber}`;
            const newRevision = await this.createRevision(postId, authorId, updateData, {
                comment: restorationComment,
                minor: options.minor
            });

            // Mettre à jour l'article avec les données de la révision restaurée
            await this.blogPostRepository.update(postId, updateData);

            await transaction.commit();

            return newRevision;
        } catch (error) {
            await transaction.rollback();
            console.error('Error restoring blog post revision:', error);
            throw error;
        }
    }

    /**
     * Supprimer une révision d'un article
     * Note: Dans la plupart des systèmes de révision, les révisions sont rarement supprimées
     * pour maintenir l'intégrité de l'historique.
     */
    async deleteRevision(revisionId: string): Promise<boolean> {
        try {
            const [deletedCount] = await this.sequelize.query(`
                DELETE FROM blog_post_revisions
                WHERE id = :revisionId
            `, {
                replacements: {
                    revisionId
                }
            });

            return deletedCount > 0;
        } catch (error) {
            console.error('Error deleting blog post revision:', error);
            throw error;
        }
    }

    /**
     * Convertir les différences en HTML pour affichage
     */
    private diffToHtml(diffs: any[]): string {
        let html = '';

        for (const [op, text] of diffs) {
            const safeText = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');

            switch (op) {
                case 1: // Insertion
                    html += `<ins style="background-color:#e6ffe6;">${safeText}</ins>`;
                    break;
                case -1: // Suppression
                    html += `<del style="background-color:#ffe6e6;">${safeText}</del>`;
                    break;
                case 0: // Egalité
                    html += `<span>${safeText}</span>`;
                    break;
            }
        }

        return html;
    }
}