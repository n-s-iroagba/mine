"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("./utils");
class BankService extends utils_1.BaseService {
    constructor() {
        super('BankService');
        this.bankRepository = new repositories_1.BankRepository();
    }
    async createBank(bankData) {
        try {
            this.logInfo('Creating bank', { name: bankData.name });
            this.validateRequiredFields(bankData, ['name', 'accountNumber', 'accountName']);
            // Check if account number already exists
            const existingBank = await this.bankRepository.findByAccountNumber(bankData.accountNumber);
            if (existingBank) {
                throw new utils_1.ConflictError('Bank account with this number already exists');
            }
            const bank = await this.bankRepository.create(bankData);
            this.logInfo('Bank created successfully', { bankId: bank.id });
            return bank.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to create bank');
        }
    }
    async getAllBanks() {
        try {
            this.logInfo('Fetching all banks');
            const banks = await this.bankRepository.findAll({
                order: [['name', 'ASC']],
            });
            return banks.map(bank => bank.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch banks');
        }
    }
    async getBankById(id) {
        try {
            this.logInfo('Fetching bank by ID', { bankId: id });
            const bank = await this.bankRepository.findById(id);
            if (!bank) {
                throw new utils_1.NotFoundError('Bank');
            }
            return bank.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch bank');
        }
    }
    async updateBank(id, updateData) {
        try {
            this.logInfo('Updating bank', { bankId: id, updateData });
            const bank = await this.bankRepository.findById(id);
            if (!bank) {
                throw new utils_1.NotFoundError('Bank');
            }
            const allowedFields = ['name', 'accountNumber', 'accountName', 'branch', 'swiftCode', 'isActive'];
            const sanitizedData = this.sanitizeData(updateData, allowedFields);
            // Check if new account number already exists
            if (sanitizedData.accountNumber && sanitizedData.accountNumber !== bank.accountNumber) {
                const existingBank = await this.bankRepository.findByAccountNumber(sanitizedData.accountNumber);
                if (existingBank) {
                    throw new utils_1.ConflictError('Bank account with this number already exists');
                }
            }
            const updatedBank = await this.bankRepository.update(id, sanitizedData);
            if (!updatedBank) {
                throw new utils_1.AppError('Failed to update bank');
            }
            return updatedBank.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to update bank');
        }
    }
    async deleteBank(id) {
        try {
            this.logInfo('Deleting bank', { bankId: id });
            const bank = await this.bankRepository.findById(id);
            if (!bank) {
                throw new utils_1.NotFoundError('Bank');
            }
            await this.bankRepository.deleteById(id);
            this.logInfo('Bank deleted successfully', { bankId: id });
        }
        catch (error) {
            this.handleError(error, 'Failed to delete bank');
        }
    }
    async getActiveBanks() {
        try {
            this.logInfo('Fetching active banks');
            const banks = await this.bankRepository.findAllActive();
            return banks.map(bank => bank.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch active banks');
        }
    }
}
exports.BankService = BankService;
