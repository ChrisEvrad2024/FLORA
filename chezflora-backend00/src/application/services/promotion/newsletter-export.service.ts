// src/application/services/promotion/newsletter-export.service.ts
import { NewsletterExportServiceInterface } from '../../../interfaces/services/newsletter-export-service.interface';
import { NewsletterExportRepositoryInterface } from '../../../interfaces/repositories/newsletter-export-repository.interface';
import { NewsletterExportDto } from '../../dtos/promotion/newsletter-export.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class NewsletterExportService implements NewsletterExportServiceInterface {
    constructor(private newsletterExportRepository: NewsletterExportRepositoryInterface) {}

    async exportSubscribers(options: NewsletterExportDto): Promise<{ fileUrl: string, fileName: string }> {
        // Vérifier le format demandé
        if (!options.format || !['csv', 'excel', 'json'].includes(options.format)) {
            throw new AppError('Invalid export format. Must be csv, excel or json', 400);
        }
        
        // Vérifier si des abonnés existent
        const subscribersCount = await this.getSubscribersCount(options.activeOnly);
        
        if (subscribersCount === 0) {
            throw new AppError('No subscribers to export', 404);
        }
        
        // Exporter les abonnés
        return this.newsletterExportRepository.exportSubscribers(options);
    }

    async getSubscribersCount(activeOnly?: boolean): Promise<number> {
        return this.newsletterExportRepository.getSubscribersCount(activeOnly);
    }
}