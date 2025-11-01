import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
export declare class AdminWalletController extends BaseController {
    private adminWalletService;
    constructor();
    createWallet: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    getAllWallets: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    getWalletById: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    updateWallet: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    deleteWallet: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    getActiveWallets: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}
//# sourceMappingURL=AdminWalletController.d.ts.map