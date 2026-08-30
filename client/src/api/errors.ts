import axios from 'axios';

export class ApiError extends Error {
    readonly status?: number;
    readonly details?: unknown;

    constructor(message: string, status?: number, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

export function normalizeApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        const message = typeof detail === 'string' ? detail : error.message || 'Request failed';
        return new ApiError(message, error.response?.status, detail);
    }
    if (error instanceof Error) return new ApiError(error.message, undefined, error);
    return new ApiError('Request failed', undefined, error);
}
