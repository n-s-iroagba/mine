"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// repositories/WithdrawalRepository.ts
const WithdrawalRequest_1 = __importDefault(require("../models/WithdrawalRequest"));
const BaseRepository_1 = __importDefault(require("./BaseRepository"));
class WithdrawalRepository extends BaseRepository_1.default {
    constructor() {
        super(WithdrawalRequest_1.default);
    }
    async findAllWithFilters(filters = {}, options = {}) {
        const { status, minerId, type, startDate, endDate, ...otherFilters } = filters;
        const where = {};
        if (status)
            where.status = status;
        if (minerId)
            where.minerId = minerId;
        if (type)
            where.type = type;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.$gte = new Date(startDate);
            if (endDate)
                where.createdAt.$lte = new Date(endDate);
        }
        return this.findAll({
            where,
            ...options,
            ...otherFilters,
        });
    }
    async findByMinerId(minerId, options = {}) {
        return this.findAllWithFilters({ minerId }, options);
    }
    async findByStatus(status, options = {}) {
        return this.findAllWithFilters({ status }, options);
    }
    async getWithdrawalStats() {
        const result = await this.model.sequelize.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as "totalPending",
        COUNT(*) FILTER (WHERE status = 'approved') as "totalApproved",
        COUNT(*) FILTER (WHERE status = 'rejected') as "totalRejected",
        COUNT(*) FILTER (WHERE status = 'processing') as "totalProcessing",
        COUNT(*) FILTER (WHERE status = 'completed') as "totalCompleted",
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as "totalAmountPending",
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as "totalAmountCompleted"
      FROM withdrawals
    `);
        return result[0][0];
    }
}
exports.default = WithdrawalRepository;
