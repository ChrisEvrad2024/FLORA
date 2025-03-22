// src/services/favorite.service.ts
import api from './api.service';

export const FavoriteService = {
    getUserFavorites: async (page = 1, limit = 10) => {
        return await api.get('/favorites', { params: { page, limit } });
    },

    checkIfFavorite: async (productId: string) => {
        return await api.get(`/favorites/${productId}`);
    },

    addToFavorite: async (productId: string) => {
        return await api.post('/favorites', { productId });
    },

    removeFromFavorite: async (productId: string) => {
        return await api.delete(`/favorites/${productId}`);
    }
};