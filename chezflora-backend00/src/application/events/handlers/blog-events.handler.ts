// src/application/events/handlers/blog-events.handler.ts
import { BlogPostCreatedEvent } from "../blog/blog-post-created.event";
import { BlogPostUpdatedEvent } from "../blog/blog-post-updated.event";
import { BlogPostPublishedEvent } from "../blog/blog-post-published.event";
import { BlogCommentAddedEvent } from "../blog/blog-comment-added.event";
import { BlogCommentApprovedEvent } from "../blog/comment-approved.event";
import { EventEmitter } from "events";

export class BlogEventsHandler {
    private static emitter: EventEmitter = new EventEmitter();
    
    // Event names
    private static readonly POST_CREATED = 'blog:post:created';
    private static readonly POST_UPDATED = 'blog:post:updated';
    private static readonly POST_PUBLISHED = 'blog:post:published';
    private static readonly COMMENT_ADDED = 'blog:comment:added';
    private static readonly COMMENT_APPROVED = 'blog:comment:approved';
    
    /**
     * Handle post created event
     */
    public static handlePostCreated(event: BlogPostCreatedEvent): void {
        console.log(`Blog post created: ${event.post.title} by ${event.createdBy}`);
        
        // Emit event for other parts of the application to listen to
        this.emitter.emit(this.POST_CREATED, event);
        
        // Potential actions:
        // - Update statistics
        // - Index in search engine
        // - Notify admin
    }
    
    /**
     * Handle post updated event
     */
    public static handlePostUpdated(event: BlogPostUpdatedEvent): void {
        console.log(`Blog post updated: ${event.post.title} by ${event.updatedBy}`);
        
        this.emitter.emit(this.POST_UPDATED, event);
        
        // Potential actions:
        // - Update search index
        // - Invalidate cache
    }
    
    /**
     * Handle post published event
     */
    public static handlePostPublished(event: BlogPostPublishedEvent): void {
        console.log(`Blog post published: ${event.post.title} by ${event.publishedBy}`);
        
        this.emitter.emit(this.POST_PUBLISHED, event);
        
        // Potential actions:
        // - Send notifications to subscribers
        // - Post to social media
        // - Update featured posts list
    }
    
    /**
     * Handle comment added event
     */
    public static handleCommentAdded(event: BlogCommentAddedEvent): void {
        console.log(`New comment added to post ${event.postId}`);
        
        this.emitter.emit(this.COMMENT_ADDED, event);
        
        // Potential actions:
        // - Notify post author
        // - Update comment count
        // - Run spam check
    }
    
    /**
     * Handle comment approved event
     */
    public static handleCommentApproved(event: BlogCommentApprovedEvent): void {
        console.log(`Comment approved by ${event.approvedBy}`);
        
        this.emitter.emit(this.COMMENT_APPROVED, event);
        
        // Potential actions:
        // - Notify comment author
        // - Update comment statistics
    }
    
    /**
     * Register listeners for blog events
     */
    public static registerListeners(
        onPostCreated?: (event: BlogPostCreatedEvent) => void,
        onPostUpdated?: (event: BlogPostUpdatedEvent) => void,
        onPostPublished?: (event: BlogPostPublishedEvent) => void,
        onCommentAdded?: (event: BlogCommentAddedEvent) => void,
        onCommentApproved?: (event: BlogCommentApprovedEvent) => void
    ): void {
        if (onPostCreated) {
            this.emitter.on(this.POST_CREATED, onPostCreated);
        }
        
        if (onPostUpdated) {
            this.emitter.on(this.POST_UPDATED, onPostUpdated);
        }
        
        if (onPostPublished) {
            this.emitter.on(this.POST_PUBLISHED, onPostPublished);
        }
        
        if (onCommentAdded) {
            this.emitter.on(this.COMMENT_ADDED, onCommentAdded);
        }
        
        if (onCommentApproved) {
            this.emitter.on(this.COMMENT_APPROVED, onCommentApproved);
        }
    }
}