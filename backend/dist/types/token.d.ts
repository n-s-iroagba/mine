import { JwtPayload as BaseJwtPayload, JwtHeader } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { User } from '../models';
export interface JwtPayload extends BaseJwtPayload {
    id?: number;
    email?: string;
    role?: string;
    permissions?: string[];
    sessionId?: string;
    tokenType: 'access' | 'refresh' | 'email_verification' | 'reset_password';
}
export interface TokenVerificationResult {
    decoded: JwtPayload;
}
export interface TokenGenerationOptions {
    expiresIn: number | StringValue;
    issuer?: string;
    audience?: string | string[];
    subject?: string;
    notBefore?: number | StringValue;
    jwtid?: string;
    algorithm?: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512';
    keyid?: string;
    header?: JwtHeader;
    encoding?: string;
    allowInsecureKeySizes?: boolean;
    allowInvalidAsymmetricKeyTypes?: boolean;
}
export interface AccessTokenPayload extends Omit<JwtPayload, 'tokenType'> {
    user: User;
}
export interface ResetPasswordTokenPayload extends Omit<JwtPayload, 'tokenType'> {
    id?: number;
    email: string;
    purpose: 'password_reset';
    requestId?: string;
}
export interface EmailVerificationTokenPayload extends Omit<JwtPayload, 'tokenType'> {
    id?: number;
    email: string;
    purpose: 'email_verification';
    verificationCode?: string;
}
//# sourceMappingURL=token.d.ts.map