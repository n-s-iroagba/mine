import { User } from '../models';
import { BaseService } from './utils';
export interface SendEmailData {
    to: string | number;
    subject: string;
    type?: 'general' | 'notification' | 'alert';
    html?: string;
    message?: string;
}
export declare class EmailService extends BaseService {
    private userRepository;
    private clientUrl;
    constructor(url: string);
    sendEmail(emailData: SendEmailData): Promise<boolean>;
    sendBulkEmail(userIds: number[], subject: string, message: string): Promise<{
        sent: number;
        failed: number;
    }>;
    sendEmailToAllMiners(subject: string, message: string): Promise<{
        sent: number;
        failed: number;
    }>;
    sendEmailToAllAdmins(subject: string, message: string): Promise<{
        sent: number;
        failed: number;
    }>;
    private generateEmailTemplate;
    sendVerificationEmail(user: User): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    private getBaseEmailStyles;
    sendWelcomeEmail(user: User): Promise<void>;
}
//# sourceMappingURL=EmailService.d.ts.map