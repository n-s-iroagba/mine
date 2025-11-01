import { Request, Response } from 'express';
import { BaseController } from './BaseController';
export declare class KYCController extends BaseController {
    private kycService;
    constructor();
    createKYCRequest: (req: Request, res: Response) => Promise<Response | void>;
    getAllKYCRequests: (req: Request, res: Response) => Promise<Response | void>;
    getKYCRequestById: (req: Request, res: Response) => Promise<Response | void>;
    getKYCByMinerId: (req: Request, res: Response) => Promise<Response | void>;
    updateKYCStatus: (req: Request, res: Response) => Promise<Response | void>;
    getKYCByStatus: (req: Request, res: Response) => Promise<Response | void>;
    getKYCStats: (req: Request, res: Response) => Promise<Response | void>;
}
//# sourceMappingURL=KYCController.d.ts.map