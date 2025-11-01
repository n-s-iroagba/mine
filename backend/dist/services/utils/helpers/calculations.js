"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculationHelper = void 0;
class CalculationHelper {
    static calculateEarnings(amountDeposited, periodReturn, period, days = 1) {
        const dailyRate = this.getDailyRate(periodReturn, period);
        const earnings = amountDeposited * dailyRate * days;
        return Math.round(earnings * 100) / 100; // Round to 2 decimal places
    }
    static getDailyRate(periodReturn, period) {
        const periodInDays = this.getPeriodInDays(period);
        return periodReturn / periodInDays / 100; // Convert percentage to decimal and get daily rate
    }
    static getPeriodInDays(period) {
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
    static calculateTotalEarnings(subscriptions) {
        return subscriptions.reduce((total, sub) => total + sub.earnings, 0);
    }
    static calculateTotalDeposits(subscriptions) {
        return subscriptions.reduce((total, sub) => total + sub.amountDeposited, 0);
    }
    static calculateNetProfit(totalEarnings, totalDeposits) {
        return totalEarnings - totalDeposits;
    }
    static calculateROI(earnings, deposit) {
        if (deposit === 0)
            return 0;
        return (earnings / deposit) * 100;
    }
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }
    static convertToUSD(amount, fromCurrency, exchangeRates) {
        // In production, use real exchange rates from an API
        const rates = {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            BTC: 35000, // Example rate
            ETH: 2000, // Example rate
            USDT: 1,
            USDC: 1,
            ...exchangeRates,
        };
        const rate = rates[fromCurrency.toUpperCase()] || 1;
        return amount * rate;
    }
}
exports.CalculationHelper = CalculationHelper;
