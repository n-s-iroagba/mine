"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const Miner_1 = __importDefault(require("../models/Miner"));
const repositories_1 = require("../repositories");
const EmailService_1 = require("./EmailService");
const PasswordService_1 = require("./PasswordService");
const TokenService_1 = require("./TokenService");
const UserService_1 = require("./UserService");
const utils_1 = require("./utils");
const VerificationService_1 = require("./VerificationService");
class AuthService {
    constructor() {
        this.passwordService = new PasswordService_1.PasswordService();
        this.verificationService = new VerificationService_1.VerificationService();
        this.tokenService = new TokenService_1.TokenService('aba', '');
        this.userService = new UserService_1.UserService();
        this.emailService = new EmailService_1.EmailService('');
        this.userRepository = new repositories_1.UserRepository();
    }
    /**
     * Registers a new user and initiates email verification.
     */
    async signupMiner(data) {
        const { username, firstname, lastname, email, country, age, phone } = data;
        const minerPayload = {
            firstname,
            lastname,
            country,
            age,
            phone
        };
        try {
            utils_1.logger.info('Sign up process started', { email: data.email });
            const hashedPassword = await this.passwordService.hashPassword(data.password);
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser) {
                console.log(existingUser);
                throw new utils_1.ConflictError('User with this email already exists .');
            }
            const user = await this.userRepository.create({
                email,
                username,
                password: hashedPassword,
                role: 'miner',
            });
            if (!user.email) {
                utils_1.logger.error('Missing user email when initiating verification', { userId: user.id });
                throw new Error('Missing email for verification');
            }
            await Miner_1.default.create({ ...minerPayload, userId: user.id });
            const response = await this.verificationService.intiateEmailVerificationProcess(user);
            utils_1.logger.info('Sign up completed successfully', { userId: user.id });
            return response;
        }
        catch (error) {
            return this.handleAuthError('Sign up', { email: data.email }, error);
        }
    }
    /**
     * Creates a sports admin.
     */
    async signUpAdmin(data) {
        try {
            utils_1.logger.info('Admin sign up started', { email: data.email });
            const hashedPassword = await this.passwordService.hashPassword(data.password);
            const user = await this.userRepository.create({
                ...data,
                password: hashedPassword,
                role: 'admin',
                isEmailVerified: true
            });
            const response = await this.verificationService.intiateEmailVerificationProcess(user);
            utils_1.logger.info('Sign up completed successfully', { userId: user.id });
            return response;
        }
        catch (error) {
            return this.handleAuthError('Admin sign up', { email: data.email }, error);
        }
    }
    /**
     * Logs a user in by validating credentials and returning tokens.
     */
    async login(data) {
        try {
            utils_1.logger.info('Login attempt started', { email: data.email });
            const user = await this.userService.findUserByEmail(data.email, true);
            if (!user) {
                throw new utils_1.NotFoundError('user not found');
            }
            await this.validatePassword(user, data.password);
            // if (!user.isEmailVerified) {
            //   logger.warn('Login attempted by unverified user', { userId: user.id })
            //   return await this.verificationService.intiateEmailVerificationProcess(user)
            // }
            const { accessToken, refreshToken } = this.generateTokenPair(user);
            utils_1.logger.info('Login successful', { userId: user.id });
            await this.userService.updateUser(user.id, { refreshToken });
            let returnUser = {
                role: user.role,
                userId: user.id,
                username: 'admin',
                roleId: user.id
            };
            if (user.role === 'miner') {
                const client = await Miner_1.default.findOne({ where: { userId: user.id } });
                if (!client) {
                    throw new utils_1.NotFoundError('Client not found');
                }
                returnUser.username = client?.firstname;
                returnUser.roleId;
            }
            return { user: returnUser, accessToken, refreshToken };
        }
        catch (error) {
            return this.handleAuthError('Login', { email: data.email }, error);
        }
    }
    /**
     * Issues a new access token from a refresh token.
     */
    async refreshToken(refreshToken) {
        try {
            utils_1.logger.info('Token refresh attempted');
            const { decoded } = this.tokenService.verifyToken(refreshToken, 'refresh');
            const id = decoded.id;
            if (!id) {
                utils_1.logger.warn('Invalid refresh token provided');
                throw new utils_1.BadRequestError('Invalid refresh token');
            }
            const user = await this.userService.findUserById(id);
            const newAccessToken = this.tokenService.generateAccessToken(user);
            utils_1.logger.info('Token refreshed successfully', { userId: user.id });
            return { accessToken: newAccessToken };
        }
        catch (error) {
            return this.handleAuthError('Token refresh', {}, error);
        }
    }
    /**
     * Verifies a user's email using a token and code.
     */
    async verifyEmail(data) {
        try {
            utils_1.logger.info('Email verification started');
            console.log(data.verificationToken);
            const user = await this.userRepository.findOne({ verificationToken: data.verificationToken });
            console.log(user);
            if (!user) {
                utils_1.logger.warn('Invalid verification token provided');
                throw new utils_1.NotFoundError('User with Token not found.');
            }
            const { decoded } = this.tokenService.verifyToken(data.verificationToken, 'email_verification');
            console.log(decoded);
            //  if(decoded.id !== user.getDataValue('id')){
            //     throw new BadRequestError('Wrong credentials')
            //  }
            // this.verificationService.validateVerificationCode(user, data.verificationCode)
            user.verificationCode = null;
            user.verificationToken = null;
            await user.save();
            const { accessToken, refreshToken } = this.generateTokenPair(user);
            utils_1.logger.info('Email verification successful', { userId: user.id });
            user.refreshToken = refreshToken;
            await user.save();
            let returnUser = {
                role: user.role,
                userId: user.id,
                username: 'admin',
                roleId: user.id
            };
            if (user.role === 'miner') {
                const client = await Miner_1.default.findOne({ where: { userId: user.id } });
                if (!client) {
                    throw new utils_1.NotFoundError('Client not found');
                }
                returnUser.username = client?.firstname;
                returnUser.roleId;
            }
            return { user: returnUser, accessToken, refreshToken };
        }
        catch (error) {
            return this.handleAuthError('Email verification', {}, error);
        }
    }
    /**
     * Generates a new email verification code.
     */
    async generateNewCode(token) {
        try {
            utils_1.logger.info('New verification code generation requested');
            return await this.verificationService.regenerateVerificationCode(token);
        }
        catch (error) {
            return this.handleAuthError('New code generation', {}, error);
        }
    }
    /**
     * Sends a password reset email to the user.
     */
    async forgotPassword(email) {
        try {
            utils_1.logger.info('Password reset requested', { email });
            const user = await this.userService.findUserByEmail(email);
            if (!user) {
                utils_1.logger.error('Password reset requested for non-existent email', { email });
                throw new utils_1.NotFoundError('user for forgot password not found');
            }
            const { token, hashedToken } = this.passwordService.generateResetToken();
            await this.userService.setPasswordResetDetails(user, hashedToken);
            await this.emailService.sendPasswordResetEmail(user.email, token);
            utils_1.logger.info('Password reset email sent', { userId: user.id });
        }
        catch (error) {
            return this.handleAuthError('Password reset', { email }, error);
        }
    }
    /**
     * Resets the user's password using the reset token.
     */
    async resetPassword(data) {
        try {
            utils_1.logger.info('Password reset process started');
            const user = await this.userService.findUserByResetToken(data.resetPasswordToken);
            const hashedPassword = await this.passwordService.hashPassword(data.password);
            await this.userService.updateUserPassword(user, hashedPassword);
            const { accessToken, refreshToken } = this.generateTokenPair(user);
            utils_1.logger.info('Password reset successful', { userId: user.id });
            return this.saveRefreshTokenAndReturn(user, accessToken, refreshToken);
        }
        catch (error) {
            return this.handleAuthError('Password reset', {}, error);
        }
    }
    /**
     * Retrieves a user by ID.
     */
    async getUserById(userId) {
        try {
            utils_1.logger.info('Get user by ID requested', { userId });
            const user = await this.userService.findUserById(userId);
            utils_1.logger.info('User retrieved successfully', { userId: user.id });
            return user;
        }
        catch (error) {
            return this.handleAuthError('Get user by ID', { userId }, error);
        }
    }
    /**
     * Returns the current authenticated user's details.
     */
    async getMe(userId) {
        try {
            utils_1.logger.info('Get current user requested', { userId });
            const user = await this.userService.findUserById(userId);
            utils_1.logger.info('Current user retrieved successfully', { userId });
            let returnUser = {
                role: user.role,
                userId: user.id,
                username: user?.username || "Admin",
                roleId: user.id
            };
            if (user.role === 'miner') {
                const client = await Miner_1.default.findOne({ where: { userId: user.id } });
                if (!client) {
                    throw new utils_1.NotFoundError('Client not found');
                }
                returnUser.username = client?.firstname;
                returnUser.roleId;
            }
            return returnUser;
        }
        catch (error) {
            return this.handleAuthError('Get current user', { userId }, error);
        }
    }
    // ----------------- helpers -----------------
    async validatePassword(user, password) {
        const isMatch = await this.passwordService.comparePasswords(password, user.password);
        if (!isMatch) {
            utils_1.logger.warn('Password validation failed', { userId: user.id });
            throw new utils_1.BadRequestError('INVALID_CREDENTIALS');
        }
        utils_1.logger.info('Password validated successfully', { userId: user.id });
    }
    generateTokenPair(user) {
        const accessToken = this.tokenService.generateAccessToken(user);
        const refreshToken = this.tokenService.generateRefreshToken(user);
        return { accessToken, refreshToken };
    }
    async saveRefreshTokenAndReturn(passedUser, accessToken, refreshToken) {
        passedUser.refreshToken = refreshToken;
        await passedUser.save();
        const user = { ...passedUser.get ? passedUser.get({ plain: true }) : passedUser };
        return { accessToken, user, refreshToken };
    }
    async handleAuthError(operation, context, error) {
        utils_1.logger.error(`${operation} failed`, { ...context, error });
        throw error;
    }
}
exports.AuthService = AuthService;
