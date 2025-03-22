// src/infrastructure/config/mail.ts
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import logger from './logger';

dotenv.config();

// Configuration à partir des variables d'environnement
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'user@example.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your-password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@chezflora.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'ChezFlora';

// Dossier des templates d'emails
const TEMPLATE_DIR = path.join(__dirname, '../../templates/emails');

// Créer un transporteur
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true pour 465, false pour les autres ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    tls: {
        // Ne pas échouer si le certificat n'est pas valide
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
});

// Vérifier la connexion SMTP en mode développement
if (process.env.NODE_ENV === 'development') {
    transporter.verify()
        .then(() => logger.info('SMTP connection established successfully'))
        .catch(err => logger.error(`SMTP connection failed: ${err.message}`));
}

// Fonction pour compiler un template Handlebars
const compileTemplate = (templateName: string, data: Record<string, any>): string => {
    try {
        const templatePath = path.join(TEMPLATE_DIR, `${templateName}.hbs`);
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateSource);
        return template(data);
    } catch (err) {
        logger.error(`Error compiling email template "${templateName}": ${err instanceof Error ? err.message : 'Unknown error'}`);
        throw err;
    }
};

// Interface pour les options d'email
interface EmailOptions {
    to: string | string[];
    subject: string;
    template?: string;
    context?: Record<string, any>;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: Buffer;
        contentType?: string;
    }>;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
}

// Service d'envoi d'emails
export class MailService {
    // Envoyer un email
    public static async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            let htmlContent = options.html || '';
            let textContent = options.text || '';

            // Si un template est spécifié, le compiler
            if (options.template && options.context) {
                htmlContent = compileTemplate(options.template, options.context);
            }

            const mailOptions = {
                from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
                to: options.to,
                cc: options.cc,
                bcc: options.bcc,
                replyTo: options.replyTo,
                subject: options.subject,
                html: htmlContent,
                text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Convertir HTML en texte brut si nécessaire
                attachments: options.attachments,
            };

            const info = await transporter.sendMail(mailOptions);
            logger.info(`Email sent: ${info.messageId}`, { to: options.to, subject: options.subject });
            return true;
        } catch (err) {
            logger.error(`Error sending email: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return false;
        }
    }

    // Envoyer un email de bienvenue
    public static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
        return this.sendEmail({
            to: email,
            subject: 'Bienvenue chez ChezFlora !',
            template: 'welcome',
            context: {
                firstName,
                currentYear: new Date().getFullYear(),
                websiteUrl: process.env.WEBSITE_URL || 'https://chezflora.com',
            }
        });
    }

    // Envoyer un email de confirmation d'inscription à la newsletter
    public static async sendNewsletterConfirmation(email: string, token: string): Promise<boolean> {
        const confirmationUrl = `${process.env.WEBSITE_URL || 'https://chezflora.com'}/newsletter/confirm/${token}`;

        return this.sendEmail({
            to: email,
            subject: 'Confirmez votre inscription à notre newsletter',
            template: 'newsletter-confirmation',
            context: {
                confirmationUrl,
                currentYear: new Date().getFullYear(),
            }
        });
    }

    // Envoyer un email de confirmation de commande
    public static async sendOrderConfirmation(email: string, order: any): Promise<boolean> {
        return this.sendEmail({
            to: email,
            subject: `Confirmation de votre commande #${order.id}`,
            template: 'order-confirmation',
            context: {
                order,
                currentYear: new Date().getFullYear(),
                websiteUrl: process.env.WEBSITE_URL || 'https://chezflora.com',
            }
        });
    }

    // Envoyer un email de réinitialisation de mot de passe
    public static async sendPasswordReset(email: string, token: string): Promise<boolean> {
        const resetUrl = `${process.env.WEBSITE_URL || 'https://chezflora.com'}/auth/reset-password/${token}`;

        return this.sendEmail({
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            template: 'password-reset',
            context: {
                resetUrl,
                currentYear: new Date().getFullYear(),
            }
        });
    }

    // Envoyer un email de contact
    public static async sendContactEmail(from: string, name: string, subject: string, message: string): Promise<boolean> {
        return this.sendEmail({
            to: process.env.CONTACT_EMAIL || 'contact@chezflora.com',
            subject: `Nouveau message de contact: ${subject}`,
            template: 'contact',
            context: {
                from,
                name,
                subject,
                message,
                currentYear: new Date().getFullYear(),
            },
            replyTo: from
        });
    }
}

export default MailService;