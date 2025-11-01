"use strict";
// services/verification.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const User_1 = __importDefault(require("../models/User"));
const EmailService_1 = require("./EmailService");
const TokenService_1 = require("./TokenService");
const UserService_1 = require("./UserService");
const utils_1 = require("./utils");
const codeHelper_1 = require("./utils/helpers/codeHelper");
class VerificationService {
    constructor() {
        this.emailService = new EmailService_1.EmailService('');
        this.tokenService = new TokenService_1.TokenService('aba', '');
        this.userService = new UserService_1.UserService();
    }
    async intiateEmailVerificationProcess(user) {
        try {
            const verificationToken = this.tokenService.generateEmailVerificationToken(user);
            const verificationCode = process.env.NODE_ENV === 'production' ? codeHelper_1.CodeHelper.generateVerificationCode() : '123456';
            await User_1.default.update({ verificationCode, verificationToken }, { where: { id: user.id } });
            console.log(verificationToken);
            console.log(user);
            await this.emailService.sendVerificationEmail(user);
            utils_1.logger.info('Verification details generated successfully', { userId: user.id });
            return { verificationToken, id: user.id };
        }
        catch (error) {
            console.error(error);
            utils_1.logger.error('Error generating verification details', { userId: user.id, error });
            throw error;
        }
    }
    async regenerateVerificationCode(token) {
        try {
            const u = await User_1.default.findByPk(1);
            console.log(u);
            const user = await this.userService.findUserByVerificationToken(token);
            if (user.verificationToken !== token)
                throw new utils_1.BadRequestError('Token does not match');
            const verificationToken = this.tokenService.generateEmailVerificationToken(user);
            const verificationCode = process.env.NODE_ENV === 'production' ? codeHelper_1.CodeHelper.generateVerificationCode() : '123456';
            console.log('VVVV', verificationToken);
            await User_1.default.update({ verificationCode, verificationToken }, { where: { id: user.id } });
            await this.emailService.sendVerificationEmail(user);
            utils_1.logger.info('Verification code regenerated', { userId: user.id });
            return verificationToken;
        }
        catch (error) {
            utils_1.logger.error('Error regenerating verification code', { error });
            throw error;
        }
    }
    validateVerificationCode(user, code) {
        console.log(user);
        if (user.verificationCode !== code) {
            utils_1.logger.warn('Invalid verification code provided', { userId: user.id });
            throw new utils_1.ForbiddenError('Invalid verification code');
        }
        utils_1.logger.info('Verification code validated successfully', { userId: user.id });
    }
}
exports.VerificationService = VerificationService;
