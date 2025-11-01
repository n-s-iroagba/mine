"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
class BankController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.createBank = async (req, res) => {
            try {
                const bank = await this.bankService.createBank(req.body);
                return this.created(res, 'Bank created successfully', bank);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to create bank');
            }
        };
        this.getAllBanks = async (_, res) => {
            try {
                const banks = await this.bankService.getAllBanks();
                return this.success(res, 'Banks retrieved successfully', banks);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve banks');
            }
        };
        this.getBankById = async (req, res) => {
            try {
                const bankId = parseInt(req.params.id);
                const bank = await this.bankService.getBankById(bankId);
                return this.success(res, 'Bank retrieved successfully', bank);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve bank');
            }
        };
        this.updateBank = async (req, res) => {
            try {
                const bankId = parseInt(req.params.id);
                const bank = await this.bankService.updateBank(bankId, req.body);
                return this.success(res, 'Bank updated successfully', bank);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to update bank');
            }
        };
        this.deleteBank = async (req, res) => {
            try {
                const bankId = parseInt(req.params.id);
                await this.bankService.deleteBank(bankId);
                return this.success(res, 'Bank deleted successfully');
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to delete bank');
            }
        };
        this.getActiveBanks = async (_, res) => {
            try {
                const banks = await this.bankService.getActiveBanks();
                return this.success(res, 'Active banks retrieved successfully', banks);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve active banks');
            }
        };
        this.bankService = new services_1.BankService();
    }
}
exports.BankController = BankController;
