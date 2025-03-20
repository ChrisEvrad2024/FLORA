// src/infrastructure/http/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

// Corrigez cette importation
import { AuthService } from '../../../application/services/auth/auth.service';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';

const router = Router();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;