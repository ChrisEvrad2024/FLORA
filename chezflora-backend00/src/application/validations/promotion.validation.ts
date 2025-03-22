// src/application/validations/promotion.validation.ts
import Joi from 'joi';

export const createPromotionSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().allow('', null),
    discountType: Joi.string().valid('percentage', 'fixed').required(),
    discountValue: Joi.number().required().positive(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    isActive: Joi.boolean().default(true),
    minimumPurchase: Joi.number().min(0).allow(null),
    maximumDiscount: Joi.when('discountType', {
        is: 'percentage',
        then: Joi.number().min(0).allow(null),
        otherwise: Joi.allow(null)
    }),
    applicableProducts: Joi.array().items(Joi.string().uuid()).allow(null),
    applicableCategories: Joi.array().items(Joi.string().uuid()).allow(null)
});

export const updatePromotionSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().allow('', null),
    discountType: Joi.string().valid('percentage', 'fixed'),
    discountValue: Joi.number().positive(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    isActive: Joi.boolean(),
    minimumPurchase: Joi.number().min(0).allow(null),
    maximumDiscount: Joi.number().min(0).allow(null),
    applicableProducts: Joi.array().items(Joi.string().uuid()).allow(null),
    applicableCategories: Joi.array().items(Joi.string().uuid()).allow(null)
}).min(1);