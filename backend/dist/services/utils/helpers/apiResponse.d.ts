import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class ResponseHelper {
    static success<T>(res: Response, message?: string, data?: T, statusCode?: number): Response;
    static created<T>(res: Response, message?: string, data?: T): Response;
    static paginated<T>(res: Response, message: string, data: T[], pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }): Response;
    static error(res: Response, message?: string, statusCode?: number): Response;
    static noContent(res: Response): Response;
}
//# sourceMappingURL=apiResponse.d.ts.map