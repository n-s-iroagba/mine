import User from "../models/User";
import { SignUpRequestDto, SignUpResponseDto, LoginRequestDto, AuthServiceLoginResponse, VerifyEmailRequestDto, ResetPasswordRequestDto, AuthUser } from "../types/auth";
export declare class AuthService {
    private readonly passwordService;
    private readonly userService;
    private readonly emailService;
    private readonly tokenService;
    private readonly verificationService;
    private readonly userRepository;
    constructor();
    signupMiner(data: any): Promise<SignUpResponseDto>;
    signUpAdmin(data: SignUpRequestDto): Promise<SignUpResponseDto>;
    login(data: LoginRequestDto): Promise<AuthServiceLoginResponse | SignUpResponseDto>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    verifyEmail(data: VerifyEmailRequestDto): Promise<AuthServiceLoginResponse>;
    generateNewCode(token: string): Promise<string>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(data: ResetPasswordRequestDto): Promise<AuthServiceLoginResponse>;
    getUserById(userId: string | number): Promise<User>;
    getMe(userId: number): Promise<AuthUser>;
    private validatePassword;
    private generateTokenPair;
    private saveRefreshTokenAndReturn;
    private handleAuthError;
}
//# sourceMappingURL=AuthService.d.ts.map