import { Request, Response } from 'express';
export declare abstract class BaseController {
    protected success<T>(res: Response, message?: string, data?: T, statusCode?: number): Response;
    protected created<T>(res: Response, message?: string, data?: T): Response;
    protected error(res: Response, message?: string, statusCode?: number): Response;
    protected paginated<T>(res: Response, message: string, data: T[], pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }): Response;
    protected noContent(res: Response): Response;
    protected handleError(error: any, res: Response, defaultMessage?: string): Response;
    protected getPaginationParams(req: Request): {
        page: number;
        limit: number;
    };
    protected getUserId(req: Request): number;
    protected getUserRole(req: Request): string;
    protected ensureAdmin(req: Request): void;
    protected ensureMiner(req: Request): void;
}
//# sourceMappingURL=BaseController.d.ts.map