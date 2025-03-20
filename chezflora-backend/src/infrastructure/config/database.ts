// src/infrastructure/config/database.ts
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import User from '../database/models/user.model';
import logger from '../logger';

dotenv.config();

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chezflora',
    logging: (msg) => logger.debug(msg),
    models: [User], // Important : incluez le modèle User ici
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
            await sequelize.sync({ alter: true });
            logger.info('Database synchronized');
        }
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;