// src/services/address.service.ts
import apiService from './api';

interface Address {
    id: string;
    firstName: string;
    lastName: string;
    street: string;
    zipCode: string;
    city: string;
    country: string;
    phone?: string;
    isDefault: boolean;
}

interface AddressesResponse {
    success: boolean;
    message: string;
    data: Address[];
}

interface AddressResponse {
    success: boolean;
    message: string;
    data: Address;
}

class AddressService {
    // Get all user addresses
    async getUserAddresses(): Promise<AddressesResponse> {
        return apiService.get<AddressesResponse>('/addresses');
    }

    // Get address by ID
    async getAddressById(id: string): Promise<AddressResponse> {
        return apiService.get<AddressResponse>(`/addresses/${id}`);
    }

    // Get default address
    async getDefaultAddress(): Promise<AddressResponse> {
        return apiService.get<AddressResponse>('/addresses/default');
    }

    // Create new address
    async createAddress(addressData: Omit<Address, 'id'>): Promise<AddressResponse> {
        return apiService.post<AddressResponse>('/addresses', addressData);
    }

    // Update address
    async updateAddress(id: string, addressData: Partial<Omit<Address, 'id'>>): Promise<AddressResponse> {
        return apiService.put<AddressResponse>(`/addresses/${id}`, addressData);
    }

    // Delete address
    async deleteAddress(id: string): Promise<any> {
        return apiService.delete(`/addresses/${id}`);
    }

    // Set address as default
    async setDefaultAddress(id: string): Promise<any> {
        return apiService.patch(`/addresses/${id}/default`);
    }
}

export const addressService = new AddressService();
export default addressService;