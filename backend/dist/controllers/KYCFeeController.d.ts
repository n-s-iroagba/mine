import { Request, Response } from 'express';
import { BaseController } from './BaseController';
export declare class KYCFeeController extends BaseController {
    private kycFeeService;
    constructor();
    createKYCFee: (req: Request, res: Response) => Promise<Response | void>;
    getAllKYCFees: (req: Request, res: Response) => Promise<Response | void>;
    getKYCFeeById: (req: Request, res: Response) => Promise<Response | void>;
    getKYCFeeByMinerId: (req: Request, res: Response) => Promise<Response | void>;
    markFeeAsPaid: (req: Request, res: Response) => Promise<Response | void>;
    getUnpaidFees: (req: Request, res: Response) => Promise<Response | void>;
    getPaidFees: (req: Request, res: Response) => Promise<Response | void>;
    getKYCFeeStats: (req: Request, res: Response) => Promise<Response | void>;
}
//# sourceMappingURL=KYCFeeController.d.ts.map