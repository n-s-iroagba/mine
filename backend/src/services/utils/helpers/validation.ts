import { z, ZodError, ZodObject, ZodRawShape } from 'zod';
import { ValidationError } from '../errors/AppError';

/**
 * Validate complete data against a Zod schema.
 */
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new ValidationError(`Validation failed: ${errorMessages}`);
    }
    throw error;
  }
};

/**
 * Validate partial (update) data — only works for Zod object schemas.
 */
export const validatePartialData = <T extends ZodRawShape>(
  schema: ZodObject<T>,
  data: unknown
): Partial<z.infer<typeof schema>> => {
  try {
    return schema.partial().parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new ValidationError(`Validation failed: ${errorMessages}`);
    }
    throw error;
  }
};

/**
 * Utility validators
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidCurrency = (currency: string): boolean => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'USDT', 'USDC'];
  return validCurrencies.includes(currency.toUpperCase());
};

export const isValidPeriod = (period: string): boolean => {
  const validPeriods = ['daily', 'weekly', 'fortnightly', 'monthly'];
  return validPeriods.includes(period.toLowerCase());
};

export const isValidTransactionStatus = (status: string): boolean => {
  const validStatuses = ['initialized', 'pending', 'successful', 'failed'];
  return validStatuses.includes(status.toLowerCase());
};

export const isValidKYCStatus = (status: string): boolean => {
  const validStatuses = ['pending', 'successful', 'failed'];
  return validStatuses.includes(status.toLowerCase());
};
