import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private authService;
    constructor();
    signupMiner: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    signupAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resendVerificationCode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (_: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map