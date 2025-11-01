"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningSubscriptionService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("./utils");
const Miner_1 = __importDefault(require("../models/Miner"));
class MiningSubscriptionService extends utils_1.BaseService {
    constructor() {
        super('MiningSubscriptionService');
        this.miningSubscriptionRepository = new repositories_1.MiningSubscriptionRepository();
        this.miningContractRepository = new repositories_1.MiningContractRepository();
        this.userRepository = new repositories_1.UserRepository();
    }
    async createSubscription(subscriptionData) {
        try {
            this.logInfo('Creating mining subscription', {
                minerId: subscriptionData.minerId,
                contractId: subscriptionData.miningContractId
            });
            // Validate mining contract exists
            const miningContract = await this.miningContractRepository.findById(subscriptionData.miningContractId);
            if (!miningContract) {
                throw new utils_1.NotFoundError('Mining contract');
            }
            // Validate miner exists and is a miner
            const miner = await Miner_1.default.findByPk(subscriptionData.minerId);
            if (!miner) {
                console.log(await Miner_1.default.findAll(), subscriptionData.minerId);
                throw new utils_1.NotFoundError('Miner');
            }
            const subscription = await this.miningSubscriptionRepository.create({
                ...subscriptionData,
                shouldUpdateAutomatically: subscriptionData.shouldUpdateAutomatically ?? true,
                earnings: 0,
                amountDeposited: 0,
                currency: subscriptionData.currency
            });
            this.logInfo('Mining subscription created successfully', { subscriptionId: subscription.id });
            return subscription.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to create mining subscription');
        }
    }
    async getAllSubscriptions() {
        try {
            this.logInfo('Fetching all mining subscriptions');
            const subscriptions = await this.miningSubscriptionRepository.findAllWithDetails();
            return subscriptions.map(subscription => subscription.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch mining subscriptions');
        }
    }
    async getSubscriptionById(id) {
        try {
            this.logInfo('Fetching mining subscription by ID', { subscriptionId: id });
            const subscription = await this.miningSubscriptionRepository.findByIdWithDetails(id);
            if (!subscription) {
                throw new utils_1.NotFoundError('Mining subscription');
            }
            return subscription.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch mining subscription');
        }
    }
    async getSubscriptionsByMinerId(minerId) {
        try {
            this.logInfo('Fetching subscriptions by miner ID', { minerId });
            // Validate miner exists
            const miner = await this.userRepository.findById(minerId);
            if (!miner) {
                throw new utils_1.NotFoundError('Miner');
            }
            const subscriptions = await this.miningSubscriptionRepository.findByMinerIdWithDetails(minerId);
            return subscriptions.map(subscription => subscription.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch subscriptions by miner ID');
        }
    }
    async updateEarnings(id, earningsData) {
        try {
            this.logInfo('Updating subscription earnings', { subscriptionId: id, earnings: earningsData.earnings });
            const subscription = await this.miningSubscriptionRepository.findById(id);
            if (!subscription) {
                throw new utils_1.NotFoundError('Mining subscription');
            }
            if (earningsData.earnings < 0) {
                throw new utils_1.ValidationError('Earnings cannot be negative');
            }
            const updatedSubscription = await this.miningSubscriptionRepository.updateEarnings(id, earningsData.earnings);
            if (!updatedSubscription) {
                throw new utils_1.AppError('Failed to update subscription earnings');
            }
            return updatedSubscription.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to update subscription earnings');
        }
    }
    async calculateEarnings(id, days = 1) {
        try {
            this.logInfo('Calculating earnings for subscription', { subscriptionId: id, days });
            const subscription = await this.miningSubscriptionRepository.findByIdWithDetails(id);
            if (!subscription) {
                throw new utils_1.NotFoundError('Mining subscription');
            }
            const miningContract = subscription.miningContract;
            if (!miningContract) {
                throw new utils_1.AppError('Mining contract not found for subscription');
            }
            const earnings = utils_1.CalculationHelper.calculateEarnings(subscription.amountDeposited, miningContract.periodReturn, miningContract.period, days);
            this.logInfo('Earnings calculated', { subscriptionId: id, earnings });
            return earnings;
        }
        catch (error) {
            this.handleError(error, 'Failed to calculate earnings');
        }
    }
    async processDailyEarnings() {
        try {
            this.logInfo('Processing daily earnings for all active subscriptions');
            const activeSubscriptions = await this.miningSubscriptionRepository.findAll({
                where: { isActive: true, shouldUpdateAutomatically: true },
                include: ['miningContract'],
            });
            let processedCount = 0;
            for (const subscription of activeSubscriptions) {
                try {
                    const miningContract = subscription.miningContract;
                    if (!miningContract)
                        continue;
                    const dailyEarnings = utils_1.CalculationHelper.calculateEarnings(subscription.amountDeposited, miningContract.periodReturn, miningContract.period, 1);
                    const newEarnings = subscription.earnings + dailyEarnings;
                    await this.miningSubscriptionRepository.updateEarnings(subscription.id, newEarnings);
                    processedCount++;
                }
                catch (error) {
                    this.logError(`Failed to process earnings for subscription ${subscription.id}`, error);
                }
            }
            this.logInfo('Daily earnings processing completed', { processedCount, total: activeSubscriptions.length });
        }
        catch (error) {
            this.handleError(error, 'Failed to process daily earnings');
        }
    }
    async getMinerDashboard(minerId) {
        try {
            this.logInfo('Generating miner dashboard', { minerId });
            const subscriptions = await this.miningSubscriptionRepository.findByMinerIdWithDetails(minerId);
            const totalDeposits = utils_1.CalculationHelper.calculateTotalDeposits(subscriptions);
            const totalEarnings = utils_1.CalculationHelper.calculateTotalEarnings(subscriptions);
            const netProfit = utils_1.CalculationHelper.calculateNetProfit(totalEarnings, totalDeposits);
            const overallROI = utils_1.CalculationHelper.calculateROI(totalEarnings, totalDeposits);
            const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
            const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive);
            return {
                summary: {
                    totalSubscriptions: subscriptions.length,
                    activeSubscriptions: activeSubscriptions.length,
                    inactiveSubscriptions: inactiveSubscriptions.length,
                    totalDeposits,
                    totalEarnings,
                    netProfit,
                    overallROI,
                },
                subscriptions: subscriptions.map(sub => ({
                    id: sub.id,
                    amountDeposited: sub.amountDeposited,
                    earnings: sub.earnings,
                    isActive: sub.isActive,
                    createdAt: sub.createdAt,
                    miningContract: sub.miningContract,
                })),
            };
        }
        catch (error) {
            this.handleError(error, 'Failed to generate miner dashboard');
        }
    }
    async deactivateSubscription(id) {
        try {
            this.logInfo('Deactivating mining subscription', { subscriptionId: id });
            const subscription = await this.miningSubscriptionRepository.findById(id);
            if (!subscription) {
                throw new utils_1.NotFoundError('Mining subscription');
            }
            await this.miningSubscriptionRepository.update(id, { isActive: false });
            this.logInfo('Mining subscription deactivated successfully', { subscriptionId: id });
        }
        catch (error) {
            this.handleError(error, 'Failed to deactivate mining subscription');
        }
    }
}
exports.MiningSubscriptionService = MiningSubscriptionService;
