// routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth';



  const router = Router();
  const authController = new AuthController();

  // Public routes
  router.post('/signup/miner', authController.signupMiner);
  router.post('/signup/admin', authController.signupAdmin);
  router.post('/login', authController.login);
  router.post('/verify-email', authController.verifyEmail);
  router.post('/resend-verification-code', authController.resendVerificationCode);
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);
  router.post('/refresh-token', authController.refreshToken);

  // Protected routes
  router.get('/me',authenticate,  authController.getMe);
  router.post('/logout',  authController.logout);

  export default router;
