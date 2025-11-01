import { User } from '../models';
import { UserRepository } from '../repositories';
import { BaseService, EmailHelper, NotFoundError, ValidationError } from './utils';


export interface SendEmailData {
  to: string | number; // Can be email string or user ID
  subject: string;
  type?: 'general' | 'notification' | 'alert';
  html?: string; 
  message?:string // Added html option for custom templates
}

export class EmailService extends BaseService {
  private userRepository: UserRepository;
  private clientUrl: string;

  constructor(url: string) {
    super('EmailService');
    this.userRepository = new UserRepository();
    this.clientUrl = url;
  }

  async sendEmail(emailData: SendEmailData): Promise<boolean> {
    try {
      this.logInfo('Sending email', { 
        to: typeof emailData.to === 'number' ? `user_${emailData.to}` : emailData.to,
        subject: emailData.subject 
      });

      let recipientEmail: string;

      if (typeof emailData.to === 'number') {
        // If to is a user ID, get the user's email
        const user = await this.userRepository.findById(emailData.to);
        if (!user) {
          throw new NotFoundError('User');
        }
        recipientEmail = user.email;
      } else {
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.to)) {
          throw new ValidationError('Invalid email format');
        }
        recipientEmail = emailData.to;
      }

      const emailOptions = {
        to: recipientEmail,
        subject: emailData.subject,
        html: emailData.html || this.generateEmailTemplate(emailData?.message as string, emailData.type),
    
      };

      const result = await EmailHelper.sendEmail(emailOptions);

      if (result) {
        this.logInfo('Email sent successfully', { to: recipientEmail });
      } else {
        this.logWarn('Email sending may have failed', { to: recipientEmail });
      }

      return result;
    } catch (error) {
      this.handleError(error, 'Failed to send email');
    }
  }

  async sendBulkEmail(userIds: number[], subject: string, message: string): Promise<{ sent: number; failed: number }> {
    try {
      this.logInfo('Sending bulk email', { userCount: userIds.length, subject });

      let sentCount = 0;
      let failedCount = 0;

      for (const userId of userIds) {
        try {
          const result = await this.sendEmail({
            to: userId,
            subject,
            message,
            type: 'notification',
          });

          if (result) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          this.logError(`Failed to send email to user ${userId}`, error);
          failedCount++;
        }
      }

      this.logInfo('Bulk email sending completed', { sent: sentCount, failed: failedCount });

      return { sent: sentCount, failed: failedCount };
    } catch (error) {
      this.handleError(error, 'Failed to send bulk email');
    }
  }

  async sendEmailToAllMiners(subject: string, message: string): Promise<{ sent: number; failed: number }> {
    try {
      this.logInfo('Sending email to all miners', { subject });

      const miners = await this.userRepository.findMiners();
      const minerIds = miners.map(miner => miner.id);

      return await this.sendBulkEmail(minerIds, subject, message);
    } catch (error) {
      this.handleError(error, 'Failed to send email to all miners');
    }
  }

  async sendEmailToAllAdmins(subject: string, message: string): Promise<{ sent: number; failed: number }> {
    try {
      this.logInfo('Sending email to all admins', { subject });

      const admins = await this.userRepository.findAdmins();
      const adminIds = admins.map(admin => admin.id);

      return await this.sendBulkEmail(adminIds, subject, message);
    } catch (error) {
      this.handleError(error, 'Failed to send email to all admins');
    }
  }

  private generateEmailTemplate(message: string, type: string = 'general'): string {
    const getHeaderColor = (type: string) => {
      switch (type) {
        case 'notification':
          return '#3b82f6'; // Blue
        case 'alert':
          return '#ef4444'; // Red
        default:
          return '#22c55e'; // Green
      }
    };

    const headerColor = getHeaderColor(type);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; }
          .header { background: ${headerColor}; color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .message { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${headerColor}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Satoshi Vertex</h1>
            <p>Mining Management Platform</p>
          </div>
          <div class="content">
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Satoshi Vertex. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(user: User): Promise<void> {
    try {
      const verificationUrl = `${this.clientUrl}/verify-email?token=${user.verificationToken}`;
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${this.getBaseEmailStyles()}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Welcome ${user.username}!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Please verify your email address</p>
              </div>
              
              <div class="content">
                <p>Thank you for signing up! To complete your registration, please verify your email address.</p>
                
                <div class="details-box">
                  <h3 class="mt-0">Verification Code</h3>
                  <p style="font-size: 24px; font-weight: bold; color: #007bff; margin: 10px 0;">${user.verificationCode}</p>
                  <p><em>You can also use the button below for quick verification</em></p>
                </div>
                
                <div class="text-center">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p><strong>Alternative method:</strong> Copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #007bff; background: #f8f9fa; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
                
                <div class="warning-box">
                  <strong>⚠️ Important:</strong>
                  <ul style="margin: 10px 0;">
                    <li>This verification link will expire in 24 hours</li>
                    <li>Your account will remain inactive until verified</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <p>If you didn't create this account, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Satoshi Vertex. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address - Satoshi Vertex',
        html,
       
      });

      this.logInfo('Verification email sent successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (error: any) {
      this.logError('Failed to send verification email', {
        userId: user.id,
        email: user.email,
        error: error.message,
      });
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${this.clientUrl}/auth/reset-password?token=${token}`;
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${this.getBaseEmailStyles()}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Password Reset Request</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure password reset for your account</p>
              </div>
              
              <div class="content">
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <div class="text-center">
                  <a href="${resetUrl}" class="button danger">Reset Password</a>
                </div>
                
                <p><strong>Alternative method:</strong> Copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #dc3545; background: #f8f9fa; padding: 10px; border-radius: 4px;">${resetUrl}</p>
                
                <div class="error-box">
                  <strong>🔒 Security Notice:</strong>
                  <ul style="margin: 10px 0;">
                    <li>This link will expire in 1 hour for security</li>
                    <li>This link can only be used once</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your current password remains unchanged until you complete the reset</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
                <p>&copy; ${new Date().getFullYear()} Satoshi Vertex. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.sendEmail({
        to: email,
        subject: 'Password Reset Request - Satoshi Vertex',
        html,
      });

      this.logInfo('Password reset email sent successfully', { email });
    } catch (error: any) {
      this.logError('Failed to send password reset email', {
        email,
        error: error.message,
      });
      throw new Error('Failed to send password reset email');
    }
  }

  private getBaseEmailStyles(): string {
    return `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; }
        .button.danger { background: #dc3545; }
        .text-center { text-align: center; }
        .details-box { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; margin: 20px 0; }
        .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
        .error-box { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0; color: #721c24; }
        .mt-0 { margin-top: 0; }
      </style>
    `;
  }

  // Additional utility method for sending welcome email
  async sendWelcomeEmail(user: User): Promise<void> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${this.getBaseEmailStyles()}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Welcome to Satoshi Vertex, ${user.username}!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your mining journey begins now</p>
              </div>
              
              <div class="content">
                <p>We're excited to have you on board! Your account has been successfully verified and is now active.</p>
                
                <div class="details-box">
                  <h3 class="mt-0">Getting Started</h3>
                  <ul>
                    <li>Set up your mining configuration</li>
                    <li>Monitor your mining performance</li>
                    <li>Track your earnings in real-time</li>
                    <li>Join our community of miners</li>
                  </ul>
                </div>
                
                <p>If you have any questions, don't hesitate to contact our support team.</p>
                
                <div class="text-center">
                  <a href="${this.clientUrl}/dashboard" class="button">Go to Dashboard</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Happy Mining!</p>
                <p>&copy; ${new Date().getFullYear()} Satoshi Vertex. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await this.sendEmail({
        to: user.email,
        subject: 'Welcome to Satoshi Vertex!',
        html,
       
      });

      this.logInfo('Welcome email sent successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (error: any) {
      this.logError('Failed to send welcome email', {
        userId: user.id,
        email: user.email,
        error: error.message,
      });
      throw new Error('Failed to send welcome email');
    }
  }
}