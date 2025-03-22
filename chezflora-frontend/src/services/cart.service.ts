// src/services/cart.service.ts
import apiService from './api';
import { Product } from '@/types/product';

interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product: Product;
}

interface CartResponse {
    success: boolean;
    message: string;
    data: {
        items: CartItem[];
        totalAmount: number;
        totalItems: number;
    }
}

interface AddToCartData {
    productId: string;
    quantity: number;
}

// For anonymous users who aren't logged in yet
const LOCAL_CART_KEY = 'cart';

class CartService {
    // Get cart - try server first, fall back to local if not authenticated
    async getCart(): Promise<CartResponse['data']> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.get<CartResponse>('/cart');
                return response.data;
            } catch (error) {
                console.error('Failed to get cart from server, falling back to local', error);
                return this.getLocalCart();
            }
        }
        return this.getLocalCart();
    }

    // Add to cart
    async addToCart(productId: string, quantity: number): Promise<CartResponse['data']> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.post<CartResponse>('/cart/items', { productId, quantity });
                return response.data;
            } catch (error) {
                console.error('Failed to add to cart on server, adding locally', error);
                return this.addToLocalCart(productId, quantity);
            }
        }
        return this.addToLocalCart(productId, quantity);
    }

    // Update cart item
    async updateCartItem(itemId: string, quantity: number): Promise<CartResponse['data']> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.put<CartResponse>(`/cart/items/${itemId}`, { quantity });
                return response.data;
            } catch (error) {
                console.error('Failed to update cart item on server, updating locally', error);
                return this.updateLocalCartItem(itemId, quantity);
            }
        }
        return this.updateLocalCartItem(itemId, quantity);
    }

    // Remove from cart
    async removeFromCart(itemId: string): Promise<CartResponse['data']> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.delete<CartResponse>(`/cart/items/${itemId}`);
                return response.data;
            } catch (error) {
                console.error('Failed to remove from cart on server, removing locally', error);
                return this.removeFromLocalCart(itemId);
            }
        }
        return this.removeFromLocalCart(itemId);
    }

    // Clear cart
    async clearCart(): Promise<CartResponse['data']> {
        if (this.isAuthenticated()) {
            try {
                const response = await apiService.delete<CartResponse>('/cart');
                return response.data;
            } catch (error) {
                console.error('Failed to clear cart on server, clearing locally', error);
                this.clearLocalCart();
                return { items: [], totalAmount: 0, totalItems: 0 };
            }
        }
        this.clearLocalCart();
        return { items: [], totalAmount: 0, totalItems: 0 };
    }

    // Helper methods for local cart
    private isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    private getLocalCart(): CartResponse['data'] {
        try {
            const cartJson = localStorage.getItem(LOCAL_CART_KEY);
            return cartJson ? JSON.parse(cartJson) : { items: [], totalAmount: 0, totalItems: 0 };
        } catch (error) {
            console.error('Error parsing local cart', error);
            return { items: [], totalAmount: 0, totalItems: 0 };
        }
    }

    private saveLocalCart(cart: CartResponse['data']): void {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
        // Trigger event for components to update
        window.dispatchEvent(new Event('cartUpdated'));
    }

    private addToLocalCart(productId: string, quantity: number): CartResponse['data'] {
        const cart = this.getLocalCart();
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Note: This is simplified, in reality you would need to fetch the product
            // details to add to the cart
            cart.items.push({
                id: `temp-${Date.now()}`,
                productId,
                quantity,
                product: {} as Product // Placeholder
            });
        }

        this.saveLocalCart(cart);
        return cart;
    }

    private updateLocalCartItem(itemId: string, quantity: number): CartResponse['data'] {
        const cart = this.getLocalCart();
        const itemIndex = cart.items.findIndex(item => item.id === itemId);

        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity = quantity;
        }

        this.saveLocalCart(cart);
        return cart;
    }

    private removeFromLocalCart(itemId: string): CartResponse['data'] {
        const cart = this.getLocalCart();
        cart.items = cart.items.filter(item => item.id !== itemId);

        this.saveLocalCart(cart);
        return cart;
    }

    private clearLocalCart(): void {
        localStorage.removeItem(LOCAL_CART_KEY);
        window.dispatchEvent(new Event('cartUpdated'));
    }
}

export const cartService = new CartService();
export default cartService;