import { AppError, logger } from ".";



export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected logInfo(message: string, meta?: any) {
    logger.info(`[${this.serviceName}] ${message}`, meta);
  }

  protected logError(message: string, error?: any) {
    logger.error(`[${this.serviceName}] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...error,
    });
  }

  protected logWarn(message: string, meta?: any) {
    logger.warn(`[${this.serviceName}] ${message}`, meta);
  }

  protected handleError(error: any, customMessage?: string): never {
    this.logError(customMessage || 'Service error', error);

    if (error instanceof AppError) {
      throw error;
    }

    // Handle database errors
    if (error.name?.includes('Sequelize')) {
      throw new AppError('Database operation failed', 500);
    }

    throw new AppError(customMessage || 'Internal server error', 500);
  }

  protected validateRequiredFields(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }
  }

  protected sanitizeData<T>(data: any, allowedFields: string[]): Partial<T> {
    const sanitized: any = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        sanitized[field] = data[field];
      }
    }
    
    return sanitized;
  }
}