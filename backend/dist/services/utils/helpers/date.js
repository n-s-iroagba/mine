"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateHelper = void 0;
class DateHelper {
    static getCurrentDate() {
        return new Date();
    }
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    static addWeeks(date, weeks) {
        return this.addDays(date, weeks * 7);
    }
    static addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
    static formatDate(date, format = 'YYYY-MM-DD') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return format
            .replace('YYYY', year.toString())
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }
    static calculateNextPaymentDate(period, fromDate) {
        const baseDate = fromDate || this.getCurrentDate();
        switch (period.toLowerCase()) {
            case 'daily':
                return this.addDays(baseDate, 1);
            case 'weekly':
                return this.addDays(baseDate, 7);
            case 'fortnightly':
                return this.addDays(baseDate, 14);
            case 'monthly':
                return this.addMonths(baseDate, 1);
            default:
                return this.addDays(baseDate, 1);
        }
    }
    static calculateEarningsPeriod(period) {
        switch (period.toLowerCase()) {
            case 'daily':
                return 1;
            case 'weekly':
                return 7;
            case 'fortnightly':
                return 14;
            case 'monthly':
                return 30;
            default:
                return 1;
        }
    }
    static isDateInPast(date) {
        return date < this.getCurrentDate();
    }
    static isDateInFuture(date) {
        return date > this.getCurrentDate();
    }
    static getDaysDifference(date1, date2) {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
exports.DateHelper = DateHelper;
