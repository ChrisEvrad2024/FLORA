// src/infrastructure/config/database.ts
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import path from 'path';
import logger from '../logger';

// Import des modèles
import User from '../database/models/user.model';
import Address from '../database/models/address.model';
import Product from '../database/models/product.model';
import Category from '../database/models/category.model';
import Cart from '../database/models/cart.model';
import CartItem from '../database/models/cart-item.model';
import Order from '../database/models/order.model';
import OrderItem from '../database/models/order-item.model';
import Quote from '../database/models/quote.model';
import QuoteItem from '../database/models/quote-item.model';
import Favorite from '../database/models/favorite.model';
import NewsletterSubscription from '../database/models/newsletter-subscription.model';
import Invoice from '../database/models/invoice.model';
import BlogPost from '../database/models/blog-post.model';
import BlogCategory from '../database/models/blog-category.model';
import Comment from '../database/models/comment.model';
import Tag from '../database/models/tag.model';
import PostTag from '../database/models/post-tag.model';
import ProductImage from '../database/models/product-image.model';

dotenv.config();

// Liste de tous les modèles
const models = [
    User,
    Address,
    Product,
    Category,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Quote,
    QuoteItem,
    Favorite,
    NewsletterSubscription,
    Invoice,
    BlogPost,
    BlogCategory,
    Product,
    ProductImage,
    Comment,
    Tag,
    PostTag
];

export const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chezflora',
    logging: (msg) => logger.debug(msg),
    models: models, // Utiliser la liste des modèles importée
    define: {
        timestamps: true,
        underscored: true,
    },
});

export const initDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to database has been established successfully.');

        // Synchronisation en développement uniquement
        if (process.env.NODE_ENV === 'development') {
            try {
                // Désactiver les vérifications de clés étrangères
                await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
                
                // Méthode sécurisée: synchroniser chaque modèle individuellement
                for (const model of models) {
                    try {
                        await sequelize.models[model.name].sync({ alter: true });
                        logger.info(`Model ${model.name} synchronized`);
                    } catch (error: any) {
                        // Typage 'any' pour accéder à la propriété message
                        logger.warn(`Error synchronizing model ${model.name}: ${error.message || error}`);
                        // Continuer avec le prochain modèle même si celui-ci échoue
                    }
                }
                
                // Réactiver les vérifications de clés étrangères
                await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
                logger.info('Database synchronized safely');
            } catch (error: any) {
                logger.error('Error during model synchronization:', error);
                // Ne pas quitter le processus, permettre à l'application de démarrer
            }
        }
    } catch (error: any) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;