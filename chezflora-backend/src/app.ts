// src/app.ts - Mise à jour pour ajouter les uploads
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

// Import des routes
import authRoutes from './infrastructure/http/routes/auth.routes';
import productRoutes from './infrastructure/http/routes/product.routes';
import categoryRoutes from './infrastructure/http/routes/category.routes';

// Import Middleware de gestion des erreurs
import { errorHandler } from './infrastructure/http/middlewares/error.middleware';
import { configureStaticFiles } from './infrastructure/http/middlewares/upload.middleware';

// Import de la fonction d'initialisation de la base de données
import { initDatabase } from './infrastructure/config/database';

class App {
    public app: Application;
    
    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    
    private async initializeMiddlewares(): Promise<void> {
        // Middleware de base
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Configuration des fichiers statiques
        configureStaticFiles(this.app);
        
        // Initialisation de la base de données
        await initDatabase();
        
        // Logging en développement
        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
        }
    }
    
    private initializeRoutes(): void {
        // Routes API
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/products', productRoutes);
        this.app.use('/api/categories', categoryRoutes);
        
        // Route de base
        this.app.get('/', (req, res) => {
            res.status(200).json({ message: 'ChezFlora API is running' });
        });
        
        // Route pour les ressources non trouvées
        this.app.use('*', (req, res) => {
            res.status(404).json({ success: false, message: 'Resource not found' });
        });
    }
    
    private initializeErrorHandling(): void {
        this.app.use(errorHandler);
    }
}

export default new App().app;