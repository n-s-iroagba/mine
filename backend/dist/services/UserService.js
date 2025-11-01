"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("./utils");
class UserService {
    constructor() {
        this.userRepository = new repositories_1.UserRepository();
    }
    // -------------------------------
    // 🟢 CREATE
    // -------------------------------
    async createUser(userData) {
        try {
            const existingUser = await this.findUserByEmail(userData.email);
            if (existingUser) {
                utils_1.logger.warn('Attempt to create user with existing email', { email: userData.email });
                throw new utils_1.UnauthorizedError('User already exists');
            }
            const user = await this.userRepository.create(userData);
            utils_1.logger.info('User created successfully', { userId: user.id, email: userData.email });
            return user;
        }
        catch (error) {
            utils_1.logger.error('Error creating user', { email: userData.email, error });
            throw error;
        }
    }
    // -------------------------------
    // 🟣 READ
    // -------------------------------
    async getAllUsers() {
        try {
            const users = await this.userRepository.findAll();
            utils_1.logger.info('Fetched all users', { count: users.length });
            return users;
        }
        catch (error) {
            utils_1.logger.error('Error fetching users', { error });
            throw error;
        }
    }
    async findUserById(id) {
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                utils_1.logger.warn('User not found by ID', { userId: id });
                throw new utils_1.NotFoundError('USER_NOT_FOUND');
            }
            utils_1.logger.info('User found by ID', { userId: id });
            return user;
        }
        catch (error) {
            utils_1.logger.error('Error finding user by ID', { userId: id, error });
            throw error;
        }
    }
    async findUserByEmail(email, shouldThrowError = false) {
        try {
            const user = await this.userRepository.findByEmail(email);
            if (!user && shouldThrowError) {
                utils_1.logger.warn('User not found by email', { email });
                throw new utils_1.BadRequestError('INVALID_CREDENTIALS');
            }
            if (user) {
                utils_1.logger.info('User found by email', { userId: user.id, email });
            }
            return user;
        }
        catch (error) {
            utils_1.logger.error('Error finding user by email', { email, error });
            throw error;
        }
    }
    // -------------------------------
    // 🟠 UPDATE
    // -------------------------------
    async updateUser(id, updates) {
        try {
            const updatedUser = await this.userRepository.update(id, updates);
            if (!updatedUser) {
                throw new utils_1.NotFoundError('USER_NOT_FOUND');
            }
            utils_1.logger.info('User updated successfully', { userId: id });
            return updatedUser;
        }
        catch (error) {
            utils_1.logger.error('Error updating user', { userId: id, error });
            throw error;
        }
    }
    // -------------------------------
    // 🔴 DELETE
    // -------------------------------
    async deleteUser(id) {
        try {
            const deleted = await this.userRepository.deleteById(id);
            if (!deleted) {
                throw new utils_1.NotFoundError('USER_NOT_FOUND');
            }
            utils_1.logger.info('User deleted successfully', { userId: id });
            return true;
        }
        catch (error) {
            utils_1.logger.error('Error deleting user', { userId: id, error });
            throw error;
        }
    }
    // -------------------------------
    // ⚙️ Additional Auth Utilities
    // -------------------------------
    async findUserByResetToken(token) {
        try {
            const hashedToken = utils_1.CryptoHelper.hashString(token);
            const user = await this.userRepository.findOne({ passwordResetToken: hashedToken });
            if (!user) {
                throw new utils_1.UnauthorizedError('Invalid or expired reset token');
            }
            return user;
        }
        catch (error) {
            utils_1.logger.error('Error finding user by reset token', { error });
            throw error;
        }
    }
    async findUserByVerificationToken(token) {
        try {
            const user = await this.userRepository.findOne({ verificationToken: token });
            if (!user) {
                throw new utils_1.NotFoundError('User not found by verification token');
            }
            return user;
        }
        catch (error) {
            utils_1.logger.error('Error finding user by verification token', { error });
            throw error;
        }
    }
    async updateUserVerification(user, verificationCode, verificationToken) {
        try {
            const updatedUser = await user.update({ verificationCode, verificationToken });
            if (!updatedUser)
                throw new utils_1.NotFoundError('USER_NOT_FOUND');
            return updatedUser;
        }
        catch (error) {
            utils_1.logger.error('Error updating user verification', { userId: user.id, error });
            throw error;
        }
    }
    async markUserAsVerified(user) {
        try {
            const updatedUser = await this.userRepository.update(user.id, {
                isEmailVerified: true,
                verificationCode: null,
                verificationToken: null,
            });
            if (!updatedUser)
                throw new utils_1.NotFoundError('USER_NOT_FOUND');
            return updatedUser;
        }
        catch (error) {
            utils_1.logger.error('Error marking user as verified', { userId: user.id, error });
            throw error;
        }
    }
    async setPasswordResetDetails(user, hashedToken) {
        try {
            const updatedUser = await this.userRepository.update(user.id, { passwordResetToken: hashedToken });
            if (!updatedUser)
                throw new utils_1.NotFoundError('USER_NOT_FOUND');
            return updatedUser;
        }
        catch (error) {
            utils_1.logger.error('Error setting password reset details', { userId: user.id, error });
            throw error;
        }
    }
    async updateUserPassword(user, hashedPassword) {
        try {
            const updatedUser = await this.userRepository.update(user.id, {
                password: hashedPassword,
                passwordResetToken: null,
            });
            if (!updatedUser)
                throw new utils_1.NotFoundError('USER_NOT_FOUND');
            return updatedUser;
        }
        catch (error) {
            utils_1.logger.error('Error updating user password', { userId: user.id, error });
            throw error;
        }
    }
}
exports.UserService = UserService;
