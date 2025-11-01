"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningContractService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("./utils");
const utils_2 = require("../services/utils");
class MiningContractService extends utils_1.BaseService {
    constructor() {
        super('MiningContractService');
        this.miningContractRepository = new repositories_1.MiningContractRepository();
        this.miningServerRepository = new repositories_1.MiningServerRepository();
    }
    async createContract(contractData) {
        try {
            this.logInfo('Creating mining contract', {
                serverId: contractData.miningServerId,
                period: contractData.period
            });
            this.validateRequiredFields(contractData, ['miningServerId', 'periodReturn', 'period']);
            // Validate mining server exists
            const miningServer = await this.miningServerRepository.findById(contractData.miningServerId);
            if (!miningServer) {
                throw new utils_2.NotFoundError('Mining server');
            }
            // Validate period return is positive
            if (contractData.periodReturn <= 0) {
                throw new utils_2.ValidationError('Period return must be positive');
            }
            const contract = await this.miningContractRepository.create(contractData);
            this.logInfo('Mining contract created successfully', { contractId: contract.id });
            return contract.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to create mining contract');
        }
    }
    async getAllContracts() {
        try {
            this.logInfo('Fetching all mining contracts');
            const contracts = await this.miningContractRepository.findAllWithServer();
            return contracts.map(contract => contract.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch mining contracts');
        }
    }
    async getContractById(id) {
        try {
            this.logInfo('Fetching mining contract by ID', { contractId: id });
            const contract = await this.miningContractRepository.findByIdWithServer(id);
            if (!contract) {
                throw new utils_2.NotFoundError('Mining contract');
            }
            return contract.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch mining contract');
        }
    }
    async updateContract(id, updateData) {
        try {
            this.logInfo('Updating mining contract', { contractId: id, updateData });
            const contract = await this.miningContractRepository.findById(id);
            if (!contract) {
                throw new utils_2.NotFoundError('Mining contract');
            }
            const allowedFields = ['miningServerId', 'periodReturn', 'period', 'isActive'];
            const sanitizedData = this.sanitizeData(updateData, allowedFields);
            // Validate mining server exists if provided
            if (sanitizedData.miningServerId) {
                const miningServer = await this.miningServerRepository.findById(sanitizedData.miningServerId);
                if (!miningServer) {
                    throw new utils_2.NotFoundError('Mining server');
                }
            }
            // Validate period return is positive if provided
            if (sanitizedData.periodReturn !== undefined && sanitizedData.periodReturn <= 0) {
                throw new utils_2.ValidationError('Period return must be positive');
            }
            const updatedContract = await this.miningContractRepository.update(id, sanitizedData);
            if (!updatedContract) {
                throw new utils_2.AppError('Failed to update mining contract');
            }
            return updatedContract.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to update mining contract');
        }
    }
    async deleteContract(id) {
        try {
            this.logInfo('Deleting mining contract', { contractId: id });
            const contract = await this.miningContractRepository.findById(id);
            if (!contract) {
                throw new utils_2.NotFoundError('Mining contract');
            }
            await this.miningContractRepository.deleteById(id);
            this.logInfo('Mining contract deleted successfully', { contractId: id });
        }
        catch (error) {
            this.handleError(error, 'Failed to delete mining contract');
        }
    }
    async getContractsByServerId(serverId) {
        try {
            this.logInfo('Fetching contracts by server ID', { serverId });
            const contracts = await this.miningContractRepository.findByServerId(serverId);
            return contracts.map(contract => contract.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch contracts by server ID');
        }
    }
    async getContractsByPeriod(period) {
        try {
            this.logInfo('Fetching contracts by period', { period });
            const contracts = await this.miningContractRepository.findByPeriod(period);
            return contracts.map(contract => contract.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch contracts by period');
        }
    }
}
exports.MiningContractService = MiningContractService;
