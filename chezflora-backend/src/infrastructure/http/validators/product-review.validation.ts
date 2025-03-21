// src/application/validations/product-review.validation.ts
import Joi from 'joi';

export const createProductReviewSchema = Joi.object({
    productId: Joi.string().uuid().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().required().min(3).max(100),
    content: Joi.string().required().min(10).max(1000)
});

export const updateProductReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5),
    title: Joi.string().min(3).max(100),
    content: Joi.string().min(10).max(1000)
}).min(1);

export const moderateProductReviewSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required()
});