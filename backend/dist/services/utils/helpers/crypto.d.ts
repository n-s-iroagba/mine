export declare class CryptoHelper {
    private static readonly SALT_ROUNDS;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    static generateRandomString(length?: number): string;
    static generateTransactionId(): string;
    static generateSubscriptionId(): string;
    static generateKYCId(): string;
    static validateCryptoAddress(address: string, currency: string): boolean;
    static maskCryptoAddress(address: string): string;
    static generateRandomBytes(length?: number): string;
    static hashString(data: string, algorithm?: string): string;
    static generateSecureToken(): {
        token: string;
        hashedToken: string;
    };
}
//# sourceMappingURL=crypto.d.ts.map