"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWalletController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
const validation_1 = require("../services/utils/helpers/validation");
const zod_1 = require("zod");
const createAdminWalletSchema = zod_1.z.object({
    currencyAbbreviation: zod_1.z.string().min(1, 'Currency abbreviation is required'),
    logo: zod_1.z.string().min(1, 'Logo is required'),
    address: zod_1.z.string().min(1, 'Address is required'),
    currency: zod_1.z.string().min(1, 'Currency is required'),
});
const updateAdminWalletSchema = zod_1.z.object({
    currencyAbbreviation: zod_1.z.string().min(1, 'Currency abbreviation is required').optional(),
    logo: zod_1.z.string().min(1, 'Logo is required').optional(),
    address: zod_1.z.string().min(1, 'Address is required').optional(),
    currency: zod_1.z.string().min(1, 'Currency is required').optional(),
    isActive: zod_1.z.boolean().optional(),
});
class AdminWalletController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.createWallet = async (req, res, next) => {
            try {
                const wallet = await this.adminWalletService.createWallet(req.body);
                return this.created(res, 'Admin wallet created successfully', wallet);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to create admin wallet');
            }
        };
        this.getAllWallets = async (req, res, next) => {
            try {
                const wallets = await this.adminWalletService.getAllWallets();
                return this.success(res, 'Admin wallets retrieved successfully', wallets);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve admin wallets');
            }
        };
        this.getWalletById = async (req, res, next) => {
            try {
                const walletId = parseInt(req.params.id);
                const wallet = await this.adminWalletService.getWalletById(walletId);
                return this.success(res, 'Admin wallet retrieved successfully', wallet);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve admin wallet');
            }
        };
        this.updateWallet = async (req, res, next) => {
            try {
                const walletId = parseInt(req.params.id);
                const validatedData = (0, validation_1.validatePartialData)(updateAdminWalletSchema, req.body);
                const wallet = await this.adminWalletService.updateWallet(walletId, req.body);
                return this.success(res, 'Admin wallet updated successfully', wallet);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to update admin wallet');
            }
        };
        this.deleteWallet = async (req, res, next) => {
            try {
                const walletId = parseInt(req.params.id);
                await this.adminWalletService.deleteWallet(walletId);
                return this.success(res, 'Admin wallet deleted successfully');
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to delete admin wallet');
            }
        };
        this.getActiveWallets = async (req, res, next) => {
            try {
                const wallets = await this.adminWalletService.getActiveWallets();
                return this.success(res, 'Active admin wallets retrieved successfully', wallets);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to retrieve active admin wallets');
            }
        };
        this.adminWalletService = new services_1.AdminWalletService();
    }
}
exports.AdminWalletController = AdminWalletController;
