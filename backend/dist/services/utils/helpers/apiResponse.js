"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = void 0;
class ResponseHelper {
    static success(res, message = 'Success', data, statusCode = 200) {
        const response = {
            success: true,
            message,
            ...(data && { data }),
        };
        return res.status(statusCode).json(response);
    }
    static created(res, message = 'Resource created successfully', data) {
        return this.success(res, message, data, 201);
    }
    static paginated(res, message, data, pagination) {
        const response = {
            success: true,
            message,
            data,
            pagination,
        };
        return res.status(200).json(response);
    }
    static error(res, message = 'Internal server error', statusCode = 500) {
        const response = {
            success: false,
            message,
        };
        return res.status(statusCode).json(response);
    }
    static noContent(res) {
        return res.status(204).send();
    }
}
exports.ResponseHelper = ResponseHelper;
