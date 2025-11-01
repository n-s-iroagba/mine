export declare class CalculationHelper {
    static calculateEarnings(amountDeposited: number, periodReturn: number, period: string, days?: number): number;
    static getDailyRate(periodReturn: number, period: string): number;
    static getPeriodInDays(period: string): number;
    static calculateTotalEarnings(subscriptions: Array<{
        earnings: number;
    }>): number;
    static calculateTotalDeposits(subscriptions: Array<{
        amountDeposited: number;
    }>): number;
    static calculateNetProfit(totalEarnings: number, totalDeposits: number): number;
    static calculateROI(earnings: number, deposit: number): number;
    static formatCurrency(amount: number, currency?: string): string;
    static convertToUSD(amount: number, fromCurrency: string, exchangeRates: any): number;
}
//# sourceMappingURL=calculations.d.ts.map