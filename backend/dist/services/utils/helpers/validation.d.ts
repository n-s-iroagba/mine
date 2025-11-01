import { z, ZodObject, ZodRawShape } from 'zod';
export declare const validateData: <T>(schema: z.ZodSchema<T>, data: unknown) => T;
export declare const validatePartialData: <T extends ZodRawShape>(schema: ZodObject<T>, data: unknown) => Partial<z.infer<typeof schema>>;
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPassword: (password: string) => boolean;
export declare const isValidCurrency: (currency: string) => boolean;
export declare const isValidPeriod: (period: string) => boolean;
export declare const isValidTransactionStatus: (status: string) => boolean;
export declare const isValidKYCStatus: (status: string) => boolean;
//# sourceMappingURL=validation.d.ts.map