import { Request, Response } from 'express';
import { BaseController } from './BaseController';
export declare class BankController extends BaseController {
    private bankService;
    constructor();
    createBank: (req: Request, res: Response) => Promise<Response | void>;
    getAllBanks: (_: Request, res: Response) => Promise<Response | void>;
    getBankById: (req: Request, res: Response) => Promise<Response | void>;
    updateBank: (req: Request, res: Response) => Promise<Response | void>;
    deleteBank: (req: Request, res: Response) => Promise<Response | void>;
    getActiveBanks: (_: Request, res: Response) => Promise<Response | void>;
}
//# sourceMappingURL=BankController.d.ts.map