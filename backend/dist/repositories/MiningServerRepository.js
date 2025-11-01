"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningServerRepository = void 0;
const models_1 = require("../models");
const BaseRepository_1 = require("./BaseRepository");
class MiningServerRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(models_1.MiningServer);
    }
    async findByName(name) {
        try {
            return await this.findOne({ name });
        }
        catch (error) {
            throw new Error(`Error finding server by name ${name}: ${error}`);
        }
    }
    async findAllWithContracts() {
        try {
            return await this.findAll({
                include: [
                    {
                        association: 'miningContracts',
                        where: { isActive: true },
                        required: false,
                    },
                ],
                order: [['name', 'ASC']],
            });
        }
        catch (error) {
            throw new Error(`Error finding servers with contracts: ${error}`);
        }
    }
}
exports.MiningServerRepository = MiningServerRepository;
