import nodemailer from 'nodemailer';
import logger from '../logger/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailHelper {
  private static transporter: nodemailer.Transporter;

  static initialize() {
    this.transporter = nodemailer.createTransport({
      // host: process.env.EMAIL_HOST,
      // port: parseInt(process.env.EMAIL_PORT || '587'),
      // secure: false,
      // auth: {
      //   user: process.env.EMAIL_USER,
      //   pass: process.env.EMAIL_PASSWORD,
      // },
      service: "Gmail",
    auth: {
      user: "wealthfundingtradestation@gmail.com",
      pass: "anft vmyj ianz sftx",
    },
    });
  }

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initialize();
      }

      const mailOptions = {
        from: 'Satoshi Vertex',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
      });
      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  static generateWelcomeEmail(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Satoshi Vertex!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Welcome to Satoshi Vertex! Your account has been successfully created.</p>
            <p>Start your mining journey by exploring our mining contracts and start earning today!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Satoshi Vertex. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static generateKYCApprovedEmail(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KYC Verification Approved!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>We're pleased to inform you that your KYC verification has been approved.</p>
            <p>You can now access all features of our platform and start mining immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Satoshi Vertex. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static generatePaymentConfirmationEmail(name: string, amount: number, type: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .amount { font-size: 24px; color: #22c55e; font-weight: bold; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Your ${type} payment of <span class="amount">$${amount}</span> has been confirmed.</p>
            <p>Thank you for your transaction. Your mining operations will start shortly.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Satoshi Vertex. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}