// src/interfaces/services/auth-service.interface.ts
import { UserEntity } from '../../domain/entities/user.entity';

export interface AuthResponse {
    user: Partial<UserEntity>;
    token: string;
}

export interface AuthServiceInterface {
    register(userData: Partial<UserEntity>): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    verifyToken(token: string): Promise<UserEntity | null>;
}