import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {  UnauthorizedError } from '../services/utils/errors/AppError';

declare global {
  namespace Express {
    interface UserPayload {
      userId: number;
      role: string;
      email:string
    }

    interface Request {
      user?: UserPayload;
    }
  }
}


export const authenticate = (req: Request, _: Response, next: NextFunction): void => {
  try {
    console.log('🔐 Authentication middleware triggered');
    
    // Get authorization header from different possible locations
    const authHeader = req.headers.authorization || 
                      req.headers.Authorization as string ||
                      req.headers['x-access-token'] as string;

    console.log('Raw auth header:', authHeader);

    // Check if header exists
    if (!authHeader) {
      console.log('❌ No authentication header found');
      throw new UnauthorizedError('Authentication token required');
    }

    // Handle different token formats
    let token: string;

    if (authHeader.startsWith('Bearer ')) {
      // Standard Bearer token format
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log('📝 Using Bearer token format');
    } else if (authHeader.startsWith('Token ')) {
      // Alternative token format
      token = authHeader.substring(6); // Remove 'Token ' prefix
      console.log('📝 Using Token format');
    } else {
      // Assume the entire header is the token
      token = authHeader;
      console.log('📝 Using raw token format');
    }

    // Clean and validate the token
    token = token.trim();
    
    console.log('🔍 Token details:', {
      length: token.length,
      first20Chars: token.substring(0, 20),
      last20Chars: token.substring(Math.max(0, token.length - 20))
    });

    if (!token) {
      console.log('❌ Token is empty after trimming');
      throw new UnauthorizedError('Authentication token required');
    }

    if (token.length < 10) {
      console.log('❌ Token is too short (less than 10 characters)');
      throw new UnauthorizedError('Invalid token format');
    }

    // Check for common token issues
    if (token.includes('\n') || token.includes('\r')) {
      console.log('❌ Token contains newline characters');
      throw new UnauthorizedError('Invalid token format');
    }

    // // Verify JWT secret is available
    // if (!process.env.JWT_SECRET) {
    //   console.log('❌ JWT_SECRET environment variable is not set');
    //   throw new Error('JWT secret not configured');
    // }

    // console.log('✅ JWT secret is configured');

    // Verify the token
    const decoded = jwt.verify(token, 'aba') as {
      id: number;
      email: string;
      role: string;
      iat?: number;
      exp?: number;
    };

    console.log('✅ Token successfully verified:', {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'N/A',
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
    });

    // Attach user to request
    req.user = {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    console.log('✅ Authentication successful');
    next();

  } catch (error) {
    console.error('🔒 Authentication failed:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ JWT validation error:', error.message);
      next(new UnauthorizedError('Invalid token: ' + error.message));
    } else if (error instanceof jwt.TokenExpiredError) {
      console.log('❌ Token expired at:', new Date(error.expiredAt).toISOString());
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      console.log('❌ Unexpected authentication error:', error);
      next(new UnauthorizedError('Authentication failed'));
    }
  }
};

export const requireAdmin = (req: Request, _: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireMiner = (req: Request, _: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role !== 'miner') {
      throw new UnauthorizedError('Miner access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (req: Request, _: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: number;
          email: string;
          role: string;
        };
        req.user = decoded;
      } catch (error) {
        // Token is invalid, but we don't throw error for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};