"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const apiResponse_1 = require("../services/utils/helpers/apiResponse");
const AppError_1 = require("../services/utils/errors/AppError");
const logger_1 = __importDefault(require("../services/utils/logger/logger"));
class BaseController {
    success(res, message = 'Success', data, statusCode = 200) {
        return apiResponse_1.ResponseHelper.success(res, message, data, statusCode);
    }
    created(res, message = 'Resource created successfully', data) {
        return apiResponse_1.ResponseHelper.created(res, message, data);
    }
    error(res, message = 'Internal server error', statusCode = 500) {
        return apiResponse_1.ResponseHelper.error(res, message, statusCode);
    }
    paginated(res, message, data, pagination) {
        return apiResponse_1.ResponseHelper.paginated(res, message, data, pagination);
    }
    noContent(res) {
        return apiResponse_1.ResponseHelper.noContent(res);
    }
    handleError(error, res, defaultMessage = 'Internal server error') {
        if (error instanceof AppError_1.AppError) {
            return this.error(res, error.message, error.statusCode);
        }
        logger_1.default.error('Unhandled error in controller:', error);
        return this.error(res, defaultMessage, 500);
    }
    getPaginationParams(req) {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
        return { page, limit };
    }
    getUserId(req) {
        if (!req.user || !req.user.userId) {
            throw new AppError_1.AppError('User not authenticated', 401);
        }
        return req.user.userId;
    }
    getUserRole(req) {
        if (!req.user || !req.user.role) {
            throw new AppError_1.AppError('User role not found', 401);
        }
        return req.user.role;
    }
    ensureAdmin(req) {
        const role = this.getUserRole(req);
        if (role !== 'admin') {
            throw new AppError_1.AppError('Admin access required', 403);
        }
    }
    ensureMiner(req) {
        const role = this.getUserRole(req);
        if (role !== 'miner') {
            throw new AppError_1.AppError('Miner access required', 403);
        }
    }
}
exports.BaseController = BaseController;
