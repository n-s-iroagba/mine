"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningSubscriptionRepository = void 0;
const models_1 = require("../models");
const Miner_1 = __importDefault(require("../models/Miner"));
const BaseRepository_1 = require("./BaseRepository");
class MiningSubscriptionRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(models_1.MiningSubscription);
    }
    async findByMinerId(minerId) {
        try {
            return await this.findAll({
                where: { minerId },
            });
        }
        catch (error) {
            throw new Error(`Error finding subscriptions by miner ID ${minerId}: ${error}`);
        }
    }
    async findByIdWithDetails(id) {
        try {
            return await this.findOne({ id }, {
                include: [
                    {
                        association: 'miningContract',
                        include: ['miningServer'],
                    },
                    {
                        model: models_1.Transaction,
                        as: 'transactions',
                        where: {
                            entity: 'subscription',
                        },
                        required: false,
                    },
                ],
            });
        }
        catch (error) {
            throw new Error(`Error finding subscription by ID ${id} with details: ${error}`);
        }
    }
    async findAllWithDetails() {
        try {
            return await this.findAll({
                include: [
                    {
                        association: 'miningContract',
                        include: ['miningServer'],
                    },
                    {
                        model: models_1.Transaction,
                        as: 'transactions',
                        where: {
                            entity: 'subscription',
                        },
                        required: false,
                    }, {
                        model: Miner_1.default,
                        as: 'miner'
                    }
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding all subscriptions with details: ${error}`);
        }
    }
    async findByMinerIdWithDetails(minerId) {
        try {
            return await this.findAll({
                where: { minerId },
                include: [
                    {
                        association: 'miningContract',
                        include: ['miningServer'],
                    },
                    {
                        model: models_1.Transaction,
                        as: 'transactions',
                        where: {
                            entity: 'subscription',
                            minerId: minerId
                        },
                        required: false,
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding subscriptions by miner ID ${minerId} with details: ${error}`);
        }
    }
    async updateEarnings(id, earnings) {
        try {
            return await this.update(id, { earnings });
        }
        catch (error) {
            throw new Error(`Error updating earnings for subscription ${id}: ${error}`);
        }
    }
}
exports.MiningSubscriptionRepository = MiningSubscriptionRepository;
