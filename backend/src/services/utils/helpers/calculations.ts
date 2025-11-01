export class CalculationHelper {
  static calculateEarnings(
    amountDeposited: number,
    periodReturn: number,
    period: string,
    days: number = 1
  ): number {
    const dailyRate = this.getDailyRate(periodReturn, period);
    const earnings = amountDeposited * dailyRate * days;
    return Math.round(earnings * 100) / 100; // Round to 2 decimal places
  }

  static getDailyRate(periodReturn: number, period: string): number {
    const periodInDays = this.getPeriodInDays(period);
    return periodReturn / periodInDays / 100; // Convert percentage to decimal and get daily rate
  }

  static getPeriodInDays(period: string): number {
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

  static calculateTotalEarnings(subscriptions: Array<{ earnings: number }>): number {
    return subscriptions.reduce((total, sub) => total + sub.earnings, 0);
  }

  static calculateTotalDeposits(subscriptions: Array<{ amountDeposited: number }>): number {
    return subscriptions.reduce((total, sub) => total + sub.amountDeposited, 0);
  }

  static calculateNetProfit(totalEarnings: number, totalDeposits: number): number {
    return totalEarnings - totalDeposits;
  }

  static calculateROI(earnings: number, deposit: number): number {
    if (deposit === 0) return 0;
    return (earnings / deposit) * 100;
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static convertToUSD(amount: number, fromCurrency: string, exchangeRates: any): number {
    // In production, use real exchange rates from an API
    const rates: { [key: string]: number } = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      BTC: 35000, // Example rate
      ETH: 2000,  // Example rate
      USDT: 1,
      USDC: 1,
      ...exchangeRates,
    };

    const rate = rates[fromCurrency.toUpperCase()] || 1;
    return amount * rate;
  }
}