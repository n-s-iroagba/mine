import { Request, Response } from 'express';
import { BaseController } from './BaseController';
export declare class EmailController extends BaseController {
    private emailService;
    constructor();
    sendEmail: (req: Request, res: Response) => Promise<Response | void>;
    sendBulkEmail: (req: Request, res: Response) => Promise<Response | void>;
    sendEmailToAllMiners: (req: Request, res: Response) => Promise<Response | void>;
    sendEmailToAllAdmins: (req: Request, res: Response) => Promise<Response | void>;
}
//# sourceMappingURL=EmailController.d.ts.map