export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailHelper {
    private static transporter;
    static initialize(): void;
    static sendEmail(options: EmailOptions): Promise<boolean>;
    static generateWelcomeEmail(name: string): string;
    static generateKYCApprovedEmail(name: string): string;
    static generatePaymentConfirmationEmail(name: string, amount: number, type: string): string;
}
//# sourceMappingURL=email.d.ts.map