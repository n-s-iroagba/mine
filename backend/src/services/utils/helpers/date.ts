export class DateHelper {
  static getCurrentDate(): Date {
    return new Date();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addWeeks(date: Date, weeks: number): Date {
    return this.addDays(date, weeks * 7);
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
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

  static calculateNextPaymentDate(period: string, fromDate?: Date): Date {
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

  static calculateEarningsPeriod(period: string): number {
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

  static isDateInPast(date: Date): boolean {
    return date < this.getCurrentDate();
  }

  static isDateInFuture(date: Date): boolean {
    return date > this.getCurrentDate();
  }

  static getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}