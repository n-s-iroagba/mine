import { Request, Response } from 'express';
import { BaseController } from './BaseController';
export declare class MiningContractController extends BaseController {
    private miningContractService;
    constructor();
    createContract: (req: Request, res: Response) => Promise<Response | void>;
    getAllContracts: (_: Request, res: Response) => Promise<Response | void>;
    getContractById: (req: Request, res: Response) => Promise<Response | void>;
    updateContract: (req: Request, res: Response) => Promise<Response | void>;
    deleteContract: (req: Request, res: Response) => Promise<Response | void>;
    getContractsByServerId: (req: Request, res: Response) => Promise<Response | void>;
    getContractsByPeriod: (req: Request, res: Response) => Promise<Response | void>;
}
//# sourceMappingURL=MiningContractController.d.ts.map