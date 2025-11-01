import jwt, {
    JwtPayload,
  SignOptions,

} from 'jsonwebtoken'
import { StringValue } from 'ms'
import { User } from '../models'
import { TokenGenerationOptions, ResetPasswordTokenPayload } from '../types/token'
import { logger, UnauthorizedError, AppError } from './utils'



// Extended interfaces for specialized tokens

export class TokenService {
  private readonly defaultOptions: Partial<TokenGenerationOptions> = {
    issuer: 'your-app-name',
    audience: 'your-app-Users',
  }

  // Token expiration defaults
  private readonly tokenExpirations = {
    access: '15m' as StringValue,
    refresh: '7d' as StringValue,
    resetPassword: '1h' as StringValue,
    emailVerification: '24h' as StringValue,
  }

  constructor(
    private readonly secret: string,
    private readonly refreshSecret?: string,
    private readonly resetPasswordSecret?: string,
    private readonly emailVerificationSecret?: string
  ) {
    if  (!secret) {
      logger.error('JWT secret is required for TokenService initialization')
      throw new Error('JWT secret is required')
    }

    logger.info('TokenService initialized successfully', {
      hasRefreshSecret: !!refreshSecret,
      hasResetPasswordSecret: !!resetPasswordSecret,
      hasEmailVerificationSecret: !!emailVerificationSecret,
    })
  }

  /**
   * Generate an access token with User authentication info
   */
  generateAccessToken(
    payload: User,
    customExpiresIn?: number | StringValue
  ): string {
    try {
      // Create minimal payload with only essential fields
      const accessTokenPayload: JwtPayload = {
        id: payload.id,

        email: payload.email,
        role: payload.role,
    
        tokenType: 'access',
      }

      const options: TokenGenerationOptions = {
        expiresIn: customExpiresIn || this.tokenExpirations.access||'10m',
        issuer: this.defaultOptions.issuer??'',
        audience: this.defaultOptions.audience??'',
        subject: payload.id?.toString(),
      }

      const signOptions: SignOptions = {
        expiresIn: options.expiresIn,
        issuer: options.issuer,
        audience: options.audience,
        subject: options.subject,
        algorithm: 'HS256',
      }

      const token = jwt.sign(accessTokenPayload, this.secret, signOptions)

      logger.info('Access token generated successfully', {
        userId: payload.id,
        email: payload.email,
        role: payload.role,
        expiresIn: options.expiresIn,
      
        tokenLength: token.length,
      })

       return token
    } catch (error) {
      console.error(error)

      logger.error('Access token generation failed', {
        error,
        email: payload.email,
        role: payload.role,
      })
      throw new Error('Access token generation failed')
    }
  }

  /**
   * Generate a password reset token
   */
  generateResetPasswordToken(
    payload: Omit<ResetPasswordTokenPayload, 'iat' | 'exp' | 'nbf' | 'purpose'>,
    customExpiresIn?: number | StringValue
  ): string {
    try {
      // Create minimal payload with only essential fields
      const resetTokenPayload: JwtPayload = {
        id: payload.id,

        email: payload.email,
     
        tokenType: 'reset_password',
    
      }

      const secret = this.resetPasswordSecret || this.secret
       const options: TokenGenerationOptions = {
        expiresIn: customExpiresIn || this.tokenExpirations.access||'10m',
        issuer: this.defaultOptions.issuer??'',
        audience: this.defaultOptions.audience??'',
        subject: payload.id?.toString(),
      }

      const signOptions: SignOptions = {
        expiresIn: options.expiresIn,
        issuer: options.issuer,
        audience: options.audience,
        subject: options.subject,
        algorithm: 'HS256',
      }

      const token = jwt.sign(resetTokenPayload, secret, signOptions)

      logger.info('Reset password token generated successfully', {
        userId: payload.id || payload.id,
         email: payload.email,
        expiresIn: options.expiresIn,
        requestId: payload.requestId,
        tokenLength: token.length,
      })

      return token
    } catch (error) {
      console.error(error)

      logger.error('Reset password token generation failed', {
        error,
        email: payload.email,
      })
      throw new Error('Reset password token generation failed')
    }
  }

  /**
   * Generate an email verification token
   */
  generateEmailVerificationToken(user: User, customExpiresIn?: StringValue | number): string {
    try {
      // Extract only essential fields from the User model
      const verificationTokenPayload: JwtPayload = {
        id: user.id,
        email: user.email,

        tokenType: 'email_verification',
      }

      const secret = this.secret
       const options: TokenGenerationOptions = {
        expiresIn: customExpiresIn || this.tokenExpirations.access||'10m',
        issuer: this.defaultOptions.issuer??'',
        audience: this.defaultOptions.audience??'',
        subject: verificationTokenPayload.id?.toString(),
      }

      const signOptions: SignOptions = {
        expiresIn: options.expiresIn,
        issuer: options.issuer,
        audience: options.audience,
        subject: options.subject,
        algorithm: 'HS256',
      }

      const token = jwt.sign(verificationTokenPayload, secret, signOptions)

      logger.info('Email verification token generated successfully', {
         userId: user.id,
        email: user.email,
        expiresIn: options.expiresIn,
        verificationCode: user.verificationCode,
        tokenLength: token.length,
      })

      return token
    } catch (error) {
      console.error(error)

      logger.error('Email verification token generation failed', {
        error,
        email: user.email,
      })
      throw new Error('Email verification token generation failed')
    }
  }

  /**
   * Generate refresh token with different secret (if provided)
   */
  generateRefreshToken(
    payload: Omit<JwtPayload, 'iat' | 'exp' | 'nbf' | 'tokenType'>,
    expiresIn: number | StringValue = '7d'
  ): string {
    // Create minimal payload with only essential fields
    const refreshPayload: JwtPayload = {
      id: payload.id,

      email: payload.email,
      role: payload.role,
      tokenType: 'refresh',
    }

    const secret = this.refreshSecret || this.secret
        const options: TokenGenerationOptions = {
        expiresIn,
        issuer: this.defaultOptions.issuer??'',
        audience: this.defaultOptions.audience??'',
        subject: payload.id?.toString(),
      }

    try {
      const signOptions: SignOptions = {
        expiresIn: options.expiresIn,
        issuer: options.issuer,
        audience: options.audience,
        algorithm: 'HS256',
      }

      const token = jwt.sign(refreshPayload, secret, signOptions)

      logger.info('Refresh token generated successfully', {
        userId: payload.id || payload.id,
         tokenLength: token.length,
      })

      return token
    } catch (error) {
      console.error(error)

      logger.error('Refresh token generation failed', { error })
      throw new Error('Refresh token generation failed')
    }
  }

  /**
   * Verify token with comprehensive expiration and error handling
   * Now supports different token types with their respective secrets
   * Throws errors to be handled by middleware
   */
  verifyToken(
    token: string,
    tokenType: 'access' | 'refresh' | 'reset_password' | 'email_verification'
){
    try {
      let secret = this.secret

      // Select appropriate secret based on token type
      switch (tokenType) {
        case 'refresh':
          secret = this.refreshSecret || this.secret
          break
        case 'reset_password':
          secret = this.resetPasswordSecret || this.secret
          break
        case 'email_verification':
          secret = this.emailVerificationSecret || this.secret
          break
        default:
          secret = this.secret
      }

      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as JwtPayload
      console.log('decoded is', decoded)
      // Validate token type matches expected type
      if (decoded.tokenType && decoded.tokenType !== tokenType) {
        logger.warn('Token type mismatch', {
          expected: tokenType,
          actual: decoded.tokenType,
          userId: decoded.id
      })

      logger.info('Token verified successfully', {
        userId: decoded.id,
        tokenType: decoded.tokenType,
     
      })
    }
      return { decoded }
    } catch (error) {
      console.error(error)

      // Handle JWT library errors
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('JWT verification failed', {
          error: error.message,
          tokenType,
        })

        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedError('Token has expired')
        }

        if (error instanceof jwt.NotBeforeError) {
          throw new UnauthorizedError('Token not active')
        }

        // Generic JWT error (malformed, invalid signature, etc.)
        throw new UnauthorizedError('Invalid token')
      }

      // Re-throw our custom errors
      if (error instanceof AppError) {
        throw error
      }

      // Unexpected error
      logger.error('Unexpected error during token verification', {
        error: error instanceof Error ? error.message : String(error),
        tokenType,
      })

      throw new AppError('Token verification failed')
    }
  }

}