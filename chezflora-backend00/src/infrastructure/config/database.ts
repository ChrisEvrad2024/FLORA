// src/infrastructure/config/database.ts
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import logger from '../logger';

// Import des modèles de base (sans dépendances complexes d'abord)
import User from '../database/models/user.model';
import Address from '../database/models/address.model';
import Category from '../database/models/category.model';
import Product from '../database/models/product.model';
import NewsletterSubscription from '../database/models/newsletter-subscription.model';
import BlogCategory from '../database/models/blog-category.model';
import BlogTag from '../database/models/blog-tag.model';

// Import des modèles avec dépendances simples
import BlogPost from '../database/models/blog-post.model';
import Cart from '../database/models/cart.model';
import Order from '../database/models/order.model';
import Quote from '../database/models/quote.model';
import Invoice from '../database/models/invoice.model';
import Favorite from '../database/models/favorite.model';

// Import des modèles avec dépendances complexes
import BlogComment from '../database/models/blog-comment.model';
import CartItem from '../database/models/cart-item.model';
import OrderItem from '../database/models/order-item.model';
import QuoteItem from '../database/models/quote-item.model';
import BlogPostTag from '../database/models/blog-post-tag.model';

dotenv.config();

// Liste de tous les modèles (dans l'ordre optimisé pour éviter les problèmes de dépendances)
const models = [
    // Modèles sans dépendances
    User,
    Address,
    Category,
    Product,
    NewsletterSubscription,
    BlogCategory,
    BlogTag,

    // Modèles avec dépendances simples
    BlogPost,
    Cart,
    Order,
    Quote,
    Invoice,
    Favorite,

    // Modèles avec dépendances complexes
    BlogComment,
    CartItem,
    OrderItem,
    QuoteItem,
    BlogPostTag
];

export const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chezflora',
    logging: (msg) => logger.debug(msg),
    models: models,
    define: {
        timestamps: true,
        underscored: true,
    },
});

// Vérifier si la base de données doit être initialisée
const checkDbInitialization = async (): Promise<boolean> => {
    try {
        // Vérifier si le fichier d'état existe
        const dbStateFilePath = path.join(__dirname, '../../../db-initialized.json');

        if (fs.existsSync(dbStateFilePath)) {
            // Le fichier existe, vérifier si l'initialisation est nécessaire
            const dbState = JSON.parse(fs.readFileSync(dbStateFilePath, 'utf8'));
            return !dbState.initialized;
        }

        return true; // Le fichier n'existe pas, initialisation nécessaire
    } catch (error) {
        logger.error('Error checking database initialization state:', error);
        return true; // En cas d'erreur, initialiser par sécurité
    }
};

// Marquer la base de données comme initialisée
const markDbAsInitialized = async (): Promise<void> => {
    try {
        const dbStateFilePath = path.join(__dirname, '../../../db-initialized.json');
        fs.writeFileSync(dbStateFilePath, JSON.stringify({ initialized: true, date: new Date() }));
        logger.info('Database marked as initialized');
    } catch (error) {
        logger.error('Error marking database as initialized:', error);
    }
};

export const initDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to database has been established successfully.');

        // Vérifier si l'initialisation est nécessaire
        const shouldInitialize = await checkDbInitialization();

        if (process.env.NODE_ENV === 'development' && shouldInitialize) {
            logger.info('Initializing database...');

            const shouldForce = process.env.DB_FORCE_SYNC === 'true';

            // Désactiver les vérifications de clés étrangères
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

            try {
                // Synchroniser les modèles
                if (shouldForce) {
                    // En cas de force sync, on supprime et recrée tout
                    await sequelize.sync({ force: true });
                } else {
                    // Sinon, on modifie les tables existantes en ignorant les erreurs de contraintes
                    // Cette option "alter: true" peut avoir des comportements inattendus selon les cas
                    // C'est pourquoi nous gérons les erreurs explicitement
                    await sequelize.sync({ alter: true }).catch(async (syncError) => {
                        logger.warn('Error during alter sync:', syncError.message);

                        // Si l'erreur concerne une contrainte de clé étrangère spécifique
                        if (syncError.message.includes("Can't DROP FOREIGN KEY")) {
                            const tableMatch = syncError.message.match(/`(\w+)`/g);
                            const constraintMatch = syncError.message.match(/`(\w+_ibfk_\d+)`/);

                            if (tableMatch && tableMatch.length >= 1) {
                                const tableName = tableMatch[0].replace(/`/g, '');
                                logger.info(`Problem with table: ${tableName}`);

                                // Récupérer toutes les contraintes existantes
                                const [constraints] = await sequelize.query(
                                    `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
                                     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
                                    {
                                        replacements: [
                                            process.env.DB_NAME || 'chezflora',
                                            tableName
                                        ]
                                    }
                                );

                                logger.info(`Found ${(constraints as any[]).length} foreign key constraints on ${tableName}`);

                                // Supprimer chaque contrainte trouvée
                                for (const constraint of constraints as any[]) {
                                    const constraintName = constraint.CONSTRAINT_NAME;
                                    logger.info(`Dropping foreign key constraint: ${constraintName}`);
                                    await sequelize.query(`ALTER TABLE ${tableName} DROP FOREIGN KEY \`${constraintName}\``);
                                }

                                // Essayer à nouveau de synchroniser cette table spécifique
                                await sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);

                                // Continuer avec la synchronisation des modèles
                                await sequelize.sync({ alter: true });
                            }
                        }
                    });
                }
            } catch (finalError) {
                logger.error('Final sync error:', finalError);
            } finally {
                // Réactiver les vérifications de clés étrangères
                await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            }

            // Marquer la base de données comme initialisée
            await markDbAsInitialized();

            logger.info(`Database synchronized (force: ${shouldForce})`);
        } else {
            logger.info('Database already initialized, skipping synchronization');
        }
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;