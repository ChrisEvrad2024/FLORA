// src/services/category.service.ts
import api from './api.service';

export const CategoryService = {
    getAllCategories: async (options = {}) => {
        return await api.get('/categories', { params: options });
    },

    getCategoryById: async (id: string) => {
        return await api.get(`/categories/${id}`);
    },

    createCategory: async (categoryData: any) => {
        return await api.post('/categories', categoryData);
    },

    updateCategory: async (id: string, categoryData: any) => {
        return await api.put(`/categories/${id}`, categoryData);
    },

    deleteCategory: async (id: string) => {
        return await api.delete(`/categories/${id}`);
    },

    getCategoryHierarchy: async () => {
        return await api.get('/categories/hierarchy');
    }
};