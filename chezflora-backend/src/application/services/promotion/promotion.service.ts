// src/application/services/promotion/promotion.service.ts
import { PromotionServiceInterface } from '../../../interfaces/services/promotion-service.interface';
import { PromotionRepositoryInterface } from '../../../interfaces/repositories/promotion-repository.interface';
import { CartRepositoryInterface } from '../../../interfaces/repositories/cart-repository.interface';
import { PromotionResponseDto } from '../../dtos/promotion/promotion-response.dto';
import { CreatePromotionDto } from '../../dtos/promotion/create-promotion.dto';
import { UpdatePromotionDto } from '../../dtos/promotion/update-promotion.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createObjectCsvWriter } from 'csv-writer';

export class PromotionService implements PromotionServiceInterface {
    constructor(
        private promotionRepository: PromotionRepositoryInterface,
        private cartRepository: CartRepositoryInterface
    ) {}

    async getPromotionById(id: string): Promise<PromotionResponseDto> {
        const promotion = await this.promotionRepository.findById(id);
        
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        
        return promotion;
    }

    async getAllPromotions(page: number = 1, limit: number = 10, isActive?: boolean): Promise<{ promotions: PromotionResponseDto[], pagination: any }> {
        const { promotions, total } = await this.promotionRepository.findAll(page, limit, isActive);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            promotions,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async createPromotion(promotionData: CreatePromotionDto): Promise<PromotionResponseDto> {
        if (!promotionData.name) {
            throw new AppError('Name is required', 400);
        }
        
        if (!promotionData.description) {
            throw new AppError('Description is required', 400);
        }
        
        if (!promotionData.code) {
            throw new AppError('Code is required', 400);
        }
        
        if (!promotionData.type) {
            throw new AppError('Type is required', 400);
        }
        
        if (promotionData.value === undefined || promotionData.value <= 0) {
            throw new AppError('Value must be greater than 0', 400);
        }
        
        if (promotionData.type === 'percentage' && promotionData.value > 100) {
            throw new AppError('Percentage value cannot be greater than 100', 400);
        }
        
        if (!promotionData.startDate) {
            throw new AppError('Start date is required', 400);
        }
        
        if (!promotionData.endDate) {
            throw new AppError('End date is required', 400);
        }
        
        if (new Date(promotionData.startDate) > new Date(promotionData.endDate)) {
            throw new AppError('Start date cannot be after end date', 400);
        }
        
        if (!promotionData.appliesTo) {
            throw new AppError('Applies to field is required', 400);
        }
        
        // Check if code already exists
        const existingPromotion = await this.promotionRepository.findByCode(promotionData.code);
        if (existingPromotion) {
            throw new AppError('Promotion code already exists', 400);
        }
        
        // Validate category or product IDs based on appliesTo value
        if (promotionData.appliesTo === 'categories' && (!promotionData.categoryIds || promotionData.categoryIds.length === 0)) {
            throw new AppError('Category IDs are required when promotion applies to categories', 400);
        }
        
        if (promotionData.appliesTo === 'products' && (!promotionData.productIds || promotionData.productIds.length === 0)) {
            throw new AppError('Product IDs are required when promotion applies to products', 400);
        }
        
        return this.promotionRepository.create(promotionData);
    }

    async updatePromotion(id: string, promotionData: UpdatePromotionDto): Promise<PromotionResponseDto> {
        const promotion = await this.promotionRepository.findById(id);
        
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        
        // Validate dates if provided
        if (promotionData.startDate && promotionData.endDate && 
            new Date(promotionData.startDate) > new Date(promotionData.endDate)) {
            throw new AppError('Start date cannot be after end date', 400);
        }
        
        // Validate value if type is percentage
        if (promotionData.type === 'percentage' && promotionData.value && promotionData.value > 100) {
            throw new AppError('Percentage value cannot be greater than 100', 400);
        }
        
        // Validate category or product IDs based on appliesTo value
        if (promotionData.appliesTo === 'categories' && (!promotionData.categoryIds || promotionData.categoryIds.length === 0)) {
            throw new AppError('Category IDs are required when promotion applies to categories', 400);
        }
        
        if (promotionData.appliesTo === 'products' && (!promotionData.productIds || promotionData.productIds.length === 0)) {
            throw new AppError('Product IDs are required when promotion applies to products', 400);
        }
        
        const updatedPromotion = await this.promotionRepository.update(id, promotionData);
        
        if (!updatedPromotion) {
            throw new AppError('Failed to update promotion', 500);
        }
        
        return updatedPromotion;
    }

    async deletePromotion(id: string): Promise<boolean> {
        const promotion = await this.promotionRepository.findById(id);
        
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        
        return this.promotionRepository.delete(id);
    }

    async applyPromotionToCart(code: string, cartId: string): Promise<{ discount: number, newTotal: number }> {
        // Get the cart
        const cart = await this.cartRepository.findById(cartId);
        
        if (!cart) {
            throw new AppError('Cart not found', 404);
        }
        
        // Get the promotion
        const promotion = await this.promotionRepository.findByCode(code);
        
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        
        // Check if the promotion is valid
        const isValid = await this.validatePromotion(code, cart.totalAmount);
        
        if (!isValid) {
            throw new AppError('This promotion code is not valid or cannot be applied to this cart', 400);
        }
        
        // Calculate discount amount
        let discountAmount = 0;
        
        if (promotion.type === 'percentage') {
            discountAmount = (promotion.value / 100) * cart.totalAmount;
        } else { // fixed_amount
            discountAmount = promotion.value > cart.totalAmount ? cart.totalAmount : promotion.value;
        }
        
        // Calculate new total
        const newTotal = cart.totalAmount - discountAmount;
        
        // Increment the promotion's uses count
        await this.promotionRepository.incrementUsesCount(promotion.id);
        
        return {
            discount: discountAmount,
            newTotal
        };
    }

    async validatePromotion(code: string, cartTotal: number): Promise<boolean> {
        return this.promotionRepository.isPromotionValid(code, cartTotal);
    }

    async getActivePromotions(): Promise<PromotionResponseDto[]> {
        return this.promotionRepository.getActivePromotions();
    }

    async exportPromotionCodesReport(): Promise<string> {
        try {
            // Get all promotions
            const { promotions } = await this.promotionRepository.findAll(1, 1000);
            
            // Prepare data for CSV export
            const reportData = promotions.map(promotion => ({
                Code: promotion.code,
                Name: promotion.name,
                Type: promotion.type,
                Value: promotion.value,
                Status: promotion.isActive ? 'Active' : 'Inactive',
                UsesCount: promotion.usesCount,
                MaxUses: promotion.maxUses || 'Unlimited',
                StartDate: new Date(promotion.startDate).toLocaleDateString(),
                EndDate: new Date(promotion.endDate).toLocaleDateString(),
                AppliesTo: promotion.appliesTo,
                MinPurchaseAmount: promotion.minPurchaseAmount || 'None'
            }));
            
            // Create directory for exports if it doesn't exist
            const exportsDir = path.join(__dirname, '../../../../public/exports');
            if (!fs.existsSync(exportsDir)) {
                fs.mkdirSync(exportsDir, { recursive: true });
            }
            
            // Create a unique filename
            const filename = `promotion_codes_${new Date().toISOString().slice(0, 10)}_${uuidv4().slice(0, 8)}.csv`;
            const filePath = path.join(exportsDir, filename);
            
            // Create CSV writer
            const csvWriter = createObjectCsvWriter({
                path: filePath,
                header: [
                    { id: 'Code', title: 'Code' },
                    { id: 'Name', title: 'Name' },
                    { id: 'Type', title: 'Type' },
                    { id: 'Value', title: 'Value' },
                    { id: 'Status', title: 'Status' },
                    { id: 'UsesCount', title: 'Uses Count' },
                    { id: 'MaxUses', title: 'Max Uses' },
                    { id: 'StartDate', title: 'Start Date' },
                    { id: 'EndDate', title: 'End Date' },
                    { id: 'AppliesTo', title: 'Applies To' },
                    { id: 'MinPurchaseAmount', title: 'Min Purchase Amount' }
                ]
            });
            
            // Write data to CSV
            await csvWriter.writeRecords(reportData);
            
            // Return the path to the file
            return `/exports/${filename}`;
        } catch (error) {
            console.error('Error exporting promotion codes:', error);
            throw new AppError('Failed to export promotion codes', 500);
        }
    }

    async getUserCart(userId: string): Promise<any> {
        return this.cartRepository.findByUserId(userId);
    }
}