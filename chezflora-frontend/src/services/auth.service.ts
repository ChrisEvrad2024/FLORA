// src/services/auth.service.ts
import apiService from './api';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    }
  }
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', data);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
    }
    return response;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/register', data);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
    }
    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    // Additional cleanup
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  async updateProfile(data: Partial<Omit<RegisterData, 'password'>>): Promise<any> {
    return apiService.put('/auth/profile', data);
  }

  async requestPasswordReset(email: string): Promise<any> {
    return apiService.post('/auth/request-password-reset', { email });
  }

  async resetPassword(token: string, password: string): Promise<any> {
    return apiService.post('/auth/reset-password', { token, password });
  }
}

export const authService = new AuthService();
export default authService;