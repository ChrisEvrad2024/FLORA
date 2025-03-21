// src/infrastructure/http/validators/promotion.validator.ts
import Joi from 'joi';

export const createPromotionSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(5),
    code: Joi.string().required().min(3).max(50).pattern(/^[A-Z0-9_-]+$/),
    type: Joi.string().valid('percentage', 'fixed_amount').required(),
    value: Joi.number().positive().required(),
    minPurchaseAmount: Joi.number().min(0).allow(null),
    maxUses: Joi.number().integer().min(1).allow(null),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    isActive: Joi.boolean().default(true),
    appliesTo: Joi.string().valid('all', 'categories', 'products').required(),
    categoryIds: Joi.when('appliesTo', {
        is: 'categories',
        then: Joi.array().items(Joi.string().uuid()).min(1).required(),
        otherwise: Joi.array().items(Joi.string().uuid()).allow(null)
    }),
    productIds: Joi.when('appliesTo', {
        is: 'products',
        then: Joi.array().items(Joi.string().uuid()).min(1).required(),
        otherwise: Joi.array().items(Joi.string().uuid()).allow(null)
    })
}).custom((value, helpers) => {
    if (value.type === 'percentage' && value.value > 100) {
        return helpers.error('percentage.invalid');
    }
    return value;
}, 'Percentage validation');

export const updatePromotionSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(5),
    type: Joi.string().valid('percentage', 'fixed_amount'),
    value: Joi.number().positive(),
    minPurchaseAmount: Joi.number().min(0).allow(null),
    maxUses: Joi.number().integer().min(1).allow(null),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    isActive: Joi.boolean(),
    appliesTo: Joi.string().valid('all', 'categories', 'products'),
    categoryIds: Joi.array().items(Joi.string().uuid()),
    productIds: Joi.array().items(Joi.string().uuid())
}).custom((value, helpers) => {
    if (value.type === 'percentage' && value.value > 100) {
        return helpers.error('percentage.invalid');
    }
    
    // Check required arrays based on appliesTo
    if (value.appliesTo === 'categories' && (!value.categoryIds || value.categoryIds.length === 0)) {
        return helpers.error('categoryIds.required');
    }
    
    if (value.appliesTo === 'products' && (!value.productIds || value.productIds.length === 0)) {
        return helpers.error('productIds.required');
    }
    
    return value;
}, 'Promotion update validation').min(1);

export const applyPromotionSchema = Joi.object({
    code: Joi.string().required(),
    cartId: Joi.string().uuid().required()
});

export const validatePromotionSchema = Joi.object({
    code: Joi.string().required(),
    cartTotal: Joi.number().min(0).required()
});