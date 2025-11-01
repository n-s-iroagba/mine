import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class CryptoHelper {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = this.generateRandomString(8);
    return `txn_${timestamp}_${random}`;
  }

  static generateSubscriptionId(): string {
    const timestamp = Date.now().toString();
    const random = this.generateRandomString(6);
    return `sub_${timestamp}_${random}`;
  }

  static generateKYCId(): string {
    const timestamp = Date.now().toString();
    const random = this.generateRandomString(4);
    return `kyc_${timestamp}_${random}`;
  }

  static validateCryptoAddress(address: string, currency: string): boolean {
    // Basic validation - in production, use proper crypto address validation libraries
    const validators: { [key: string]: RegExp } = {
      BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/i,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      USDT: /^0x[a-fA-F0-9]{40}$/,
      USDC: /^0x[a-fA-F0-9]{40}$/,
    };

    const validator = validators[currency.toUpperCase()];
    return validator ? validator.test(address) : true; // Return true for currencies without specific validation
  }

  static maskCryptoAddress(address: string): string {
    if (address.length <= 8) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  static generateRandomBytes(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashString(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  static generateSecureToken(): { token: string; hashedToken: string } {
    const token = this.generateRandomBytes(32);
    const hashedToken = this.hashString(token);
    return { token, hashedToken };
  }
}
