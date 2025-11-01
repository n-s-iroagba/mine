export declare class PasswordService {
    private readonly SALT_ROUNDS;
    hashPassword(password: string): Promise<string>;
    comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean>;
    generateResetToken(): {
        token: string;
        hashedToken: string;
    };
}
//# sourceMappingURL=PasswordService.d.ts.map