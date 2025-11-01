"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningServerService = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("./utils");
class MiningServerService extends utils_1.BaseService {
    constructor() {
        super('MiningServerService');
        this.miningServerRepository = new repositories_1.MiningServerRepository();
    }
    async createServer(serverData) {
        try {
            this.logInfo('Creating mining server', { name: serverData.name });
            this.validateRequiredFields(serverData, ['name', 'hashRate', 'powerConsumptionInKwH']);
            // Check if server name already exists
            const existingServer = await this.miningServerRepository.findByName(serverData.name);
            if (existingServer) {
                throw new utils_1.ConflictError('Mining server with this name already exists');
            }
            const server = await this.miningServerRepository.create(serverData);
            this.logInfo('Mining server created successfully', { serverId: server.id });
            return server.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to create mining server');
        }
    }
    async getAllServers() {
        try {
            this.logInfo('Fetching all mining servers');
            const servers = await this.miningServerRepository.findAll({
                order: [['name', 'ASC']],
            });
            return servers.map(server => server.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch mining servers');
        }
    }
    async getServerById(id) {
        try {
            this.logInfo('Fetching mining server by ID', { serverId: id });
            const server = await this.miningServerRepository.findById(id);
            if (!server) {
                throw new utils_1.NotFoundError('Mining server');
            }
            return server.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch mining server');
        }
    }
    async updateServer(id, updateData) {
        try {
            this.logInfo('Updating mining server', { serverId: id, updateData });
            const server = await this.miningServerRepository.findById(id);
            if (!server) {
                throw new utils_1.NotFoundError('Mining server');
            }
            const allowedFields = ['name', 'hashRate', 'powerConsumptionInKwH', 'isActive'];
            const sanitizedData = this.sanitizeData(updateData, allowedFields);
            // Check if new name already exists
            if (sanitizedData.name && sanitizedData.name !== server.name) {
                const existingServer = await this.miningServerRepository.findByName(sanitizedData.name);
                if (existingServer) {
                    throw new utils_1.ConflictError('Mining server with this name already exists');
                }
            }
            const updatedServer = await this.miningServerRepository.update(id, sanitizedData);
            if (!updatedServer) {
                throw new utils_1.AppError('Failed to update mining server');
            }
            return updatedServer.get({ plain: true });
        }
        catch (error) {
            this.handleError(error, 'Failed to update mining server');
        }
    }
    async deleteServer(id) {
        try {
            this.logInfo('Deleting mining server', { serverId: id });
            const server = await this.miningServerRepository.findById(id);
            if (!server) {
                throw new utils_1.NotFoundError('Mining server');
            }
            await this.miningServerRepository.deleteById(id);
            this.logInfo('Mining server deleted successfully', { serverId: id });
        }
        catch (error) {
            this.handleError(error, 'Failed to delete mining server');
        }
    }
    async getAllServersWithContracts() {
        try {
            this.logInfo('Fetching all mining servers with contracts');
            const servers = await this.miningServerRepository.findAllWithContracts();
            return servers.map(server => server.get({ plain: true }));
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch mining servers with contracts');
        }
    }
}
exports.MiningServerService = MiningServerService;
