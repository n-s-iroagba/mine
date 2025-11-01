"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankRepository = void 0;
const models_1 = require("../models");
const BaseRepository_1 = require("./BaseRepository");
class BankRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(models_1.Bank);
    }
    async findByAccountNumber(accountNumber) {
        try {
            return await this.findOne({
                accountNumber
            });
        }
        catch (error) {
            throw new Error(`Error finding bank by account number ${accountNumber}: ${error}`);
        }
    }
    async findByName(name) {
        try {
            return await this.findOne({
                name
            });
        }
        catch (error) {
            throw new Error(`Error finding bank by name ${name}: ${error}`);
        }
    }
    async findAllActive() {
        try {
            return await this.findAll({
                where: { isActive: true },
                order: [['name', 'ASC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding active banks: ${error}`);
        }
    }
}
exports.BankRepository = BankRepository;
