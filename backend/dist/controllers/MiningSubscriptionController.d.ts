import { Request, Response } from 'express';
import { BaseController } from './BaseController';
export declare class MiningSubscriptionController extends BaseController {
    private miningSubscriptionService;
    constructor();
    createSubscription: (req: Request, res: Response) => Promise<Response | void>;
    getAllSubscriptions: (req: Request, res: Response) => Promise<Response | void>;
    getSubscriptionById: (req: Request, res: Response) => Promise<Response | void>;
    getSubscriptionsByMinerId: (req: Request, res: Response) => Promise<Response | void>;
    updateEarnings: (req: Request, res: Response) => Promise<Response | void>;
    calculateEarnings: (req: Request, res: Response) => Promise<Response | void>;
    getMinerDashboard: (req: Request, res: Response) => Promise<Response | void>;
    deactivateSubscription: (req: Request, res: Response) => Promise<Response | void>;
    processDailyEarnings: (req: Request, res: Response) => Promise<Response | void>;
}
//# sourceMappingURL=MiningSubscriptionController.d.ts.map