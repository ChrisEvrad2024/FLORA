// src/infrastructure/http/validators/blog.validator.ts
import Joi from 'joi';

// Blog Category Validation Schemas
export const createCategorySchema = Joi.object({
    name: Joi.string().required().min(2).max(100)
        .messages({
            'string.base': 'Le nom doit être une chaîne de caractères',
            'string.empty': 'Le nom est requis',
            'string.min': 'Le nom doit contenir au moins {#limit} caractères',
            'string.max': 'Le nom ne peut pas dépasser {#limit} caractères',
            'any.required': 'Le nom est requis'
        }),
    description: Joi.string().allow('', null).max(500)
        .messages({
            'string.base': 'La description doit être une chaîne de caractères',
            'string.max': 'La description ne peut pas dépasser {#limit} caractères'
        }),
    slug: Joi.string().allow('', null).max(100).pattern(/^[a-z0-9-]+$/)
        .messages({
            'string.base': 'Le slug doit être une chaîne de caractères',
            'string.max': 'Le slug ne peut pas dépasser {#limit} caractères',
            'string.pattern.base': 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets'
        })
});

export const updateCategorySchema = Joi.object({
    name: Joi.string().min(2).max(100)
        .messages({
            'string.base': 'Le nom doit être une chaîne de caractères',
            'string.min': 'Le nom doit contenir au moins {#limit} caractères',
            'string.max': 'Le nom ne peut pas dépasser {#limit} caractères'
        }),
    description: Joi.string().allow('', null).max(500)
        .messages({
            'string.base': 'La description doit être une chaîne de caractères',
            'string.max': 'La description ne peut pas dépasser {#limit} caractères'
        }),
    slug: Joi.string().allow('', null).max(100).pattern(/^[a-z0-9-]+$/)
        .messages({
            'string.base': 'Le slug doit être une chaîne de caractères',
            'string.max': 'Le slug ne peut pas dépasser {#limit} caractères',
            'string.pattern.base': 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets'
        })
}).min(1);

// Blog Post Validation Schemas
export const createPostSchema = Joi.object({
    categoryId: Joi.string().guid({ version: 'uuidv4' }).required()
        .messages({
            'string.base': 'L\'identifiant de catégorie doit être une chaîne de caractères',
            'string.guid': 'L\'identifiant de catégorie doit être un UUID valide',
            'any.required': 'L\'identifiant de catégorie est requis'
        }),
    title: Joi.string().required().min(3).max(200)
        .messages({
            'string.base': 'Le titre doit être une chaîne de caractères',
            'string.empty': 'Le titre est requis',
            'string.min': 'Le titre doit contenir au moins {#limit} caractères',
            'string.max': 'Le titre ne peut pas dépasser {#limit} caractères',
            'any.required': 'Le titre est requis'
        }),
    content: Joi.string().required().min(10)
        .messages({
            'string.base': 'Le contenu doit être une chaîne de caractères',
            'string.empty': 'Le contenu est requis',
            'string.min': 'Le contenu doit contenir au moins {#limit} caractères',
            'any.required': 'Le contenu est requis'
        }),
    excerpt: Joi.string().allow('', null).max(500)
        .messages({
            'string.base': 'L\'extrait doit être une chaîne de caractères',
            'string.max': 'L\'extrait ne peut pas dépasser {#limit} caractères'
        }),
    featuredImage: Joi.string().allow('', null).uri()
        .messages({
            'string.base': 'L\'image à la une doit être une chaîne de caractères',
            'string.uri': 'L\'image à la une doit être une URL valide'
        }),
    status: Joi.string().valid('draft', 'published', 'archived')
        .messages({
            'string.base': 'Le statut doit être une chaîne de caractères',
            'any.only': 'Le statut doit être draft, published ou archived'
        }),
    tags: Joi.array().items(Joi.string()).optional()
        .messages({
            'array.base': 'Les tags doivent être un tableau'
        })
});

export const updatePostSchema = Joi.object({
    categoryId: Joi.string().guid({ version: 'uuidv4' })
        .messages({
            'string.base': 'L\'identifiant de catégorie doit être une chaîne de caractères',
            'string.guid': 'L\'identifiant de catégorie doit être un UUID valide'
        }),
    title: Joi.string().min(3).max(200)
        .messages({
            'string.base': 'Le titre doit être une chaîne de caractères',
            'string.min': 'Le titre doit contenir au moins {#limit} caractères',
            'string.max': 'Le titre ne peut pas dépasser {#limit} caractères'
        }),
    content: Joi.string().min(10)
        .messages({
            'string.base': 'Le contenu doit être une chaîne de caractères',
            'string.min': 'Le contenu doit contenir au moins {#limit} caractères'
        }),
    excerpt: Joi.string().allow('', null).max(500)
        .messages({
            'string.base': 'L\'extrait doit être une chaîne de caractères',
            'string.max': 'L\'extrait ne peut pas dépasser {#limit} caractères'
        }),
    featuredImage: Joi.string().allow('', null).uri()
        .messages({
            'string.base': 'L\'image à la une doit être une chaîne de caractères',
            'string.uri': 'L\'image à la une doit être une URL valide'
        }),
    status: Joi.string().valid('draft', 'published', 'archived')
        .messages({
            'string.base': 'Le statut doit être une chaîne de caractères',
            'any.only': 'Le statut doit être draft, published ou archived'
        }),
    tags: Joi.array().items(Joi.string()).optional()
        .messages({
            'array.base': 'Les tags doivent être un tableau'
        })
}).min(1);

// Blog Comment Validation Schemas
export const createCommentSchema = Joi.object({
    postId: Joi.string().guid({ version: 'uuidv4' }).required()
        .messages({
            'string.base': 'L\'identifiant d\'article doit être une chaîne de caractères',
            'string.guid': 'L\'identifiant d\'article doit être un UUID valide',
            'any.required': 'L\'identifiant d\'article est requis'
        }),
    content: Joi.string().required().min(3).max(1000)
        .messages({
            'string.base': 'Le contenu doit être une chaîne de caractères',
            'string.empty': 'Le contenu est requis',
            'string.min': 'Le contenu doit contenir au moins {#limit} caractères',
            'string.max': 'Le contenu ne peut pas dépasser {#limit} caractères',
            'any.required': 'Le contenu est requis'
        })
});

// Tag Validation Schemas
export const createTagSchema = Joi.object({
    name: Joi.string().required().min(2).max(50)
        .messages({
            'string.base': 'Le nom doit être une chaîne de caractères',
            'string.empty': 'Le nom est requis',
            'string.min': 'Le nom doit contenir au moins {#limit} caractères',
            'string.max': 'Le nom ne peut pas dépasser {#limit} caractères',
            'any.required': 'Le nom est requis'
        }),
    slug: Joi.string().allow('', null).max(50).pattern(/^[a-z0-9-]+$/)
        .messages({
            'string.base': 'Le slug doit être une chaîne de caractères',
            'string.max': 'Le slug ne peut pas dépasser {#limit} caractères',
            'string.pattern.base': 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets'
        })
});