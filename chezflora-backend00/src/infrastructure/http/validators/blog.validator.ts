// src/infrastructure/http/validators/blog.validator.ts
import Joi from 'joi';

// Validators for BlogCategory
export const createCategorySchema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    slug: Joi.string().min(2).max(100),
    description: Joi.string().allow('', null)
});

export const updateCategorySchema = Joi.object({
    name: Joi.string().min(2).max(100),
    slug: Joi.string().min(2).max(100),
    description: Joi.string().allow('', null)
}).min(1);

// Validators for BlogPost
export const createPostSchema = Joi.object({
    title: Joi.string().required().min(5).max(200),
    content: Joi.string().required(),
    excerpt: Joi.string().max(500),
    categoryId: Joi.string().uuid(),
    status: Joi.string().valid('draft', 'published', 'archived'),
    tags: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string() // For form data that sends JSON as string
    )
});

export const updatePostSchema = Joi.object({
    title: Joi.string().min(5).max(200),
    content: Joi.string(),
    excerpt: Joi.string().max(500),
    categoryId: Joi.string().uuid(),
    status: Joi.string().valid('draft', 'published', 'archived'),
    tags: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string() // For form data that sends JSON as string
    )
}).min(1);

// Validators for BlogTag
export const createTagSchema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    slug: Joi.string().min(2).max(50)
});

export const updateTagSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    slug: Joi.string().min(2).max(50)
}).min(1);

// Validators for BlogComment
export const createCommentSchema = Joi.object({
    postId: Joi.string().uuid().required(),
    content: Joi.string().required().min(3).max(5000)
});