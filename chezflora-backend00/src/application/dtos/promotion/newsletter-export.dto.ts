// src/application/dtos/promotion/newsletter-export.dto.ts
export interface NewsletterExportDto {
    format: 'csv' | 'excel' | 'json';
    activeOnly?: boolean; // Si true, exporte uniquement les abonnements actifs et confirmés
}