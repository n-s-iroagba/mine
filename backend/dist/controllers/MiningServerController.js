"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningServerController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
const validation_1 = require("../services/utils/helpers/validation");
const zod_1 = require("zod");
const createMiningServerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    hashRate: zod_1.z.string().min(1, 'Hash rate is required'),
    powerConsumptionInKwH: zod_1.z.string().min(1, 'Power consumption is required'),
});
class MiningServerController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.createServer = async (req, res) => {
            try {
                const validatedData = (0, validation_1.validateData)(createMiningServerSchema, req.body);
                const server = await this.miningServerService.createServer(req.body);
                return this.created(res, 'Mining server created successfully', server);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to create mining server');
            }
        };
        this.getAllServers = async (_, res) => {
            try {
                const servers = await this.miningServerService.getAllServers();
                return this.success(res, 'Mining servers retrieved successfully', servers);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve mining servers');
            }
        };
        this.getServerById = async (req, res) => {
            try {
                const serverId = parseInt(req.params.id);
                const server = await this.miningServerService.getServerById(serverId);
                return this.success(res, 'Mining server retrieved successfully', server);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve mining server');
            }
        };
        this.updateServer = async (req, res) => {
            try {
                const serverId = parseInt(req.params.id);
                const server = await this.miningServerService.updateServer(serverId, req.body);
                return this.success(res, 'Mining server updated successfully', server);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to update mining server');
            }
        };
        this.deleteServer = async (req, res) => {
            try {
                const serverId = parseInt(req.params.id);
                await this.miningServerService.deleteServer(serverId);
                return this.success(res, 'Mining server deleted successfully');
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to delete mining server');
            }
        };
        this.getAllServersWithContracts = async (_, res) => {
            try {
                const servers = await this.miningServerService.getAllServersWithContracts();
                return this.success(res, 'Mining servers with contracts retrieved successfully', servers);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve mining servers with contracts');
            }
        };
        this.miningServerService = new services_1.MiningServerService();
    }
}
exports.MiningServerController = MiningServerController;
