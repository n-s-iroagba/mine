"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoHelper = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
class CryptoHelper {
    static async hashPassword(password) {
        return await bcryptjs_1.default.hash(password, this.SALT_ROUNDS);
    }
    static async comparePassword(password, hashedPassword) {
        return await bcryptjs_1.default.compare(password, hashedPassword);
    }
    static generateRandomString(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    static generateTransactionId() {
        const timestamp = Date.now().toString();
        const random = this.generateRandomString(8);
        return `txn_${timestamp}_${random}`;
    }
    static generateSubscriptionId() {
        const timestamp = Date.now().toString();
        const random = this.generateRandomString(6);
        return `sub_${timestamp}_${random}`;
    }
    static generateKYCId() {
        const timestamp = Date.now().toString();
        const random = this.generateRandomString(4);
        return `kyc_${timestamp}_${random}`;
    }
    static validateCryptoAddress(address, currency) {
        // Basic validation - in production, use proper crypto address validation libraries
        const validators = {
            BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/i,
            ETH: /^0x[a-fA-F0-9]{40}$/,
            USDT: /^0x[a-fA-F0-9]{40}$/,
            USDC: /^0x[a-fA-F0-9]{40}$/,
        };
        const validator = validators[currency.toUpperCase()];
        return validator ? validator.test(address) : true; // Return true for currencies without specific validation
    }
    static maskCryptoAddress(address) {
        if (address.length <= 8)
            return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    static generateRandomBytes(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    static hashString(data, algorithm = 'sha256') {
        return crypto_1.default.createHash(algorithm).update(data).digest('hex');
    }
    static generateSecureToken() {
        const token = this.generateRandomBytes(32);
        const hashedToken = this.hashString(token);
        return { token, hashedToken };
    }
}
exports.CryptoHelper = CryptoHelper;
CryptoHelper.SALT_ROUNDS = 12;
