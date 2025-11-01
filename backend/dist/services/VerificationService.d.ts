import User from "../models/User";
export declare class VerificationService {
    private readonly tokenService;
    private readonly userService;
    private readonly emailService;
    constructor();
    intiateEmailVerificationProcess(user: User): Promise<{
        verificationToken: string;
        id: number;
    }>;
    regenerateVerificationCode(token: string): Promise<string>;
    validateVerificationCode(user: User, code: string): void;
}
//# sourceMappingURL=VerificationService.d.ts.map