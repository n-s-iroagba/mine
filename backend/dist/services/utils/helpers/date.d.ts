export declare class DateHelper {
    static getCurrentDate(): Date;
    static addDays(date: Date, days: number): Date;
    static addWeeks(date: Date, weeks: number): Date;
    static addMonths(date: Date, months: number): Date;
    static formatDate(date: Date, format?: string): string;
    static calculateNextPaymentDate(period: string, fromDate?: Date): Date;
    static calculateEarningsPeriod(period: string): number;
    static isDateInPast(date: Date): boolean;
    static isDateInFuture(date: Date): boolean;
    static getDaysDifference(date1: Date, date2: Date): number;
}
//# sourceMappingURL=date.d.ts.map