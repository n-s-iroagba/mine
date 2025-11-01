"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCFeeController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
const validation_1 = require("../services/utils/helpers/validation");
const zod_1 = require("zod");
const createKYCFeeSchema = zod_1.z.object({
    minerId: zod_1.z.number().int().positive('Miner ID must be positive'),
    amount: zod_1.z.number().positive('Amount must be positive'),
});
class KYCFeeController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.createKYCFee = async (req, res) => {
            try {
                const validatedData = (0, validation_1.validateData)(createKYCFeeSchema, req.body);
                const kycFee = await this.kycFeeService.createKYCFee(req.body);
                return this.created(res, 'KYC fee created successfully', kycFee);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to create KYC fee');
            }
        };
        this.getAllKYCFees = async (req, res) => {
            try {
                const kycFees = await this.kycFeeService.getAllKYCFees();
                return this.success(res, 'KYC fees retrieved successfully', kycFees);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC fees');
            }
        };
        this.getKYCFeeById = async (req, res) => {
            try {
                const feeId = parseInt(req.params.id);
                const kycFee = await this.kycFeeService.getKYCFeeById(feeId);
                return this.success(res, 'KYC fee retrieved successfully', kycFee);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC fee');
            }
        };
        this.getKYCFeeByMinerId = async (req, res) => {
            try {
                const minerId = parseInt(req.params.minerId);
                const currentUserId = this.getUserId(req);
                const currentUserRole = this.getUserRole(req);
                // Miners can only view their own KYC fee
                if (currentUserRole === 'miner' && currentUserId !== minerId) {
                    return this.error(res, 'Access denied', 403);
                }
                const kycFee = await this.kycFeeService.getKYCFeeByMinerId(minerId);
                return this.success(res, 'KYC fee retrieved successfully', kycFee);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC fee by miner ID');
            }
        };
        this.markFeeAsPaid = async (req, res) => {
            try {
                const feeId = parseInt(req.params.id);
                const kycFee = await this.kycFeeService.markFeeAsPaid(feeId);
                return this.success(res, 'KYC fee marked as paid successfully', kycFee);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to mark KYC fee as paid');
            }
        };
        this.getUnpaidFees = async (req, res) => {
            try {
                const unpaidFees = await this.kycFeeService.getUnpaidFees();
                return this.success(res, 'Unpaid KYC fees retrieved successfully', unpaidFees);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve unpaid KYC fees');
            }
        };
        this.getPaidFees = async (req, res) => {
            try {
                const paidFees = await this.kycFeeService.getPaidFees();
                return this.success(res, 'Paid KYC fees retrieved successfully', paidFees);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve paid KYC fees');
            }
        };
        this.getKYCFeeStats = async (req, res) => {
            try {
                const stats = await this.kycFeeService.getKYCFeeStats();
                return this.success(res, 'KYC fee statistics retrieved successfully', stats);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC fee statistics');
            }
        };
        this.kycFeeService = new services_1.KYCFeeService();
    }
}
exports.KYCFeeController = KYCFeeController;
