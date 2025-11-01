"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const services_1 = require("../services");
const BaseController_1 = require("./BaseController");
const validation_1 = require("../services/utils/helpers/validation");
const zod_1 = require("zod");
const sendBulkEmailSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.number().int().positive('Invalid user ID')),
    subject: zod_1.z.string().min(1, 'Subject is required'),
    message: zod_1.z.string().min(1, 'Message is required'),
});
const sendGroupEmailSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1, 'Subject is required'),
    message: zod_1.z.string().min(1, 'Message is required'),
});
class EmailController extends BaseController_1.BaseController {
    constructor() {
        super();
        this.sendEmail = async (req, res) => {
            try {
                const result = await this.emailService.sendEmail(req.body);
                return this.success(res, 'Email sent successfully', { success: result });
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to send email');
            }
        };
        this.sendBulkEmail = async (req, res) => {
            try {
                const validatedData = (0, validation_1.validateData)(sendBulkEmailSchema, req.body);
                const result = await this.emailService.sendBulkEmail(req.body.userIds, req.body.subject, req.body.message);
                return this.success(res, 'Bulk email sent successfully', result);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to send bulk email');
            }
        };
        this.sendEmailToAllMiners = async (req, res) => {
            try {
                const validatedData = (0, validation_1.validateData)(sendGroupEmailSchema, req.body);
                const result = await this.emailService.sendEmailToAllMiners(req.body.subject, req.body.message);
                return this.success(res, 'Email sent to all miners successfully', result);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to send email to all miners');
            }
        };
        this.sendEmailToAllAdmins = async (req, res) => {
            try {
                const validatedData = (0, validation_1.validateData)(sendGroupEmailSchema, req.body);
                const result = await this.emailService.sendEmailToAllAdmins(req.body.subject, req.body.message);
                return this.success(res, 'Email sent to all admins successfully', result);
            }
            catch (error) {
                return this.handleError(error, res, 'Failed to send email to all admins');
            }
        };
        this.emailService = new services_1.EmailService('');
    }
}
exports.EmailController = EmailController;
