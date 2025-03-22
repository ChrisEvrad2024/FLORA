// src/infrastructure/repositories/promotion.repository.ts
import { PromotionRepositoryInterface } from '../../interfaces/repositories/promotion-repository.interface';
import { PromotionResponseDto } from '../../application/dtos/promotion/promotion-response.dto';
import { CreatePromotionDto } from '../../application/dtos/promotion/create-promotion.dto';
import { UpdatePromotionDto } from '../../application/dtos/promotion/update-promotion.dto';
import Promotion from '../database/models/promotion.model';
import { Op } from 'sequelize';

export class PromotionRepository implements PromotionRepositoryInterface {
    async findById(id: string): Promise<PromotionResponseDto | null> {
        try {
            const promotion = await Promotion.findByPk(id);
            if (!promotion) {
                return null;
            }
            
            return this.mapToResponseDto(promotion);
        } catch (error) {
            console.error('Error finding promotion by ID:', error);
            throw error;
        }
    }

    async findAll(page: number = 1, limit: number = 10, active?: boolean): Promise<{ promotions: PromotionResponseDto[], total: number }> {
        try {
            const offset = (page - 1) * limit;
            const where: any = {};
            
            if (active !== undefined) {
                where.isActive = active;
            }
            
            const { count, rows } = await Promotion.findAndCountAll({
                where,
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            
            const promotions = rows.map(promotion => this.mapToResponseDto(promotion));
            
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
        try {
            const promotion = await Promotion.create(promotionData);
            return this.mapToResponseDto(promotion);
        } catch (error) {
            console.error('Error creating promotion:', error);
            throw error;
        }
    }

    async update(id: string, promotionData: UpdatePromotionDto): Promise<PromotionResponseDto | null> {
        try {
            const promotion = await Promotion.findByPk(id);
            if (!promotion) {
                return null;
            }
            
            await promotion.update(promotionData);
            return this.mapToResponseDto(promotion);
        } catch (error) {
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

    async findActivePromotions(): Promise<PromotionResponseDto[]> {
        try {
            const currentDate = new Date();
            
            const promotions = await Promotion.findAll({
                where: {
                    isActive: true,
                    startDate: { [Op.lte]: currentDate },
                    endDate: { [Op.gte]: currentDate }
                },
                order: [['discountValue', 'DESC']]
            });
            
            return promotions.map(promotion => this.mapToResponseDto(promotion));
        } catch (error) {
            console.error('Error finding active promotions:', error);
            throw error;
        }
    }

    async findApplicablePromotions(amount: number, productIds?: string[], categoryIds?: string[]): Promise<PromotionResponseDto[]> {
        try {
            const currentDate = new Date();
            
            const promotions = await Promotion.findAll({
                where: {
                    isActive: true,
                    startDate: { [Op.lte]: currentDate },
                    endDate: { [Op.gte]: currentDate },
                    [Op.or]: [
                        { minimumPurchase: { [Op.lte]: amount } },
                        { minimumPurchase: null }
                    ]
                },
                order: [['discountValue', 'DESC']]
            });
            
            // Filtrer pour ne garder que les promotions applicables aux produits ou catégories
            const applicablePromotions = promotions.filter(promotion => {
                // Si la promotion n'a pas de restrictions, elle est applicable
                if (!promotion.applicableProducts && !promotion.applicableCategories) {
                    return true;
                }
                
                // Vérifier les produits applicables
                if (promotion.applicableProducts && promotion.applicableProducts.length > 0 && productIds && productIds.length > 0) {
                    // Si au moins un produit dans le panier est dans la liste des produits applicables
                    if (productIds.some(id => promotion.applicableProducts!.includes(id))) {
                        return true;
                    }
                }
                
                // Vérifier les catégories applicables
                if (promotion.applicableCategories && promotion.applicableCategories.length > 0 && categoryIds && categoryIds.length > 0) {
                    // Si au moins une catégorie dans le panier est dans la liste des catégories applicables
                    if (categoryIds.some(id => promotion.applicableCategories!.includes(id))) {
                        return true;
                    }
                }
                
                return false;
            });
            
            return applicablePromotions.map(promotion => this.mapToResponseDto(promotion));
        } catch (error) {
            console.error('Error finding applicable promotions:', error);
            throw error;
        }
    }

    private mapToResponseDto(promotion: any): PromotionResponseDto {
        return {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            discountType: promotion.discountType,
            discountValue: promotion.discountValue,
            startDate: promotion.startDate,
            endDate: promotion.endDate,
            isActive: promotion.isActive,
            minimumPurchase: promotion.minimumPurchase,
            maximumDiscount: promotion.maximumDiscount,
            applicableProducts: promotion.applicableProducts,
            applicableCategories: promotion.applicableCategories,
            createdAt: promotion.createdAt,
            updatedAt: promotion.updatedAt
        };
    }
}