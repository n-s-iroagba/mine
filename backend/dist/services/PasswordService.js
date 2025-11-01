"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("./utils");
class PasswordService {
    constructor() {
        this.SALT_ROUNDS = 12;
    }
    async hashPassword(password) {
        if (!password) {
            utils_1.logger.error('Password hashing attempted with empty password');
            throw new Error('Password is required');
        }
        try {
            const hashedPassword = await bcryptjs_1.default.hash(password, this.SALT_ROUNDS);
            utils_1.logger.info('Password hashed successfully');
            return hashedPassword;
        }
        catch (error) {
            utils_1.logger.error('Password hashing failed', { error });
            throw new Error('Password hashing failed');
        }
    }
    async comparePasswords(plainPassword, hashedPassword) {
        if (!plainPassword || !hashedPassword) {
            utils_1.logger.error('Password comparison attempted with missing parameters');
            throw new Error('Both passwords are required for comparison');
        }
        try {
            const isMatch = await bcryptjs_1.default.compare(plainPassword, hashedPassword);
            console.log('UUUUUUUUUUUUU', isMatch);
            utils_1.logger.info('Password comparison completed', { isMatch });
            return isMatch;
        }
        catch (error) {
            utils_1.logger.error('Password comparison failed', { error });
            throw new Error('Password comparison failed');
        }
    }
    generateResetToken() {
        try {
            const tokens = utils_1.CryptoHelper.generateSecureToken();
            utils_1.logger.info('Password reset token generated successfully');
            return tokens;
        }
        catch (error) {
            utils_1.logger.error('Reset token generation failed', { error });
            throw new Error('Reset token generation failed');
        }
    }
}
exports.PasswordService = PasswordService;
