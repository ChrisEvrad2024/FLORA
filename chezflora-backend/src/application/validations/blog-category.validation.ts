// src/application/validations/blog-category.validation.ts
import Joi from 'joi';

export const createBlogCategorySchema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    description: Joi.string().max(500).allow('', null)
});

export const updateBlogCategorySchema = Joi.object({
    name: Joi.string().min(2).max(50),
    description: Joi.string().max(500).allow('', null)
}).min(1);