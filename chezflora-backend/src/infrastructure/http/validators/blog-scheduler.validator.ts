// src/infrastructure/http/validators/blog-scheduler.validator.ts
import Joi from 'joi';

export const scheduleBlogPostSchema = Joi.object({
    scheduledPublishDate: Joi.date().iso().required().greater('now')
});