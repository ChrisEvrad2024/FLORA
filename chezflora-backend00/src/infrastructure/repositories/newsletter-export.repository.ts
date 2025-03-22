// src/infrastructure/repositories/newsletter-export.repository.ts
import { NewsletterExportRepositoryInterface } from '../../interfaces/repositories/newsletter-export-repository.interface';
import { NewsletterExportDto } from '../../application/dtos/promotion/newsletter-export.dto';
import NewsletterSubscription from '../database/models/newsletter-subscription.model';
import User from '../database/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';

export class NewsletterExportRepository implements NewsletterExportRepositoryInterface {
    async exportSubscribers(options: NewsletterExportDto): Promise<{ fileUrl: string, fileName: string }> {
        try {
            // Récupérer les abonnés
            const where: any = {};
            if (options.activeOnly) {
                where.active = true;
                where.confirmedAt = { [Op.not]: null };
            }

            const subscribers = await NewsletterSubscription.findAll({
                where,
                include: [{
                    model: User,
                    required: false,
                    attributes: ['firstName', 'lastName']
                }],
                order: [['email', 'ASC']]
            });

            const data = subscribers.map(subscriber => ({
                email: subscriber.email,
                firstName: subscriber.user?.firstName || '',
                lastName: subscriber.user?.lastName || '',
                active: subscriber.active,
                confirmedAt: subscriber.confirmedAt ? subscriber.confirmedAt.toISOString() : '',
                subscriptionDate: subscriber.createdAt.toISOString()
            }));

            // Créer le dossier d'export s'il n'existe pas
            const exportDir = path.join(process.cwd(), 'public', 'exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            // Générer un nom de fichier unique
            const timestamp = new Date().toISOString().replace(/[-:\.T]/g, '').substring(0, 14);
            const fileName = `newsletter_subscribers_${timestamp}.${options.format}`;
            const filePath = path.join(exportDir, fileName);

            // Exporter au format demandé
            let url;
            switch (options.format) {
                case 'csv':
                    await this.exportToCsv(data, filePath);
                    url = `/exports/${fileName}`;
                    break;
                case 'excel':
                    await this.exportToExcel(data, filePath);
                    url = `/exports/${fileName}`;
                    break;
                case 'json':
                    await this.exportToJson(data, filePath);
                    url = `/exports/${fileName}`;
                    break;
                default:
                    throw new Error('Unsupported export format');
            }

            return {
                fileUrl: url,
                fileName
            };
        } catch (error) {
            console.error('Error exporting newsletter subscribers:', error);
            throw error;
        }
    }

    async getSubscribersCount(activeOnly?: boolean): Promise<number> {
        try {
            const where: any = {};
            if (activeOnly) {
                where.active = true;
                where.confirmedAt = { [Op.not]: null };
            }

            return await NewsletterSubscription.count({ where });
        } catch (error) {
            console.error('Error counting newsletter subscribers:', error);
            throw error;
        }
    }

    private async exportToCsv(data: any[], filePath: string): Promise<void> {
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'email', title: 'Email' },
                { id: 'firstName', title: 'First Name' },
                { id: 'lastName', title: 'Last Name' },
                { id: 'active', title: 'Active' },
                { id: 'confirmedAt', title: 'Confirmed At' },
                { id: 'subscriptionDate', title: 'Subscription Date' }
            ]
        });

        await csvWriter.writeRecords(data);
    }

    private async exportToExcel(data: any[], filePath: string): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Newsletter Subscribers');

        worksheet.columns = [
            { header: 'Email', key: 'email', width: 30 },
            { header: 'First Name', key: 'firstName', width: 20 },
            { header: 'Last Name', key: 'lastName', width: 20 },
            { header: 'Active', key: 'active', width: 10 },
            { header: 'Confirmed At', key: 'confirmedAt', width: 25 },
            { header: 'Subscription Date', key: 'subscriptionDate', width: 25 }
        ];

        worksheet.addRows(data);

        await workbook.xlsx.writeFile(filePath);
    }

    private async exportToJson(data: any[], filePath: string): Promise<void> {
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    }
}