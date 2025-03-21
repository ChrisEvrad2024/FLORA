// src/infrastructure/http/controllers/promotion.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PromotionService } from '../../../application/services/promotion/promotion.service';
import { AppError } from '../middlewares/error.middleware';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

export class PromotionController {
    constructor(private promotionService: PromotionService) { }

    // Récupère toutes les promotions (admin)
    getAllPromotions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const isActive = req.query.isActive === 'true' ? true :
                req.query.isActive === 'false' ? false : undefined;

            const result = await this.promotionService.getAllPromotions(page, limit, isActive);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    // Récupère une promotion par son ID
    getPromotionById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const promotion = await this.promotionService.getPromotionById(req.params.id);

            if (!promotion) {
                return next(new AppError('Promotion not found', 404));
            }

            res.status(200).json({
                success: true,
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    };

    // Crée une nouvelle promotion
    createPromotion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const promotion = await this.promotionService.createPromotion(req.body);

            res.status(201).json({
                success: true,
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    };

    // Met à jour une promotion existante
    updatePromotion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const promotion = await this.promotionService.updatePromotion(req.params.id, req.body);

            if (!promotion) {
                return next(new AppError('Promotion not found', 404));
            }

            res.status(200).json({
                success: true,
                data: promotion
            });
        } catch (error) {
            next(error);
        }
    };

    // Supprime une promotion
    deletePromotion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.promotionService.deletePromotion(req.params.id);

            if (!result) {
                return next(new AppError('Promotion not found', 404));
            }

            res.status(200).json({
                success: true,
                message: 'Promotion deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Récupère les promotions actives
    getActivePromotions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const promotions = await this.promotionService.getActivePromotions();

            res.status(200).json({
                success: true,
                data: promotions
            });
        } catch (error) {
            next(error);
        }
    };

    // Valide un code promotionnel
    validatePromotion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code, cartTotal } = req.body;

            const isValid = await this.promotionService.validatePromotion(code, cartTotal);

            res.status(200).json({
                success: true,
                isValid
            });
        } catch (error) {
            next(error);
        }
    };

    // Applique une promotion au panier
    applyPromotionToCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.id) {
                return next(new AppError('User not authenticated', 401));
            }
            const userId = req.user.id;
            const { code } = req.body;

            // Récupérer l'ID du panier
            const cart = await this.promotionService.getUserCart(userId);

            if (!cart) {
                return next(new AppError('Cart not found', 404));
            }

            const result = await this.promotionService.applyPromotionToCart(code, cart.id);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    // Exporte un rapport des codes promotionnels
    exportPromotionCodesReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const promotions = await this.promotionService.getAllPromotions(1, 1000).then(result => result.promotions);

            // Définir le chemin du fichier
            const filePath = path.join(__dirname, '../../../../temp', `promotion-codes-${Date.now()}.csv`);

            // Créer le CSV Writer - Utiliser createObjectCsvWriter directement
            const writer = createObjectCsvWriter({
                path: filePath,
                header: [
                    { id: 'name', title: 'Nom' },
                    { id: 'code', title: 'Code' },
                    { id: 'type', title: 'Type' },
                    { id: 'value', title: 'Valeur' },
                    { id: 'usesCount', title: 'Nombre d\'utilisations' },
                    { id: 'maxUses', title: 'Utilisations maximum' },
                    { id: 'status', title: 'Statut' },
                    { id: 'startDate', title: 'Date de début' },
                    { id: 'endDate', title: 'Date de fin' }
                ]
            });

            // Formater les données
            const records = promotions.map(promo => ({
                name: promo.name,
                code: promo.code,
                type: promo.type === 'percentage' ? 'Pourcentage' : 'Montant fixe',
                value: promo.type === 'percentage' ? `${promo.value}%` : `${promo.value}€`,
                usesCount: promo.usesCount || 0,
                maxUses: promo.maxUses || 'Illimité',
                status: promo.isActive ? 'Actif' : 'Inactif',
                startDate: new Date(promo.startDate).toLocaleDateString(),
                endDate: new Date(promo.endDate).toLocaleDateString()
            }));

            // Écrire les données dans le fichier
            await writer.writeRecords(records);

            // Renvoyer le fichier
            res.download(filePath, `promotions-${new Date().toISOString().split('T')[0]}.csv`);
        } catch (error) {
            next(error);
        }
    };
}