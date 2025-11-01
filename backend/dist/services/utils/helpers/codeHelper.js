"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeHelper = void 0;
class CodeHelper {
    static generateVerificationCode(length = 6) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(min + Math.random() * (max - min + 1)).toString();
    }
    static isCodeExpired(createdAt, expirationMinutes = 15) {
        const expirationTime = new Date(createdAt.getTime() + expirationMinutes * 60000);
        return new Date() > expirationTime;
    }
}
exports.CodeHelper = CodeHelper;
