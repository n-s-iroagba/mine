import { Request, Response} from 'express';
import { EmailService } from '../services';
import { BaseController } from './BaseController';
import { validateData } from '../services/utils/helpers/validation';
import { z } from 'zod';



const sendBulkEmailSchema = z.object({
  userIds: z.array(z.number().int().positive('Invalid user ID')),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

const sendGroupEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export class EmailController extends BaseController {
  private emailService: EmailService;

  constructor() {
    super();
    this.emailService = new EmailService('');
  }

  sendEmail = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      
      const result = await this.emailService.sendEmail(req.body);
      
      return this.success(res, 'Email sent successfully', { success: result });
    } catch (error) {
      return this.handleError(error, res, 'Failed to send email');
    }
  };

  sendBulkEmail = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const validatedData =validateData(sendBulkEmailSchema, req.body);
      
      const result = await this.emailService.sendBulkEmail(
        req.body.userIds,
        req.body.subject,
        req.body.message
      );
      
      return this.success(res, 'Bulk email sent successfully', result);
    } catch (error) {
      return this.handleError(error, res, 'Failed to send bulk email');
    }
  };

  sendEmailToAllMiners = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const validatedData =validateData(sendGroupEmailSchema, req.body);
      
      const result = await this.emailService.sendEmailToAllMiners(
        req.body.subject,
        req.body.message
      );
      
      return this.success(res, 'Email sent to all miners successfully', result);
    } catch (error) {
      return this.handleError(error, res, 'Failed to send email to all miners');
    }
  };

  sendEmailToAllAdmins = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const validatedData =validateData(sendGroupEmailSchema, req.body);
      
      const result = await this.emailService.sendEmailToAllAdmins(
        req.body.subject,
        req.body.message
      );
      
      return this.success(res, 'Email sent to all admins successfully', result);
    } catch (error) {
      return this.handleError(error, res, 'Failed to send email to all admins');
    }
  };
}