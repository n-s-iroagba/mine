import { Request, Response} from 'express';
import { ResponseHelper } from '../services/utils/helpers/apiResponse';
import { AppError } from '../services/utils/errors/AppError';
import logger from '../services/utils/logger/logger';

export abstract class BaseController {
  protected success<T>(res: Response, message: string = 'Success', data?: T, statusCode: number = 200): Response {
    return ResponseHelper.success(res, message, data, statusCode);
  }

  protected created<T>(res: Response, message: string = 'Resource created successfully', data?: T): Response {
    return ResponseHelper.created(res, message, data);
  }

  protected error(res: Response, message: string = 'Internal server error', statusCode: number = 500): Response {
    return ResponseHelper.error(res, message, statusCode);
  }

  protected paginated<T>(
    res: Response,
    message: string,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ): Response {
    return ResponseHelper.paginated(res, message, data, pagination);
  }

  protected noContent(res: Response): Response {
    return ResponseHelper.noContent(res);
  }

  protected handleError(error: any, res: Response, defaultMessage: string = 'Internal server error'): Response {
    if (error instanceof AppError) {
      return this.error(res, error.message, error.statusCode);
    }

    logger.error('Unhandled error in controller:', error);
    return this.error(res, defaultMessage, 500);
  }

  protected getPaginationParams(req: Request): { page: number; limit: number } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    return { page, limit };
  }

  protected getUserId(req: Request): number {
    if (!req.user || !req.user.userId) {
      throw new AppError('User not authenticated', 401);
    }
    return req.user.userId;
  }

  protected getUserRole(req: Request): string {
    if (!req.user || !req.user.role) {
      throw new AppError('User role not found', 401);
    }
    return req.user.role;
  }

  protected ensureAdmin(req: Request): void {
    const role = this.getUserRole(req);
    if (role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }
  }

  protected ensureMiner(req: Request): void {
    const role = this.getUserRole(req);
    if (role !== 'miner') {
      throw new AppError('Miner access required', 403);
    }
  }
}