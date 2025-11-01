"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningSubscriptionController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
const validation_1 = require("../services/utils/helpers/validation");
const zod_1 = require("zod");
const updateEarningsSchema = zod_1.z.object({
    earnings: zod_1.z.number().min(0, 'Earnings cannot be negative'),
});
class MiningSubscriptionController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.createSubscription = async (req, res) => {
            const { minerId } = req.params;
            try {
                const subscription = await this.miningSubscriptionService.createSubscription({ ...req.body, minerId });
                return this.created(res, 'Mining subscription created successfully', subscription);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to create mining subscription');
            }
        };
        this.getAllSubscriptions = async (req, res) => {
            try {
                const subscriptions = await this.miningSubscriptionService.getAllSubscriptions();
                return this.success(res, 'Mining subscriptions retrieved successfully', subscriptions);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve mining subscriptions');
            }
        };
        this.getSubscriptionById = async (req, res) => {
            try {
                const subscriptionId = parseInt(req.params.id);
                const subscription = await this.miningSubscriptionService.getSubscriptionById(subscriptionId);
                return this.success(res, 'Mining subscription retrieved successfully', subscription);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve mining subscription');
            }
        };
        this.getSubscriptionsByMinerId = async (req, res) => {
            try {
                const minerId = parseInt(req.params.minerId);
                const subscriptions = await this.miningSubscriptionService.getSubscriptionsByMinerId(minerId);
                return this.success(res, 'Subscriptions retrieved successfully', subscriptions);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve subscriptions by miner ID');
            }
        };
        this.updateEarnings = async (req, res) => {
            try {
                const subscriptionId = parseInt(req.params.id);
                const validatedData = (0, validation_1.validateData)(updateEarningsSchema, req.body);
                const subscription = await this.miningSubscriptionService.updateEarnings(subscriptionId, req.body);
                return this.success(res, 'Earnings updated successfully', subscription);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to update earnings');
            }
        };
        this.calculateEarnings = async (req, res) => {
            try {
                const subscriptionId = parseInt(req.params.id);
                const days = parseInt(req.query.days) || 1;
                const earnings = await this.miningSubscriptionService.calculateEarnings(subscriptionId, days);
                return this.success(res, 'Earnings calculated successfully', { earnings });
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to calculate earnings');
            }
        };
        this.getMinerDashboard = async (req, res) => {
            try {
                const minerId = parseInt(req.params.minerId);
                const dashboard = await this.miningSubscriptionService.getMinerDashboard(minerId);
                return this.success(res, 'Miner dashboard retrieved successfully', dashboard);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve miner dashboard');
            }
        };
        this.deactivateSubscription = async (req, res) => {
            try {
                const subscriptionId = parseInt(req.params.id);
                await this.miningSubscriptionService.deactivateSubscription(subscriptionId);
                return this.success(res, 'Subscription deactivated successfully');
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to deactivate subscription');
            }
        };
        this.processDailyEarnings = async (req, res) => {
            try {
                await this.miningSubscriptionService.processDailyEarnings();
                return this.success(res, 'Daily earnings processed successfully');
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to process daily earnings');
            }
        };
        this.miningSubscriptionService = new services_1.MiningSubscriptionService();
    }
}
exports.MiningSubscriptionController = MiningSubscriptionController;
