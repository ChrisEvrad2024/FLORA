// src/interfaces/services/newsletter-export-service.interface.ts
import { NewsletterExportDto } from '../../application/dtos/promotion/newsletter-export.dto';

export interface NewsletterExportServiceInterface {
    exportSubscribers(options: NewsletterExportDto): Promise<{ fileUrl: string, fileName: string }>;
    getSubscribersCount(activeOnly?: boolean): Promise<number>;
}