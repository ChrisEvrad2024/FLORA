// src/infrastructure/http/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthServiceInterface } from '../../../interfaces/services/auth-service.interface';

// Modifiez cette importation pour utiliser le chemin correct
import { validateRegisterInput, validateLoginInput } from '../middlewares/validation/auth-validator';

export class AuthController {
    constructor(private authService: AuthServiceInterface) { }

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validation des données
            const errors = validateRegisterInput(req.body);
            if (errors.length > 0) {
                res.status(400).json({ success: false, errors });
                return;
            }

            const authData = await this.authService.register(req.body);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: authData
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validation des données
            const errors = validateLoginInput(req.body);
            if (errors.length > 0) {
                res.status(400).json({ success: false, errors });
                return;
            }

            const { email, password } = req.body;
            const authData = await this.authService.login(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: authData
            });
        } catch (error) {
            next(error);
        }
    };
}