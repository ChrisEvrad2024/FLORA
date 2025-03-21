// src/application/dtos/quote/update-quote.dto.ts
export interface UpdateQuoteDto {
    status?: 'processing' | 'sent' | 'accepted' | 'rejected';
    totalAmount?: number;
    adminComment?: string;
    validUntil?: Date;
    items?: QuoteItemDto[];
}