// src/services/order.service.ts
import apiService from './api';

interface Order {
    id: string;
    status: string;
    total: number;
    items: Array<{
        id: string;
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    shippingAddress: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        zipCode: string;
        country: string;
        phone?: string;
    };
    createdAt: string;
}

interface OrdersResponse {
    success: boolean;
    message: string;
    data: {
        orders: Order[];
        totalCount: number;
    }
}

interface OrderResponse {
    success: boolean;
    message: string;
    data: Order;
}

interface OrderParams {
    page?: number;
    limit?: number;
    status?: string;
}

class OrderService {
    // Get user orders
    async getUserOrders(params: OrderParams = {}): Promise<OrdersResponse> {
        return apiService.get<OrdersResponse>('/orders/me', { params });
    }

    // Get order details
    async getOrderById(id: string): Promise<OrderResponse> {
        return apiService.get<OrderResponse>(`/orders/${id}`);
    }

    // Create new order
    async createOrder(orderData: {
        items: Array<{ productId: string; quantity: number }>;
        shippingAddressId: string;
        paymentMethod: string;
        couponCode?: string;
    }): Promise<OrderResponse> {
        return apiService.post<OrderResponse>('/orders', orderData);
    }

    // Cancel order
    async cancelOrder(id: string): Promise<any> {
        return apiService.post(`/orders/${id}/cancel`);
    }

    // Admin methods
    async getAllOrders(params: OrderParams = {}): Promise<OrdersResponse> {
        return apiService.get<OrdersResponse>('/orders', { params });
    }

    async updateOrderStatus(id: string, status: string): Promise<OrderResponse> {
        return apiService.patch<OrderResponse>(`/orders/${id}/status`, { status });
    }
}

export const orderService = new OrderService();
export default orderService;