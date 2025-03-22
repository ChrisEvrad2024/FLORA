// src/services/user.service.ts
import apiService from './api';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface UserResponse {
    success: boolean;
    message: string;
    data: User;
}

interface UsersResponse {
    success: boolean;
    message: string;
    data: {
        users: User[];
        totalCount: number;
        totalPages: number;
    }
}

interface UserParams {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
}

class UserService {
    // Get current user profile
    async getProfile(): Promise<UserResponse> {
        return apiService.get<UserResponse>('/users/me');
    }

    // Update current user profile
    async updateProfile(userData: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<UserResponse> {
        return apiService.put<UserResponse>('/users/me', userData);
    }

    // Admin methods
    async getUsers(params: UserParams = {}): Promise<UsersResponse> {
        return apiService.get<UsersResponse>('/users', { params });
    }

    async getUserById(id: string): Promise<UserResponse> {
        return apiService.get<UserResponse>(`/users/${id}`);
    }

    async createUser(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role: string;
    }): Promise<UserResponse> {
        return apiService.post<UserResponse>('/users', userData);
    }

    async updateUser(id: string, userData: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        role?: string;
        isActive?: boolean;
    }): Promise<UserResponse> {
        return apiService.put<UserResponse>(`/users/${id}`, userData);
    }

    async resetUserPassword(id: string): Promise<any> {
        return apiService.post(`/users/${id}/reset-password`);
    }

    async deleteUser(id: string): Promise<any> {
        return apiService.delete(`/users/${id}`);
    }

    async toggleUserStatus(id: string, isActive: boolean): Promise<UserResponse> {
        return apiService.patch<UserResponse>(`/users/${id}/status`, { isActive });
    }
}

export const userService = new UserService();
export default userService;