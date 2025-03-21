// src/infrastructure/utils/csv-writer.ts
import fs from 'fs';
import path from 'path';

interface Header {
    id: string;
    title: string;
}

interface CsvWriterOptions {
    path: string;
    header: Header[];
}

class CsvWriter {
    private path: string;
    private header: Header[];
    
    constructor(options: CsvWriterOptions) {
        this.path = options.path;
        this.header = options.header;
    }
    
    async writeRecords(records: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Ensure directory exists
                const dir = path.dirname(this.path);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                // Create write stream
                const writeStream = fs.createWriteStream(this.path);
                
                // Write header
                const headerRow = this.header.map(h => h.title).join(',') + '\n';
                writeStream.write(headerRow);
                
                // Write records
                records.forEach(record => {
                    const row = this.header
                        .map(h => {
                            const value = record[h.id];
                            // Handle string values with commas by wrapping in quotes
                            if (typeof value === 'string' && value.includes(',')) {
                                return `"${value}"`;
                            }
                            return value === undefined || value === null ? '' : value;
                        })
                        .join(',') + '\n';
                    
                    writeStream.write(row);
                });
                
                // Close stream and resolve
                writeStream.end(() => resolve());
            } catch (error) {
                reject(error);
            }
        });
    }
}

export function createObjectCsvWriter(options: CsvWriterOptions): CsvWriter {
    return new CsvWriter(options);
}