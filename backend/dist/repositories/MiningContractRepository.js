"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningContractRepository = void 0;
const models_1 = require("../models");
const BaseRepository_1 = __importDefault(require("./BaseRepository"));
class MiningContractRepository extends BaseRepository_1.default {
    constructor() {
        super(models_1.MiningContract);
    }
    async findByServerId(serverId) {
        try {
            return await this.findAll({
                where: { miningServerId: serverId },
                include: ['miningServer'],
            });
        }
        catch (error) {
            throw new Error(`Error finding contracts by server ID ${serverId}: ${error}`);
        }
    }
    async findByIdWithServer(id) {
        try {
            return await this.findOne({ id }, { include: ['miningServer'],
            });
        }
        catch (error) {
            throw new Error(`Error finding contract by ID ${id} with server: ${error}`);
        }
    }
    async findAllWithServer() {
        try {
            return await this.findAll({
                include: ['miningServer'],
                order: [['createdAt', 'DESC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding all contracts with server: ${error}`);
        }
    }
    async findByPeriod(period) {
        try {
            return await this.findAll({
                where: { period },
                include: ['miningServer'],
            });
        }
        catch (error) {
            throw new Error(`Error finding contracts by period ${period}: ${error}`);
        }
    }
}
exports.MiningContractRepository = MiningContractRepository;
