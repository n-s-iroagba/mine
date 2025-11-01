"use strict";
// services/WithdrawalService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MiningSubscription_1 = __importDefault(require("../models/MiningSubscription"));
const Miner_1 = __importDefault(require("../models/Miner"));
const User_1 = __importDefault(require("../models/User"));
const WithdrawalRequestRepository_1 = __importDefault(require("../repositories/WithdrawalRequestRepository"));
class WithdrawalService {
    constructor() {
        this.withdrawalRepository = new WithdrawalRequestRepository_1.default();
    }
    async createWithdrawal(data) {
        // Validate subscription and miner
        const subscription = await MiningSubscription_1.default.findOne({
            where: { id: data.subscriptionId, minerId: data.minerId },
            include: [{
                    model: Miner_1.default,
                    as: 'miner',
                }],
        });
        if (!subscription) {
            throw new Error('Subscription not found or does not belong to miner');
        }
        // Validate withdrawal amount
        if (data.type === 'deposit' && data.amount > subscription.amountDeposited) {
            throw new Error('Withdrawal amount exceeds available deposit');
        }
        if (data.type === 'earnings' && data.amount > subscription.earnings) {
            throw new Error('Withdrawal amount exceeds available earnings');
        }
        if (data.amount <= 0) {
            throw new Error('Withdrawal amount must be greater than 0');
        }
        const withdrawalData = {
            ...data,
            status: 'pending',
        };
        return this.withdrawalRepository.create(withdrawalData);
    }
    async getWithdrawalById(id) {
        return this.withdrawalRepository.findById(id, {
            include: [
                {
                    model: Miner_1.default,
                    as: 'miner',
                    include: [{
                            model: User_1.default,
                            as: 'user',
                            attributes: ['id', 'username', 'email'],
                        }],
                },
                {
                    model: MiningSubscription_1.default,
                    as: 'subscription',
                    attributes: ['id', 'miningContractId', 'amountDeposited', 'earnings', 'isActive'],
                },
            ],
        });
    }
    async getMinerWithdrawals(minerId) {
        return this.withdrawalRepository.findByMinerId(minerId, {
            include: [{
                    model: MiningSubscription_1.default,
                    as: 'subscription',
                    attributes: ['id', 'miningContractId'],
                }],
            order: [['createdAt', 'DESC']],
        });
    }
    async getAllWithdrawals(filters) {
        return this.withdrawalRepository.findAllWithFilters(filters, {
            include: [
                {
                    model: Miner_1.default,
                    as: 'miner',
                    include: [{
                            model: User_1.default,
                            as: 'user',
                            attributes: ['id', 'username', 'email'],
                        }],
                },
                {
                    model: MiningSubscription_1.default,
                    as: 'subscription',
                    attributes: ['id', 'miningContractId'],
                },
                {
                    model: User_1.default,
                    as: 'processor',
                    attributes: ['id', 'username'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
    async updateWithdrawalStatus(id, data) {
        const withdrawal = await this.getWithdrawalById(id);
        if (!withdrawal) {
            throw new Error('Withdrawal not found');
        }
        // If approving, validate that subscription has sufficient funds
        if (data.status === 'approved' && withdrawal.status === 'pending') {
            const subscription = await MiningSubscription_1.default.findByPk(withdrawal.subscriptionId);
            if (!subscription) {
                throw new Error('Subscription not found');
            }
            if (withdrawal.type === 'deposit' && withdrawal.amount > subscription.amountDeposited) {
                throw new Error('Insufficient deposit balance for withdrawal');
            }
            if (withdrawal.type === 'earnings' && withdrawal.amount > subscription.earnings) {
                throw new Error('Insufficient earnings balance for withdrawal');
            }
        }
        return this.withdrawalRepository.update(id, data);
    }
    async getWithdrawalStats() {
        return this.withdrawalRepository.getWithdrawalStats();
    }
    async cancelWithdrawal(id, minerId) {
        const withdrawal = await this.withdrawalRepository.findOne({
            id,
            minerId,
            status: 'pending',
        });
        if (!withdrawal) {
            throw new Error('Withdrawal not found or cannot be cancelled');
        }
        return this.withdrawalRepository.update(id, { status: 'rejected', rejectionReason: 'Cancelled by user' });
    }
}
exports.default = WithdrawalService;
