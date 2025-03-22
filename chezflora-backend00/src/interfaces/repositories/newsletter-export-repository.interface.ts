// src/interfaces/repositories/newsletter-export-repository.interface.ts
import { NewsletterExportDto } from '../../application/dtos/promotion/newsletter-export.dto';

export interface NewsletterExportRepositoryInterface {
    exportSubscribers(options: NewsletterExportDto): Promise<{ fileUrl: string, fileName: string }>;
    getSubscribersCount(activeOnly?: boolean): Promise<number>;
}