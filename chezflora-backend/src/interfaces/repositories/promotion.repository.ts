// src/infrastructure/repositories/promotion.repository.ts
import { PromotionRepositoryInterface } from '../../interfaces/repositories/promotion-repository.interface';
import { PromotionResponseDto } from '../../application/dtos/promotion/promotion-response.dto';
import { CreatePromotionDto } from '../../application/dtos/promotion/create-promotion.dto';
import { UpdatePromotionDto } from '../../application/dtos/promotion/update-promotion.dto';
import Promotion from '../../infrastructure/database/models/promotion.model';
import PromotionCategory from '../../infrastructure/database/models/promotion-category.model';
import PromotionProduct from '../../infrastructure/database/models/promotion-product.model';
import Category from '../../infrastructure/database/models/category.model';
import Product from '../../infrastructure/database/models/product.model';
import { Op } from 'sequelize';
import sequelize from '../../infrastructure/config/database';

export class PromotionRepository implements PromotionRepositoryInterface {
    async findById(id: string): Promise<PromotionResponseDto | null> {
        try {
            const promotion = await Promotion.findByPk(id, {
                include: [
                    {
                        model: PromotionCategory,
                        include: [Category]
                    },
                    {
                        model: PromotionProduct,
                        include: [Product]
                    }
                ]
            });

            if (!promotion) {
                return null;
            }

            return this.mapToResponseDto(promotion);
        } catch (error) {
            console.error('Error finding promotion by ID:', error);
            throw error;
        }
    }

    async findByCode(code: string): Promise<PromotionResponseDto | null> {
        try {
            const promotion = await Promotion.findOne({
                where: { code },
                include: [
                    {
                        model: PromotionCategory,
                        include: [Category]
                    },
                    {
                        model: PromotionProduct,
                        include: [Product]
                    }
                ]
            });

            if (!promotion) {
                return null;
            }

            return this.mapToResponseDto(promotion);
        } catch (error) {
            console.error('Error finding promotion by code:', error);
            throw error;
        }
    }

    async findAll(page: number = 1, limit: number = 10, isActive?: boolean): Promise<{ promotions: PromotionResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;

            const where: any = {};
            if (isActive !== undefined) {
                where.isActive = isActive;
            }

            const { count, rows } = await Promotion.findAndCountAll({
                where,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: PromotionCategory,
                        include: [Category]
                    },
                    {
                        model: PromotionProduct,
                        include: [Product]
                    }
                ]
            });

            const promotions = rows.map((promotion:any) => this.mapToResponseDto(promotion));

            return {
                promotions,
                total: count
            };
        } catch (error) {
            console.error('Error finding all promotions:', error);
            throw error;
        }
    }

    async create(promotionData: CreatePromotionDto): Promise<PromotionResponseDto> {
        const transaction = await sequelize.transaction();

        try {
            // Create the promotion
            const promotion = await Promotion.create({
                name: promotionData.name,
                description: promotionData.description,
                code: promotionData.code,
                type: promotionData.type,
                value: promotionData.value,
                minPurchaseAmount: promotionData.minPurchaseAmount,
                maxUses: promotionData.maxUses,
                startDate: promotionData.startDate,
                endDate: promotionData.endDate,
                isActive: promotionData.isActive !== undefined ? promotionData.isActive : true,
                appliesTo: promotionData.appliesTo,
                usesCount: 0
            }, { transaction });

            // Associate categories if applicable
            if (promotionData.appliesTo === 'categories' && promotionData.categoryIds && promotionData.categoryIds.length > 0) {
                await this.associateCategoriesWithPromotion(promotion.id, promotionData.categoryIds, transaction);
            }

            // Associate products if applicable
            if (promotionData.appliesTo === 'products' && promotionData.productIds && promotionData.productIds.length > 0) {
                await this.associateProductsWithPromotion(promotion.id, promotionData.productIds, transaction);
            }

            await transaction.commit();

            return this.findById(promotion.id) as Promise<PromotionResponseDto>;
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating promotion:', error);
            throw error;
        }
    }

    async update(id: string, promotionData: UpdatePromotionDto): Promise<PromotionResponseDto | null> {
        const transaction = await sequelize.transaction();

        try {
            const promotion = await Promotion.findByPk(id);

            if (!promotion) {
                await transaction.rollback();
                return null;
            }

            // Update promotion attributes
            await promotion.update({
                name: promotionData.name,
                description: promotionData.description,
                type: promotionData.type,
                value: promotionData.value,
                minPurchaseAmount: promotionData.minPurchaseAmount,
                maxUses: promotionData.maxUses,
                startDate: promotionData.startDate,
                endDate: promotionData.endDate,
                isActive: promotionData.isActive,
                appliesTo: promotionData.appliesTo
            }, { transaction });

            // Update category associations if appliesTo is categories
            if (promotionData.appliesTo === 'categories' && promotionData.categoryIds) {
                await this.removeAllCategoryAssociations(id, transaction);
                await this.associateCategoriesWithPromotion(id, promotionData.categoryIds, transaction);
            }

            // Update product associations if appliesTo is products
            if (promotionData.appliesTo === 'products' && promotionData.productIds) {
                await this.removeAllProductAssociations(id, transaction);
                await this.associateProductsWithPromotion(id, promotionData.productIds, transaction);
            }

            await transaction.commit();

            return this.findById(id) as Promise<PromotionResponseDto>;
        } catch (error) {
            await transaction.rollback();
            console.error('Error updating promotion:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const promotion = await Promotion.findByPk(id);

            if (!promotion) {
                return false;
            }

            await promotion.destroy();

            return true;
        } catch (error) {
            console.error('Error deleting promotion:', error);
            throw error;
        }
    }

    async isPromotionValid(code: string, cartTotal: number): Promise<boolean> {
        try {
            const now = new Date();

            const promotion = await Promotion.findOne({
                where: {
                    code,
                    isActive: true,
                    startDate: { [Op.lte]: now },
                    endDate: { [Op.gte]: now }
                }
            });

            if (!promotion) {
                return false; // Code not found or not active
            }

            // Check if the promotion has a minimum purchase amount requirement
            if (promotion.minPurchaseAmount && cartTotal < promotion.minPurchaseAmount) {
                return false; // Cart total is too low
            }

            // Check if the promotion has reached its maximum uses
            if (promotion.maxUses != null && promotion.usesCount >= promotion.maxUses) {
                return false; // Maximum uses reached
            }

            return true;
        } catch (error) {
            console.error('Error checking promotion validity:', error);
            throw error;
        }
    }

    async incrementUsesCount(id: string): Promise<boolean> {
        try {
            const promotion = await Promotion.findByPk(id);

            if (!promotion) {
                return false;
            }

            await promotion.increment('usesCount');

            return true;
        } catch (error) {
            console.error('Error incrementing uses count:', error);
            throw error;
        }
    }

    async associateCategoriesWithPromotion(promotionId: string, categoryIds: string[], transaction?: any): Promise<void> {
        try {
            const categoryPromises = categoryIds.map(categoryId =>
                PromotionCategory.create({
                    promotionId,
                    categoryId
                }, { transaction })
            );

            await Promise.all(categoryPromises);
        } catch (error) {
            console.error('Error associating categories with promotion:', error);
            throw error;
        }
    }

    async associateProductsWithPromotion(promotionId: string, productIds: string[], transaction?: any): Promise<void> {
        try {
            const productPromises = productIds.map(productId =>
                PromotionProduct.create({
                    promotionId,
                    productId
                }, { transaction })
            );

            await Promise.all(productPromises);
        } catch (error) {
            console.error('Error associating products with promotion:', error);
            throw error;
        }
    }

    async removeAllCategoryAssociations(promotionId: string, transaction?: any): Promise<void> {
        try {
            await PromotionCategory.destroy({
                where: { promotionId },
                transaction
            });
        } catch (error) {
            console.error('Error removing category associations:', error);
            throw error;
        }
    }

    async removeAllProductAssociations(promotionId: string, transaction?: any): Promise<void> {
        try {
            await PromotionProduct.destroy({
                where: { promotionId },
                transaction
            });
        } catch (error) {
            console.error('Error removing product associations:', error);
            throw error;
        }
    }

    async getActivePromotions(): Promise<PromotionResponseDto[]> {
        try {
            const now = new Date();

            const promotions = await Promotion.findAll({
                where: {
                    isActive: true,
                    startDate: { [Op.lte]: now },
                    endDate: { [Op.gte]: now }
                },
                include: [
                    {
                        model: PromotionCategory,
                        include: [Category]
                    },
                    {
                        model: PromotionProduct,
                        include: [Product]
                    }
                ]
            });

            return promotions.map((promotion:any) => this.mapToResponseDto(promotion));
        } catch (error) {
            console.error('Error getting active promotions:', error);
            throw error;
        }
    }

    async getApplicablePromotionsForCart(cartItems: { productId: string, categoryId: string, total: number }[], cartTotal: number): Promise<PromotionResponseDto[]> {
        try {
            const now = new Date();

            const activePromotions = await Promotion.findAll({
                where: {
                    isActive: true,
                    startDate: { [Op.lte]: now },
                    endDate: { [Op.gte]: now }
                },
                include: [
                    {
                        model: PromotionCategory,
                        include: [Category]
                    },
                    {
                        model: PromotionProduct,
                        include: [Product]
                    }
                ]
            });

            // Filter promotions that can be applied to the cart
            const applicablePromotions = activePromotions.filter((promotion:any) => {
                // Check minimum purchase amount
                if (promotion.minPurchaseAmount && cartTotal < promotion.minPurchaseAmount) {
                    return false;
                }

                // Check maximum uses
                if (promotion.maxUses !== null && promotion.usesCount >= promotion.maxUses) {
                    return false;
                }

                // Check promotion application type
                if (promotion.appliesTo === 'all') {
                    return true; // Applies to all products
                } else if (promotion.appliesTo === 'categories') {
                    // Get all category IDs associated with this promotion
                    const promotionCategoryIds = promotion.categories.map((pc:any) => pc.categoryId);

                    // Check if any cart item has a category ID that matches
                    return cartItems.some(item => promotionCategoryIds.includes(item.categoryId));
                } else if (promotion.appliesTo === 'products') {
                    // Get all product IDs associated with this promotion
                    const promotionProductIds = promotion.products.map((pp:any) => pp.productId);

                    // Check if any cart item has a product ID that matches
                    return cartItems.some(item => promotionProductIds.includes(item.productId));
                }

                return false;
            });

            return applicablePromotions.map((promotion:any) => this.mapToResponseDto(promotion));
        } catch (error) {
            console.error('Error getting applicable promotions:', error);
            throw error;
        }
    }

    private mapToResponseDto(promotion: any): PromotionResponseDto {
        // Map category IDs
        const categoryIds = promotion.categories
            ? promotion.categories.map((pc: any) => pc.categoryId)
            : [];

        // Map product IDs
        const productIds = promotion.products
            ? promotion.products.map((pp: any) => pp.productId)
            : [];

        return {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            code: promotion.code,
            type: promotion.type,
            value: parseFloat(promotion.value.toString()),
            minPurchaseAmount: promotion.minPurchaseAmount ? parseFloat(promotion.minPurchaseAmount.toString()) : undefined,
            maxUses: promotion.maxUses,
            usesCount: promotion.usesCount,
            startDate: promotion.startDate,
            endDate: promotion.endDate,
            isActive: promotion.isActive,
            appliesTo: promotion.appliesTo,
            categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
            productIds: productIds.length > 0 ? productIds : undefined,
            createdAt: promotion.createdAt,
            updatedAt: promotion.updatedAt
        };
    }
}