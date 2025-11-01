import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/utils';
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map