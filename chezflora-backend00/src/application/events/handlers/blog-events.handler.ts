// src/application/events/handlers/blog-events.handler.ts
import { BlogPostPublishedEvent } from '../blog/post-published.event';
import { BlogCommentApprovedEvent } from '../blog/comment-approved.event';
import logger from '../../../infrastructure/logger';

export class BlogEventsHandler {
    // Gestionnaire pour l'événement de publication d'article
    public static handlePostPublished(event: BlogPostPublishedEvent): void {
        logger.info(`Blog post published: "${event.post.title}" (ID: ${event.post.id}) by ${event.publishedBy}`);
        
        // Ici, on pourrait implémenter:
        // 1. Envoi d'emails aux abonnés de la newsletter
        // 2. Création de notifications dans l'application
        // 3. Publication sur les réseaux sociaux
        // 4. Mise à jour des statistiques/analytics
    }

    // Gestionnaire pour l'événement d'approbation de commentaire
    public static handleCommentApproved(event: BlogCommentApprovedEvent): void {
        logger.info(`Blog comment approved: ID ${event.comment.id} by ${event.approvedBy}`);
        
        // Implémentations possibles:
        // 1. Notification à l'auteur du commentaire
        // 2. Notification à l'auteur de l'article
        // 3. Mise à jour du nombre de commentaires approuvés pour l'article
    }
}