"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WithdrawalService_1 = __importDefault(require("../services/WithdrawalService"));
class WithdrawalController {
    constructor() {
        this.createWithdrawal = async (req, res) => {
            try {
                const data = {
                    ...req.body,
                    minerId: req.user.minerId, // From auth middleware
                };
                const withdrawal = await this.withdrawalService.createWithdrawal(data);
                res.status(201).json({
                    success: true,
                    data: withdrawal,
                    message: 'Withdrawal request created successfully',
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.getMinerWithdrawals = async (req, res) => {
            try {
                const minerId = req.user.minerId;
                const withdrawals = await this.withdrawalService.getMinerWithdrawals(minerId);
                res.json({
                    success: true,
                    data: withdrawals,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.getAllWithdrawals = async (req, res) => {
            try {
                const filters = req.query;
                const withdrawals = await this.withdrawalService.getAllWithdrawals(filters);
                res.json({
                    success: true,
                    data: withdrawals,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.getWithdrawalById = async (req, res) => {
            try {
                const { id } = req.params;
                const withdrawal = await this.withdrawalService.getWithdrawalById(parseInt(id));
                if (!withdrawal) {
                    res.status(404).json({
                        success: false,
                        message: 'Withdrawal not found',
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: withdrawal,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.updateWithdrawalStatus = async (req, res) => {
            try {
                const { id } = req.params;
                const data = {
                    ...req.body,
                    processedBy: req.user.id, // Admin user ID
                };
                const withdrawal = await this.withdrawalService.updateWithdrawalStatus(parseInt(id), data);
                if (!withdrawal) {
                    res.status(404).json({
                        success: false,
                        message: 'Withdrawal not found',
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: withdrawal,
                    message: 'Withdrawal status updated successfully',
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.cancelWithdrawal = async (req, res) => {
            try {
                const { id } = req.params;
                const minerId = req.user.minerId;
                const withdrawal = await this.withdrawalService.cancelWithdrawal(parseInt(id), minerId);
                if (!withdrawal) {
                    res.status(404).json({
                        success: false,
                        message: 'Withdrawal not found or cannot be cancelled',
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: withdrawal,
                    message: 'Withdrawal cancelled successfully',
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.getWithdrawalStats = async (_, res) => {
            try {
                const stats = await this.withdrawalService.getWithdrawalStats();
                res.json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.withdrawalService = new WithdrawalService_1.default();
    }
}
exports.default = WithdrawalController;
