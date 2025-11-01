"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWalletService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("./utils");
class AdminWalletService extends utils_1.BaseService {
    constructor() {
        super('AdminWalletService');
        this.adminWalletRepository = new repositories_1.AdminWalletRepository();
    }
    async createWallet(walletData) {
        try {
            this.logInfo('Creating admin wallet', { currency: walletData.currency });
            this.validateRequiredFields(walletData, ['currencyAbbreviation', 'logo', 'address', 'currency']);
            // Validate crypto address
            if (!utils_1.CryptoHelper.validateCryptoAddress(walletData.address, walletData.currency)) {
                throw new utils_1.ValidationError('Invalid cryptocurrency address');
            }
            // Check if address already exists
            const existingWallet = await this.adminWalletRepository.findByAddress(walletData.address);
            if (existingWallet) {
                throw new utils_1.ConflictError('Wallet address already exists');
            }
            const wallet = await this.adminWalletRepository.create(walletData);
            this.logInfo('Admin wallet created successfully', { walletId: wallet.id });
            return wallet.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to create admin wallet');
        }
    }
    async getAllWallets() {
        try {
            this.logInfo('Fetching all admin wallets');
            const wallets = await this.adminWalletRepository.findAll({
                order: [['currency', 'ASC']],
            });
            return wallets.map(wallet => wallet.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch admin wallets');
        }
    }
    async getWalletById(id) {
        try {
            this.logInfo('Fetching admin wallet by ID', { walletId: id });
            const wallet = await this.adminWalletRepository.findById(id);
            if (!wallet) {
                throw new utils_1.NotFoundError('Admin wallet');
            }
            return wallet.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch admin wallet');
        }
    }
    async updateWallet(id, updateData) {
        try {
            this.logInfo('Updating admin wallet', { walletId: id, updateData });
            const wallet = await this.adminWalletRepository.findById(id);
            if (!wallet) {
                throw new utils_1.NotFoundError('Admin wallet');
            }
            const allowedFields = ['currencyAbbreviation', 'logo', 'address', 'currency', 'isActive'];
            const sanitizedData = this.sanitizeData(updateData, allowedFields);
            // Validate crypto address if provided
            if (sanitizedData.address) {
                const currency = sanitizedData.currency || wallet.currency;
                if (!utils_1.CryptoHelper.validateCryptoAddress(sanitizedData.address, currency)) {
                    throw new utils_1.ValidationError('Invalid cryptocurrency address');
                }
                // Check if new address already exists
                const existingWallet = await this.adminWalletRepository.findByAddress(sanitizedData.address);
                if (existingWallet && existingWallet.id !== id) {
                    throw new utils_1.ConflictError('Wallet address already exists');
                }
            }
            const updatedWallet = await this.adminWalletRepository.update(id, sanitizedData);
            if (!updatedWallet) {
                throw new utils_1.AppError('Failed to update admin wallet');
            }
            return updatedWallet.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to update admin wallet');
        }
    }
    async deleteWallet(id) {
        try {
            this.logInfo('Deleting admin wallet', { walletId: id });
            const wallet = await this.adminWalletRepository.findById(id);
            if (!wallet) {
                throw new utils_1.NotFoundError('Admin wallet');
            }
            await this.adminWalletRepository.deleteById(id);
            this.logInfo('Admin wallet deleted successfully', { walletId: id });
        }
        catch (error) {
            this.handleError(error, 'Failed to delete admin wallet');
        }
    }
    async getActiveWallets() {
        try {
            this.logInfo('Fetching active admin wallets');
            const wallets = await this.adminWalletRepository.findAllActive();
            return wallets.map(wallet => wallet.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch active admin wallets');
        }
    }
    async getWalletByCurrency(currency) {
        try {
            this.logInfo('Fetching admin wallet by currency', { currency });
            const wallet = await this.adminWalletRepository.findByCurrency(currency);
            return wallet ? wallet.get({ plain: true }) : null;
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch admin wallet by currency');
        }
    }
}
exports.AdminWalletService = AdminWalletService;
