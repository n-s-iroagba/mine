import { Request, Response } from 'express';
import { BaseController } from './BaseController';
export declare class MiningServerController extends BaseController {
    private miningServerService;
    constructor();
    createServer: (req: Request, res: Response) => Promise<Response | void>;
    getAllServers: (_: Request, res: Response) => Promise<Response | void>;
    getServerById: (req: Request, res: Response) => Promise<Response | void>;
    updateServer: (req: Request, res: Response) => Promise<Response | void>;
    deleteServer: (req: Request, res: Response) => Promise<Response | void>;
    getAllServersWithContracts: (_: Request, res: Response) => Promise<Response | void>;
}
//# sourceMappingURL=MiningServerController.d.ts.map