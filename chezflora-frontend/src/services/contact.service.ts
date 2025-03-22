// src/services/contact.service.ts
import apiService from './api';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    createdAt: string;
    updatedAt: string;
}

interface ContactMessageResponse {
    success: boolean;
    message: string;
    data: ContactMessage;
}

interface ContactMessagesResponse {
    success: boolean;
    message: string;
    data: {
        messages: ContactMessage[];
        totalCount: number;
        totalPages: number;
    }
}

interface ContactParams {
    page?: number;
    limit?: number;
    status?: 'new' | 'read' | 'replied';
    search?: string;
}

class ContactService {
    // Send a contact message
    async sendMessage(contactData: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<ContactMessageResponse> {
        return apiService.post<ContactMessageResponse>('/contact', contactData);
    }

    // Admin methods
    async getMessages(params: ContactParams = {}): Promise<ContactMessagesResponse> {
        return apiService.get<ContactMessagesResponse>('/contact', { params });
    }

    async getMessage(id: string): Promise<ContactMessageResponse> {
        return apiService.get<ContactMessageResponse>(`/contact/${id}`);
    }

    async updateMessageStatus(id: string, status: 'read' | 'replied'): Promise<ContactMessageResponse> {
        return apiService.patch<ContactMessageResponse>(`/contact/${id}/status`, { status });
    }

    async deleteMessage(id: string): Promise<any> {
        return apiService.delete(`/contact/${id}`);
    }

    async replyToMessage(id: string, replyText: string): Promise<ContactMessageResponse> {
        return apiService.post<ContactMessageResponse>(`/contact/${id}/reply`, { replyText });
    }
}

export const contactService = new ContactService();
export default contactService;