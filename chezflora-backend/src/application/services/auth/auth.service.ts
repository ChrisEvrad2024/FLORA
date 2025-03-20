// src/application/services/auth/auth.service.ts
import { UserRepositoryInterface } from '../../../interfaces/repositories/user-repository.interface';
import { AuthServiceInterface, AuthResponse } from '../../../interfaces/services/auth-service.interface';
import { UserEntity } from '../../../domain/entities/user.entity';
import jwt from 'jsonwebtoken';

export class AuthService implements AuthServiceInterface {
    constructor(
        private userRepository: UserRepositoryInterface
    ) { }

    async register(userData: Partial<UserEntity>): Promise<AuthResponse> {
        // Vérifier si l'email existe déjà
        const existingUser = await this.userRepository.findByEmail(userData.email as string);
        if (existingUser) {
            throw new Error('Email already in use');
        }

        // Créer l'utilisateur
        const user = await this.userRepository.create({
            ...userData,
            role: 'client',
            status: 'active',
        });

        // Générer le token
        const token = this.generateToken(user);

        // Retourner les données sans le mot de passe
        const { password, ...userWithoutPassword } = user as any;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        // Trouver l'utilisateur par email
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Vérifier le mot de passe (implémentation simplifiée)
        // Dans un cas réel, vous utiliseriez bcrypt.compare
        if (user.password !== password) {
            throw new Error('Invalid email or password');
        }

        // Mettre à jour la date de dernière connexion
        await this.userRepository.update(user.id, { lastLogin: new Date() });

        // Générer le token
        const token = this.generateToken(user);

        // Retourner les données sans le mot de passe
        const { password: pwd, ...userWithoutPassword } = user as any;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async verifyToken(token: string): Promise<UserEntity | null> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
            return this.userRepository.findById(decoded.id);
        } catch (error) {
            return null;
        }
    }

    private generateToken(user: UserEntity): string {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
    }
}