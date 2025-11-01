"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWalletRepository = void 0;
const models_1 = require("../models");
const BaseRepository_1 = require("./BaseRepository");
class AdminWalletRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(models_1.AdminWallet);
    }
    async findByCurrency(currency) {
        try {
            return await this.findOne({
                currency,
            });
        }
        catch (error) {
            throw new Error(`Error finding wallet by currency ${currency}: ${error}`);
        }
    }
    async findByAddress(address) {
        try {
            return await this.findOne({ address });
        }
        catch (error) {
            throw new Error(`Error finding wallet by address ${address}: ${error}`);
        }
    }
    async findAllActive() {
        try {
            return await this.findAll({
                where: { isActive: true },
                order: [['currency', 'ASC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding active wallets: ${error}`);
        }
    }
}
exports.AdminWalletRepository = AdminWalletRepository;
