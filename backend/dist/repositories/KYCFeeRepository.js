"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCFeeRepository = void 0;
const models_1 = require("../models");
const BaseRepository_1 = require("./BaseRepository");
class KYCFeeRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(models_1.KYCFee);
    }
    async findByMinerId(minerId) {
        try {
            return await this.findOne({ minerId }, { include: [
                    {
                        association: 'miner',
                        attributes: ['id', 'email', 'firstname', 'lastname'],
                    },
                ],
            });
        }
        catch (error) {
            throw new Error(`Error finding KYC fee by miner ID ${minerId}: ${error}`);
        }
    }
    async findByPaidStatus(isPaid) {
        try {
            return await this.findAll({
                where: { isPaid },
                include: [
                    {
                        association: 'miner',
                        attributes: ['id', 'email', 'firstname', 'lastname'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding KYC fees by paid status ${isPaid}: ${error}`);
        }
    }
    async markAsPaid(id) {
        try {
            return await this.update(id, {
                isPaid: true,
                paidAt: new Date(),
            });
        }
        catch (error) {
            throw new Error(`Error marking KYC fee as paid for ID ${id}: ${error}`);
        }
    }
    async findAllWithMiner() {
        try {
            return await this.findAll({
                include: [
                    {
                        association: 'miner',
                        attributes: ['id', 'email', 'firstname', 'lastname'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding all KYC fees with miner: ${error}`);
        }
    }
}
exports.KYCFeeRepository = KYCFeeRepository;
