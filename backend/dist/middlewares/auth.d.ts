import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface UserPayload {
            userId: number;
            role: string;
            email: string;
        }
        interface Request {
            user?: UserPayload;
        }
    }
}
export declare const authenticate: (req: Request, _: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, _: Response, next: NextFunction) => void;
export declare const requireMiner: (req: Request, _: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, _: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map