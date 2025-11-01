import jwt, { JwtPayload } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { User } from '../models';
import { ResetPasswordTokenPayload } from '../types/token';
export declare class TokenService {
    private readonly secret;
    private readonly refreshSecret?;
    private readonly resetPasswordSecret?;
    private readonly emailVerificationSecret?;
    private readonly defaultOptions;
    private readonly tokenExpirations;
    constructor(secret: string, refreshSecret?: string | undefined, resetPasswordSecret?: string | undefined, emailVerificationSecret?: string | undefined);
    generateAccessToken(payload: User, customExpiresIn?: number | StringValue): string;
    generateResetPasswordToken(payload: Omit<ResetPasswordTokenPayload, 'iat' | 'exp' | 'nbf' | 'purpose'>, customExpiresIn?: number | StringValue): string;
    generateEmailVerificationToken(user: User, customExpiresIn?: StringValue | number): string;
    generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp' | 'nbf' | 'tokenType'>, expiresIn?: number | StringValue): string;
    verifyToken(token: string, tokenType: 'access' | 'refresh' | 'reset_password' | 'email_verification'): {
        decoded: jwt.JwtPayload;
    };
}
//# sourceMappingURL=TokenService.d.ts.map