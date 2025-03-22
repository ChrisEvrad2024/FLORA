// src/infrastructure/config/logger.ts
import winston from 'winston';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Créer le dossier logs s'il n'existe pas
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logLevel = process.env.LOG_LEVEL || 'info';

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
    })
);

// Configuration du logger
const logger = winston.createLogger({
    level: logLevel,
    format: customFormat,
    defaultMeta: { service: 'chezflora-api' },
    transports: [
        // Logs d'erreur dans un fichier
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
        // Tous les logs dans un autre fichier
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log')
        }),
    ],
    exitOnError: false
});

// En développement, log également dans la console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            customFormat
        ),
    }));
}

// Wrapper pour ajouter des infos contextuelles aux logs
export class LoggerContext {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    debug(message: string, meta?: Record<string, any>): void {
        logger.debug(`[${this.context}] ${message}`, meta);
    }

    info(message: string, meta?: Record<string, any>): void {
        logger.info(`[${this.context}] ${message}`, meta);
    }

    warn(message: string, meta?: Record<string, any>): void {
        logger.warn(`[${this.context}] ${message}`, meta);
    }

    error(message: string, meta?: Record<string, any>): void {
        logger.error(`[${this.context}] ${message}`, meta);
    }
}

// Middleware Express pour logger les requêtes
export const requestLogger = (req: any, res: any, next: any) => {
    const start = Date.now();

    // Fonction pour logger quand la réponse est terminée
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

        const meta = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            duration: `${duration}ms`,
        };

        if (res.statusCode >= 400) {
            logger.error(message, meta);
        } else {
            logger.info(message, meta);
        }
    });

    next();
};

export default logger;