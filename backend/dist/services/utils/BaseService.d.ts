export declare abstract class BaseService {
    protected serviceName: string;
    constructor(serviceName: string);
    protected logInfo(message: string, meta?: any): void;
    protected logError(message: string, error?: any): void;
    protected logWarn(message: string, meta?: any): void;
    protected handleError(error: any, customMessage?: string): never;
    protected validateRequiredFields(data: any, requiredFields: string[]): void;
    protected sanitizeData<T>(data: any, allowedFields: string[]): Partial<T>;
}
//# sourceMappingURL=BaseService.d.ts.map