// src/application/validations/blog-post.validation.ts
import Joi from 'joi';

export const createBlogPostSchema = Joi.object({
    title: Joi.string().required().min(3).max(200),
    content: Joi.string().required().min(10),
    excerpt: Joi.string().max(500).allow('', null),
    categoryId: Joi.string().uuid().required(),
    status: Joi.string().valid('draft', 'published').default('draft'),
    publishDate: Joi.date().iso().allow(null),
    featuredImage: Joi.string().uri().allow('', null),
    tags: Joi.array().items(Joi.string()).allow(null)
});

export const updateBlogPostSchema = Joi.object({
    title: Joi.string().min(3).max(200),
    content: Joi.string().min(10),
    excerpt: Joi.string().max(500).allow('', null),
    categoryId: Joi.string().uuid(),
    status: Joi.string().valid('draft', 'published', 'archived'),
    publishDate: Joi.date().iso().allow(null),
    featuredImage: Joi.string().uri().allow('', null),
    tags: Joi.array().items(Joi.string()).allow(null)
}).min(1);