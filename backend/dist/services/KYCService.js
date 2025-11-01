"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("./utils");
const Miner_1 = __importDefault(require("../models/Miner"));
const User_1 = __importDefault(require("../models/User"));
class KYCService extends utils_1.BaseService {
    constructor() {
        super('KYCService');
        this.kycRepository = new repositories_1.KYCRepository();
        this.userRepository = new repositories_1.UserRepository();
        this.kycFeeRepository = new repositories_1.KYCFeeRepository();
    }
    async createKYCRequest(kycData) {
        try {
            this.logInfo('Creating KYC request', { minerId: kycData.minerId });
            this.validateRequiredFields(kycData, ['minerId', 'idCard']);
            // Validate miner exists and is a miner
            const miner = await this.userRepository.findById(kycData.minerId);
            if (!miner) {
                throw new utils_1.NotFoundError('Miner');
            }
            if (miner.role !== 'miner') {
                throw new utils_1.ValidationError('User is not a miner');
            }
            // Check if KYC already exists for this miner
            const existingKYC = await this.kycRepository.findByMinerId(kycData.minerId);
            if (existingKYC) {
                throw new utils_1.ConflictError('KYC request already exists for this miner');
            }
            const kyc = await this.kycRepository.create({
                ...kycData,
                status: 'pending',
            });
            // Create KYC fee record
            await this.kycFeeRepository.create({
                minerId: kycData.minerId,
                amount: 10.00, // Fixed KYC fee
                isPaid: false,
            });
            this.logInfo('KYC request created successfully', { kycId: kyc.id, minerId: kycData.minerId });
            return kyc.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to create KYC request');
        }
    }
    async getAllKYCRequests() {
        try {
            this.logInfo('Fetching all KYC requests');
            const kycRequests = await this.kycRepository.findAllWithMiner();
            return kycRequests.map(kyc => kyc.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch KYC requests');
        }
    }
    async getKYCRequestById(id) {
        try {
            this.logInfo('Fetching KYC request by ID', { kycId: id });
            const kyc = await this.kycRepository.findById(id);
            if (!kyc) {
                throw new utils_1.NotFoundError('KYC request');
            }
            return kyc.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch KYC request');
        }
    }
    async getKYCByMinerId(minerId) {
        try {
            this.logInfo('Fetching KYC by miner ID', { minerId });
            const miner = await this.userRepository.findById(minerId);
            if (!miner) {
                throw new utils_1.NotFoundError('Miner');
            }
            const kyc = await this.kycRepository.findByMinerId(minerId);
            return kyc ? kyc.get({ plain: true }) : null;
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch KYC by miner ID');
        }
    }
    async updateKYCStatus(id, statusData) {
        try {
            this.logInfo('Updating KYC status', { kycId: id, status: statusData.status });
            const kyc = await this.kycRepository.findById(id);
            if (!kyc) {
                throw new utils_1.NotFoundError('KYC request');
            }
            const updatedKYC = await this.kycRepository.updateStatus(id, statusData.status, statusData.reviewedBy, statusData.rejectionReason);
            if (!updatedKYC) {
                throw new utils_1.AppError('Failed to update KYC status');
            }
            // Send email notification for approved KYC
            if (statusData.status === 'successful') {
                const miner = await Miner_1.default.findByPk(kyc.minerId);
                const user = await User_1.default.findByPk(miner.userId);
                if (miner) {
                    await utils_1.EmailHelper.sendEmail({
                        to: user.email,
                        subject: 'KYC Verification Approved',
                        html: utils_1.EmailHelper.generateKYCApprovedEmail(`${miner.firstname} ${miner.lastname}`),
                    });
                }
            }
            return updatedKYC.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to update KYC status');
        }
    }
    async getKYCByStatus(status) {
        try {
            this.logInfo('Fetching KYC requests by status', { status });
            const kycRequests = await this.kycRepository.findByStatus(status);
            return kycRequests.map(kyc => kyc.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch KYC requests by status');
        }
    }
    async getKYCStats() {
        try {
            this.logInfo('Fetching KYC statistics');
            const pendingKYC = await this.kycRepository.findByStatus('pending');
            const successfulKYC = await this.kycRepository.findByStatus('successful');
            const failedKYC = await this.kycRepository.findByStatus('failed');
            return {
                totalKYC: pendingKYC.length + successfulKYC.length + failedKYC.length,
                pendingKYC: pendingKYC.length,
                successfulKYC: successfulKYC.length,
                failedKYC: failedKYC.length,
                approvalRate: (successfulKYC.length / (successfulKYC.length + failedKYC.length)) * 100 || 0,
            };
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch KYC statistics');
        }
    }
}
exports.KYCService = KYCService;
