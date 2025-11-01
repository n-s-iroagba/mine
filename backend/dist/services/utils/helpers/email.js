"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailHelper = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../logger/logger"));
class EmailHelper {
    static initialize() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    static async sendEmail(options) {
        try {
            if (!this.transporter) {
                this.initialize();
            }
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };
            const result = await this.transporter.sendMail(mailOptions);
            logger_1.default.info('Email sent successfully', {
                to: options.to,
                subject: options.subject,
                messageId: result.messageId,
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to send email', {
                to: options.to,
                subject: options.subject,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return false;
        }
    }
    static generateWelcomeEmail(name) {
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
    static generateKYCApprovedEmail(name) {
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
    static generatePaymentConfirmationEmail(name, amount, type) {
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
exports.EmailHelper = EmailHelper;
