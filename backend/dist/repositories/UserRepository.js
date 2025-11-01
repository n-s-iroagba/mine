"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const models_1 = require("../models");
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(models_1.User);
    }
    async findByEmail(email) {
        try {
            return await this.findOne({ email });
        }
        catch (error) {
            throw new Error(`Error finding user by email ${email}: ${error}`);
        }
    }
    async findMiners(options) {
        try {
            const minerOptions = {
                where: { role: 'miner' },
                ...options,
            };
            return await this.findAll(minerOptions);
        }
        catch (error) {
            throw new Error(`Error finding miners: ${error}`);
        }
    }
    async findAdmins(options) {
        try {
            const adminOptions = {
                where: { role: 'admin' },
                ...options,
            };
            return await this.findAll(adminOptions);
        }
        catch (error) {
            throw new Error(`Error finding admins: ${error}`);
        }
    }
}
exports.UserRepository = UserRepository;
