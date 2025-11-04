"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCRepository = void 0;
const models_1 = require("../models");
const BaseRepository_1 = require("./BaseRepository");
class KYCRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(models_1.KYC);
    }
    async findByMinerId(minerId) {
        try {
            return await this.findOne({ minerId }, { include: [
                    {
                        association: 'miner',
                        attributes: ['id', 'email', 'firstname', 'lastname', 'phone'],
                    },
                ],
            });
        }
        catch (error) {
            throw new Error(`Error finding KYC by miner ID ${minerId}: ${error}`);
        }
    }
    async findByStatus(status) {
        try {
            return await this.findAll({
                where: { status },
                include: [
                    {
                        association: 'miner',
                    },
                    {
                        association: 'reviewer',
                        required: false,
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding KYC by status ${status}: ${error}`);
        }
    }
    async updateStatus(id, status, reviewedBy, rejectionReason) {
        try {
            const updateData = { status };
            if (status === 'successful' || status === 'failed') {
                updateData.reviewedAt = new Date();
                if (reviewedBy) {
                    updateData.reviewedBy = reviewedBy;
                }
            }
            if (status === 'failed' && rejectionReason) {
                updateData.rejectionReason = rejectionReason;
            }
            return await this.update(id, updateData);
        }
        catch (error) {
            throw new Error(`Error updating KYC status for ID ${id}: ${error}`);
        }
    }
    async findAllWithMiner() {
        try {
            return await this.findAll({
                include: [
                    {
                        association: 'miner',
                        attributes: ['id', 'email', 'firstname', 'lastname', 'phone'],
                    },
                    {
                        association: 'reviewer',
                        attributes: ['id', 'email', 'firstname', 'lastname'],
                        required: false,
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding all KYC with miner: ${error}`);
        }
    }
}
exports.KYCRepository = KYCRepository;
