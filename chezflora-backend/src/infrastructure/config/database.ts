// src/infrastructure/config/database.ts
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import User from '../database/models/user.model';
import Product from '../database/models/product.model';
import Category from '../database/models/category.model';
import ProductImage from '../database/models/product-image.model';
import logger from '../logger';

dotenv.config();

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chezflora',
    logging: (msg) => logger.debug(msg),
    models: [User, Product, Category, ProductImage], // Ajout des nouveaux modèles
    define: {
        timestamps: true,
        underscored: true,
    },
});

export const initDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to database has been established successfully.');

        // Pas de synchronisation automatique pour conserver les données
        // Si vous avez des modifications de schéma, utilisez les migrations
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;