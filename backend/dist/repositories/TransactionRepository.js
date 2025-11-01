"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const models_1 = require("../models");
const BaseRepository_1 = require("./BaseRepository");
class TransactionRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(models_1.Transaction);
    }
    async findByMinerId(minerId) {
        try {
            return await this.findAll({
                where: { minerId },
                include: [
                    {
                        association: 'miner',
                        attributes: ['id', 'email', 'firstName', 'lastName'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding transactions by miner ID ${minerId}: ${error}`);
        }
    }
    async findByStatus(status) {
        try {
            return await this.findAll({
                where: { status },
                include: [
                    {
                        association: 'miner',
                        attributes: ['id', 'email', 'firstName', 'lastName'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding transactions by status ${status}: ${error}`);
        }
    }
    async updateStatus(id, status) {
        try {
            return await this.update(id, { status });
        }
        catch (error) {
            throw new Error(`Error updating status for transaction ${id}: ${error}`);
        }
    }
    async findAllWithMiner() {
        try {
            return await this.findAll({
                include: [
                    {
                        association: 'miner',
                        attributes: ['id', 'email', 'firstName', 'lastName'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding all transactions with miner: ${error}`);
        }
    }
}
exports.TransactionRepository = TransactionRepository;
