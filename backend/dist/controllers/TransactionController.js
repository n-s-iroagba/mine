"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
const validation_1 = require("../services/utils/helpers/validation");
const zod_1 = require("zod");
const createTransactionSchema = zod_1.z.object({
    amountInUSD: zod_1.z.number().positive('Amount must be positive'),
    entityId: zod_1.z.number().int().positive('Entity ID must be positive'),
    entity: zod_1.z.enum(['subscription', 'kyc']),
    minerId: zod_1.z.number().int().positive('Miner ID must be positive'),
});
const updateTransactionStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['initialized', 'pending', 'successful', 'failed']),
});
class TransactionController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.createTransaction = async (req, res) => {
            try {
                const validatedData = (0, validation_1.validateData)(createTransactionSchema, req.body);
                const transaction = await this.transactionService.createTransaction(req.body);
                return this.created(res, 'Transaction created successfully', transaction);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to create transaction');
            }
        };
        this.getAllTransactions = async (req, res) => {
            try {
                const transactions = await this.transactionService.getAllTransactions();
                return this.success(res, 'Transactions retrieved successfully', transactions);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve transactions');
            }
        };
        this.getTransactionById = async (req, res) => {
            try {
                const transactionId = parseInt(req.params.id);
                const transaction = await this.transactionService.getTransactionById(transactionId);
                return this.success(res, 'Transaction retrieved successfully', transaction);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve transaction');
            }
        };
        this.getTransactionsByMinerId = async (req, res) => {
            try {
                const minerId = parseInt(req.params.minerId);
                const currentUserId = this.getUserId(req);
                const currentUserRole = this.getUserRole(req);
                // Miners can only view their own transactions
                if (currentUserRole === 'miner' && currentUserId !== minerId) {
                    return this.error(res, 'Access denied', 403);
                }
                const transactions = await this.transactionService.getTransactionsByMinerId(minerId);
                return this.success(res, 'Transactions retrieved successfully', transactions);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve transactions by miner ID');
            }
        };
        this.updateTransactionStatus = async (req, res) => {
            try {
                const transactionId = parseInt(req.params.id);
                const validatedData = (0, validation_1.validateData)(updateTransactionStatusSchema, req.body);
                const transaction = await this.transactionService.updateTransactionStatus(transactionId, req.body);
                return this.success(res, 'Transaction status updated successfully', transaction);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to update transaction status');
            }
        };
        this.getTransactionsByStatus = async (req, res) => {
            try {
                const status = req.params.status;
                const transactions = await this.transactionService.getTransactionsByStatus(status);
                return this.success(res, 'Transactions retrieved successfully', transactions);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve transactions by status');
            }
        };
        this.getTransactionStats = async (req, res) => {
            try {
                const stats = await this.transactionService.getTransactionStats();
                return this.success(res, 'Transaction statistics retrieved successfully', stats);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve transaction statistics');
            }
        };
        this.transactionService = new services_1.TransactionService();
    }
}
exports.TransactionController = TransactionController;
