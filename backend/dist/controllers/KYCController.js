"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
const zod_1 = require("zod");
const createKYCSchema = zod_1.z.object({
    minerId: zod_1.z.number().int().positive('Miner ID must be positive'),
    idCard: zod_1.z.string().min(1, 'ID card is required'),
});
class KYCController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.createKYCRequest = async (req, res) => {
            try {
                const kyc = await this.kycService.createKYCRequest(req.body);
                return this.created(res, 'KYC request created successfully', kyc);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to create KYC request');
            }
        };
        this.getAllKYCRequests = async (req, res) => {
            try {
                const kycRequests = await this.kycService.getAllKYCRequests();
                return this.success(res, 'KYC requests retrieved successfully', kycRequests);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC requests');
            }
        };
        this.getKYCRequestById = async (req, res) => {
            try {
                const kycId = parseInt(req.params.id);
                const kyc = await this.kycService.getKYCRequestById(kycId);
                return this.success(res, 'KYC request retrieved successfully', kyc);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC request');
            }
        };
        this.getKYCByMinerId = async (req, res) => {
            try {
                const minerId = parseInt(req.params.minerId);
                const currentUserId = this.getUserId(req);
                const currentUserRole = this.getUserRole(req);
                // Miners can only view their own KYC
                if (currentUserRole === 'miner' && currentUserId !== minerId) {
                    return this.error(res, 'Access denied', 403);
                }
                const kyc = await this.kycService.getKYCByMinerId(minerId);
                return this.success(res, 'KYC retrieved successfully', kyc);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC by miner ID');
            }
        };
        this.updateKYCStatus = async (req, res) => {
            try {
                const kycId = parseInt(req.params.id);
                const validatedData = {
                    ...req.body,
                    reviewedBy: this.getUserId(req), // Automatically set the reviewer to the current admin
                };
                const kyc = await this.kycService.updateKYCStatus(kycId, req.body);
                return this.success(res, 'KYC status updated successfully', kyc);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to update KYC status');
            }
        };
        this.getKYCByStatus = async (req, res) => {
            try {
                const status = req.params.status;
                const kycRequests = await this.kycService.getKYCByStatus(status);
                return this.success(res, 'KYC requests retrieved successfully', kycRequests);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC requests by status');
            }
        };
        this.getKYCStats = async (req, res) => {
            try {
                const stats = await this.kycService.getKYCStats();
                return this.success(res, 'KYC statistics retrieved successfully', stats);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve KYC statistics');
            }
        };
        this.kycService = new services_1.KYCService();
    }
}
exports.KYCController = KYCController;
