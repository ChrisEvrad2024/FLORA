// src/application/validations/comment.validation.ts
import Joi from 'joi';

export const createCommentSchema = Joi.object({
    postId: Joi.string().uuid().required(),
    content: Joi.string().required().min(2).max(1000)
});

export const updateCommentSchema = Joi.object({
    content: Joi.string().min(2).max(1000)
});

export const moderateCommentSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required()
});