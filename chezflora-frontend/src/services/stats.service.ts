// src/services/stats.service.ts
import apiService from './api';

interface SalesStats {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    monthlyData: Array<{
        month: string;
        sales: number;
        orders: number;
    }>;
    topProducts: Array<{
        id: string;
        name: string;
        sales: number;
        revenue: number;
    }>;
    salesByCategory: Array<{
        category: string;
        sales: number;
        percentage: number;
    }>;
}

interface CustomerStats {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerAcquisition: Array<{
        source: string;
        count: number;
        percentage: number;
    }>;
}

interface DashboardStats {
    sales: {
        today: number;
        yesterday: number;
        thisWeek: number;
        thisMonth: number;
        changePercentage: number;
    };
    orders: {
        today: number;
        pending: number;
        processing: number;
        completed: number;
        cancelled: number;
    };
    customers: {
        total: number;
        new: number;
        active: number;
    };
    products: {
        total: number;
        lowStock: number;
        outOfStock: number;
    };
}

class StatsService {
    // Admin statistics endpoints
    async getDashboardStats(): Promise<DashboardStats> {
        return apiService.get<{ success: boolean; data: DashboardStats }>('/stats/dashboard')
            .then(response => response.data);
    }

    async getSalesStats(period: 'week' | 'month' | 'year' = 'month'): Promise<SalesStats> {
        return apiService.get<{ success: boolean; data: SalesStats }>('/stats/sales', {
            params: { period }
        }).then(response => response.data);
    }

    async getCustomerStats(period: 'month' | 'year' = 'month'): Promise<CustomerStats> {
        return apiService.get<{ success: boolean; data: CustomerStats }>('/stats/customers', {
            params: { period }
        }).then(response => response.data);
    }

    async getProductViewStats(productId: string, period: 'week' | 'month' = 'week'): Promise<any> {
        return apiService.get(`/stats/products/${productId}/views`, {
            params: { period }
        }).then(response => response.data);
    }

    async getBlogViewStats(postId?: number, period: 'week' | 'month' = 'week'): Promise<any> {
        const url = postId
            ? `/stats/blog/${postId}/views`
            : '/stats/blog/views';

        return apiService.get(url, {
            params: { period }
        }).then(response => response.data);
    }
}

export const statsService = new StatsService();
export default statsService;