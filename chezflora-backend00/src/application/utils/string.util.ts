// src/application/utils/string.util.ts

/**
 * Génère une chaîne de caractères aléatoire
 * @param length Longueur de la chaîne à générer (défaut: 8)
 * @param charset Ensemble de caractères à utiliser (défaut: alphanumériques)
 * @returns Chaîne de caractères aléatoire
 */
export function generateRandomString(length: number = 8, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    let result = '';
    const charsetLength = charset.length;
    
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charsetLength));
    }
    
    return result;
}

/**
 * Génère un slug à partir d'une chaîne de caractères
 * @param str Chaîne de caractères à convertir en slug
 * @returns Slug (chaîne en minuscules, sans accents, avec des tirets à la place des espaces)
 */
export function slugify(str: string): string {
    return str
        .toString()
        .normalize('NFD')                 // Normaliser en forme de décomposition
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')    // Supprimer les caractères non alphanumériques
        .replace(/[\s_-]+/g, '-')         // Remplacer les espaces et underscores par des tirets
        .replace(/^-+|-+$/g, '');         // Supprimer les tirets en début et fin
}