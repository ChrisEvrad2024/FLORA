// src/infrastructure/repositories/user.repository.ts
import { UserRepositoryInterface } from '../../interfaces/repositories/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

// Implémentation temporaire pour le démarrage
export class UserRepository implements UserRepositoryInterface {
    // Simulation d'une base de données en mémoire
    private users: UserEntity[] = [];

    async findById(id: string): Promise<UserEntity | null> {
        const user = this.users.find(user => user.id === id);
        return user || null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = this.users.find(user => user.email === email);
        return user || null;
    }

    async create(userData: Partial<UserEntity>): Promise<UserEntity> {
        console.log('Tentative de création utilisateur:', userData);
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            password: userData.password || '',
            phone: userData.phone || null,
            role: userData.role || 'client',
            status: userData.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: null
        } as UserEntity;
        console.log('Utilisateur créé avec succès:', newUser.id);
        this.users.push(newUser);
        return newUser;
    }

    async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null> {
        const index = this.users.findIndex(user => user.id === id);

        if (index === -1) {
            return null;
        }

        this.users[index] = {
            ...this.users[index],
            ...userData,
            updatedAt: new Date()
        };

        return this.users[index];
    }

    async delete(id: string): Promise<boolean> {
        const initialLength = this.users.length;
        this.users = this.users.filter(user => user.id !== id);
        return this.users.length < initialLength;
    }

    async findAll(): Promise<UserEntity[]> {
        return this.users;
    }
}