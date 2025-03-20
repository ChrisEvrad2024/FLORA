/**
 * Validateurs pour les requêtes d'authentification
 */

interface RegisterInput {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface ValidationError {
    field: string;
    message: string;
}

/**
 * Valide les données d'inscription
 */
export const validateRegisterInput = (data: RegisterInput): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validation de l'email
    if (!data.email) {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push({ field: 'email', message: 'Email is invalid' });
    }

    // Validation du mot de passe
    if (!data.password) {
        errors.push({ field: 'password', message: 'Password is required' });
    } else if (data.password.length < 6) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    // Validation du prénom (optionnel mais si fourni, doit être valide)
    if (data.firstName && data.firstName.trim().length < 2) {
        errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
    }

    // Validation du nom (optionnel mais si fourni, doit être valide)
    if (data.lastName && data.lastName.trim().length < 2) {
        errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
    }

    return errors;
};

/**
 * Valide les données de connexion
 */
export const validateLoginInput = (data: LoginInput): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validation de l'email
    if (!data.email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }

    // Validation du mot de passe
    if (!data.password) {
        errors.push({ field: 'password', message: 'Password is required' });
    }

    return errors;
};