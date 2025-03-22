// src/application/validations/coupon.validation.ts
import Joi from 'joi';

export const createCouponSchema = Joi.object({
    code: Joi.string().min(4).max(20).pattern(/^[A-Z0-9_-]+$/),
    promotionId: Joi.string().uuid().required(),
    usageLimit: Joi.number().integer().min(1).allow(null),
    isActive: Joi.boolean().default(true),
    expiryDate: Joi.date().iso().min('now').allow(null)
});

export const updateCouponSchema = Joi.object({
    promotionId: Joi.string().uuid(),
    usageLimit: Joi.number().integer().min(1).allow(null),
    isActive: Joi.boolean(),
    expiryDate: Joi.date().iso().min('now').allow(null)
}).min(1);

export const verifyCouponSchema = Joi.object({
    code: Joi.string().required(),
    amount: Joi.number().min(0),
    productIds: Joi.array().items(Joi.string().uuid()),
    categoryIds: Joi.array().items(Joi.string().uuid())
});

export const newsletterExportSchema = Joi.object({
    format: Joi.string().valid('csv', 'excel', 'json').required(),
    activeOnly: Joi.boolean().default(true)
});