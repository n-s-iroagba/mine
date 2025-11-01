import { Request, Response } from 'express';
import { BaseController } from './BaseController';
export declare class TransactionController extends BaseController {
    private transactionService;
    constructor();
    createTransaction: (req: Request, res: Response) => Promise<Response | void>;
    getAllTransactions: (req: Request, res: Response) => Promise<Response | void>;
    getTransactionById: (req: Request, res: Response) => Promise<Response | void>;
    getTransactionsByMinerId: (req: Request, res: Response) => Promise<Response | void>;
    updateTransactionStatus: (req: Request, res: Response) => Promise<Response | void>;
    getTransactionsByStatus: (req: Request, res: Response) => Promise<Response | void>;
    getTransactionStats: (req: Request, res: Response) => Promise<Response | void>;
}
//# sourceMappingURL=TransactionController.d.ts.map