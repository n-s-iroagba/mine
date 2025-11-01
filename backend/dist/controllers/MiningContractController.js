"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningContractController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
const validation_1 = require("../services/utils/helpers/validation");
const zod_1 = require("zod");
const createMiningContractSchema = zod_1.z.object({
    miningServerId: zod_1.z.number().int().positive('Mining server ID must be positive'),
    periodReturn: zod_1.z.number().positive('Period return must be positive'),
    period: zod_1.z.enum(['daily', 'weekly', 'fortnightly', 'monthly']),
});
class MiningContractController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.createContract = async (req, res) => {
            try {
                const validatedData = (0, validation_1.validateData)(createMiningContractSchema, req.body);
                const contract = await this.miningContractService.createContract(req.body);
                return this.created(res, 'Mining contract created successfully', contract);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to create mining contract');
            }
        };
        this.getAllContracts = async (_, res) => {
            try {
                const contracts = await this.miningContractService.getAllContracts();
                return this.success(res, 'Mining contracts retrieved successfully', contracts);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve mining contracts');
            }
        };
        this.getContractById = async (req, res) => {
            try {
                const contractId = parseInt(req.params.id);
                const contract = await this.miningContractService.getContractById(contractId);
                return this.success(res, 'Mining contract retrieved successfully', contract);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve mining contract');
            }
        };
        this.updateContract = async (req, res) => {
            try {
                const contractId = parseInt(req.params.id);
                const contract = await this.miningContractService.updateContract(contractId, req.body);
                return this.success(res, 'Mining contract updated successfully', contract);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to update mining contract');
            }
        };
        this.deleteContract = async (req, res) => {
            try {
                const contractId = parseInt(req.params.id);
                await this.miningContractService.deleteContract(contractId);
                return this.success(res, 'Mining contract deleted successfully');
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to delete mining contract');
            }
        };
        this.getContractsByServerId = async (req, res) => {
            try {
                const serverId = parseInt(req.params.serverId);
                const contracts = await this.miningContractService.getContractsByServerId(serverId);
                return this.success(res, 'Contracts retrieved successfully', contracts);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve contracts by server ID');
            }
        };
        this.getContractsByPeriod = async (req, res) => {
            try {
                const period = req.params.period;
                const contracts = await this.miningContractService.getContractsByPeriod(period);
                return this.success(res, 'Contracts retrieved successfully', contracts);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve contracts by period');
            }
        };
        this.miningContractService = new services_1.MiningContractService();
    }
}
exports.MiningContractController = MiningContractController;
