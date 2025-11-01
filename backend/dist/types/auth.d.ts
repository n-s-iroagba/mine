export interface AuthUser {
    userId: number;
    username: string;
    role: 'miner' | 'admin';
    roleId: number;
}
export interface AuthConfig {
    jwtSecret: string;
    clientUrl: string;
    tokenExpiration: {
        verification: number;
        login: number;
        refresh: number;
    };
}
export type SignUpRequestDto = {
    email: string;
    password: string;
    username: string;
};
export type SignUpResponseDto = {
    verificationToken: string;
};
export interface VerifyEmailRequestDto {
    verificationCode: string;
    verificationToken: string;
}
export interface LoginRequestDto {
    email: string;
    password: string;
}
export type AuthServiceLoginResponse = {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
};
export type LoginResponseDto = {
    accessToken: string;
    user: AuthUser;
};
export interface ForgotPasswordRequestDto {
    email: string;
}
export type ForgotPasswordResponseDto = {
    resetPasswordToken: string;
};
export interface ResetPasswordRequestDto {
    resetPasswordToken: string;
    password: string;
    confirmPassword: string;
}
export interface ResendVerificationRequestDto extends SignUpResponseDto {
}
export interface ResendVerificationRespnseDto extends SignUpResponseDto {
}
//# sourceMappingURL=auth.d.ts.map