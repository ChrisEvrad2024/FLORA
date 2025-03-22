// src/middleware/api.middleware.ts
import { toast } from "sonner";

/**
 * Middleware to handle API requests with consistent error handling and loading states
 * @param apiCall - The API service function to call
 * @param options - Configuration options
 * @returns Result and status information
 */
export async function withApiHandler<T>(
    apiCall: () => Promise<T>,
    options: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (data: T) => void;
        onError?: (error: any) => void;
        showSuccessToast?: boolean;
        showErrorToast?: boolean;
        throwError?: boolean;
    } = {}
) {
    const {
        loadingMessage,
        successMessage,
        errorMessage = "Une erreur s'est produite. Veuillez réessayer.",
        onSuccess,
        onError,
        showSuccessToast = false,
        showErrorToast = true,
        throwError = false,
    } = options;

    // Show loading toast if message provided
    let loadingToastId: string | number | undefined;
    if (loadingMessage) {
        loadingToastId = toast.loading(loadingMessage);
    }

    try {
        // Call the API
        const result = await apiCall();

        // Dismiss loading toast if it exists
        if (loadingToastId) {
            toast.dismiss(loadingToastId);
        }

        // Show success toast if configured
        if (showSuccessToast && successMessage) {
            toast.success(successMessage);
        }

        // Call success callback if provided
        if (onSuccess) {
            onSuccess(result);
        }

        return { success: true, data: result, error: null };
    } catch (error: any) {
        // Dismiss loading toast if it exists
        if (loadingToastId) {
            toast.dismiss(loadingToastId);
        }

        // Extract error message from API response if possible
        let message = errorMessage;
        if (error.response?.data?.message) {
            message = error.response.data.message;
        }

        // Show error toast if configured
        if (showErrorToast) {
            toast.error("Erreur", {
                description: message,
            });
        }

        // Call error callback if provided
        if (onError) {
            onError(error);
        }

        // Optionally rethrow the error
        if (throwError) {
            throw error;
        }

        return { success: false, data: null, error };
    }
}

/**
 * Usage example:
 * 
 * // In a component:
 * const fetchProducts = async () => {
 *   const { success, data, error } = await withApiHandler(
 *     () => productService.getProducts(),
 *     {
 *       loadingMessage: "Chargement des produits...",
 *       errorMessage: "Impossible de charger les produits",
 *       onSuccess: (result) => {
 *         setProducts(result.data.products);
 *       }
 *     }
 *   );
 * };
 */