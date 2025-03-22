// src/services/wishlist.service.ts
import apiService from './api';
import { Product } from '@/types/product';

interface WishlistItem {
    id: string;
    productId: string;
    product: Product;
}

interface WishlistResponse {
    success: boolean;
    message: string;
    data: WishlistItem[];
}

// For anonymous users who aren't logged in yet
const LOCAL_WISHLIST_KEY = 'wishlist';

class WishlistService {
    async getWishlist(): Promise<WishlistItem[]> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.get<WishlistResponse>('/favorites');
                return response.data;
            } catch (error) {
                console.error('Failed to get wishlist from server, falling back to local', error);
                return this.getLocalWishlist();
            }
        }
        return this.getLocalWishlist();
    }

    async addToWishlist(productId: string): Promise<WishlistItem[]> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.post<WishlistResponse>('/favorites', { productId });
                return response.data;
            } catch (error) {
                console.error('Failed to add to wishlist on server, adding locally', error);
                return this.addToLocalWishlist(productId);
            }
        }
        return this.addToLocalWishlist(productId);
    }

    async removeFromWishlist(productId: string): Promise<WishlistItem[]> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.delete<WishlistResponse>(`/favorites/${productId}`);
                return response.data;
            } catch (error) {
                console.error('Failed to remove from wishlist on server, removing locally', error);
                return this.removeFromLocalWishlist(productId);
            }
        }
        return this.removeFromLocalWishlist(productId);
    }

    async isInWishlist(productId: string): Promise<boolean> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.get<{ success: boolean; data: boolean }>(`/favorites/${productId}`);
                return response.data;
            } catch (error) {
                console.error('Failed to check wishlist status on server, checking locally', error);
                return this.isInLocalWishlist(productId);
            }
        }
        return this.isInLocalWishlist(productId);
    }

    // Helper methods for local wishlist
    private isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    private getLocalWishlist(): WishlistItem[] {
        try {
            const wishlistJson = localStorage.getItem(LOCAL_WISHLIST_KEY);
            return wishlistJson ? JSON.parse(wishlistJson) : [];
        } catch (error) {
            console.error('Error parsing local wishlist', error);
            return [];
        }
    }

    private saveLocalWishlist(wishlist: WishlistItem[]): void {
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist));
        // Trigger event for components to update
        window.dispatchEvent(new Event('wishlistUpdated'));
    }

    private addToLocalWishlist(productId: string): WishlistItem[] {
        const wishlist = this.getLocalWishlist();
        if (!wishlist.some(item => item.productId === productId)) {
            wishlist.push({
                id: `temp-${Date.now()}`,
                productId,
                product: {} as Product // Placeholder
            });
        }
        this.saveLocalWishlist(wishlist);
        return wishlist;
    }

    private removeFromLocalWishlist(productId: string): WishlistItem[] {
        const wishlist = this.getLocalWishlist().filter(item => item.productId !== productId);
        this.saveLocalWishlist(wishlist);
        return wishlist;
    }

    private isInLocalWishlist(productId: string): boolean {
        return this.getLocalWishlist().some(item => item.productId === productId);
    }
}

export const wishlistService = new WishlistService();
export default wishlistService;