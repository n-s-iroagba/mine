import { Request, Response } from 'express';
declare class WithdrawalController {
    private withdrawalService;
    constructor();
    createWithdrawal: (req: Request, res: Response) => Promise<void>;
    getMinerWithdrawals: (req: Request, res: Response) => Promise<void>;
    getAllWithdrawals: (req: Request, res: Response) => Promise<void>;
    getWithdrawalById: (req: Request, res: Response) => Promise<void>;
    updateWithdrawalStatus: (req: Request, res: Response) => Promise<void>;
    cancelWithdrawal: (req: Request, res: Response) => Promise<void>;
    getWithdrawalStats: (_: Request, res: Response) => Promise<void>;
}
export default WithdrawalController;
//# sourceMappingURL=WithdrawalController.d.ts.map