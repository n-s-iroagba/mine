// controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { 
 
  LoginRequestDto, 
  VerifyEmailRequestDto, 
  ResetPasswordRequestDto, 
  AuthServiceLoginResponse
} from '../types/auth';
import { getCookieOptions } from '../config/cookieOption';


export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signupMiner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.signupMiner(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Miner registered successfully. Please check your email for verification.'
      });
    } catch (error) {
      next(error);
    }
  };

  signupAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.signUpAdmin(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Admin registered successfully.'
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: LoginRequestDto = req.body;
      const result = await this.authService.login(loginData);
             const verified = result as AuthServiceLoginResponse

        const cookieOptions = getCookieOptions()
        console.log('Setting refresh token cookie with options:', cookieOptions)

        res.cookie('refreshToken', verified.refreshToken, cookieOptions)
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const verifyData: VerifyEmailRequestDto = req.body;
      const result = await this.authService.verifyEmail(verifyData);
             const verified = result as AuthServiceLoginResponse

        const cookieOptions = getCookieOptions()
        console.log('Setting refresh token cookie with options:', cookieOptions)

        res.cookie('refreshToken', verified.refreshToken, cookieOptions)
      res.status(200).json({
        success: true,
        data: result,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  resendVerificationCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      const result = await this.authService.generateNewCode(token);
      
      res.status(200).json({
        success: true,
        data: { message: result },
        message: 'Verification code sent successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resetData: ResetPasswordRequestDto = req.body;
      const result = await this.authService.resetPassword(resetData);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };

refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      console.log('All cookies received:', req.cookies)
      console.log('Headers:', req.headers.cookie)

      const cookieHeader = req.headers.cookie
      console.log('Raw cookie header:', cookieHeader)

      if (!cookieHeader) {
        res.status(401).json({ message: 'No cookies provided' })
        return
      }

      // Extract the refreshToken value from the cookie string
      const refreshToken = cookieHeader
        .split(';')
        .find(cookie => cookie.trim().startsWith('refreshToken='))
        ?.split('=')[1]

      console.log('Extracted refresh token:', refreshToken ? 'Present' : 'Missing')
      console.log('Token preview:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None')
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token not found in cookies'
      });
      return;
    }

    const result = await this.authService.refreshToken(refreshToken);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Assuming user ID is attached to req.user by authentication middleware
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const user = await this.authService.getMe(userId);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'User data retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In a real implementation, you might want to blacklist the token
      // or remove the refresh token from the database
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}