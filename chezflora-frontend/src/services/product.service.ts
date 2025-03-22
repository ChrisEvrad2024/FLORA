// src/services/product.service.ts
import apiService from './api';
import { Product } from '@/types/product';

interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
        totalCount: number;
        totalPages: number;
    }
}

interface ProductResponse {
    success: boolean;
    message: string;
    data: Product;
}

interface ProductParams {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
}

class ProductService {
    async getProducts(params: ProductParams = {}): Promise<ProductsResponse> {
        return apiService.get<ProductsResponse>('/products', { params });
    }

    async getProductById(id: string): Promise<ProductResponse> {
        return apiService.get<ProductResponse>(`/products/${id}`);
    }

    async getPopularProducts(): Promise<ProductsResponse> {
        return apiService.get<ProductsResponse>('/products', {
            params: { popular: true, limit: 4 }
        });
    }

    async getFeaturedProducts(): Promise<ProductsResponse> {
        return apiService.get<ProductsResponse>('/products', {
            params: { featured: true, limit: 4 }
        });
    }

    async getProductsByCategory(categoryId: string): Promise<ProductsResponse> {
        return apiService.get<ProductsResponse>('/products', {
            params: { category: categoryId }
        });
    }

    // Admin methods
    async createProduct(productData: FormData): Promise<ProductResponse> {
        return apiService.post<ProductResponse>('/products', productData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async updateProduct(id: string, productData: FormData): Promise<ProductResponse> {
        return apiService.put<ProductResponse>(`/products/${id}`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async deleteProduct(id: string): Promise<any> {
        return apiService.delete(`/products/${id}`);
    }
}

export const productService = new ProductService();
export default productService;