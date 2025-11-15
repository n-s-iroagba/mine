import { Router } from 'express';
import authRoutes from './auth';
import adminWalletRoutes from './adminWallet';
import miningServerRoutes from './miningServer';
import miningContractRoutes from './miningContract';
import bankRoutes from './bank';
import subscriptionRoutes from './subscription';
import transactionRoutes from './transaction';
import kycRoutes from './kyc';
import kycFeeRoutes from './kycFee';
import emailRoutes from './email';
import minerRoutes from './miner'
import earningRoutes from './earnings'

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/miners',minerRoutes)
router.use('/earnings', earningRoutes)
// router.use('/users', userRoutes);
router.use('/admin-wallets', adminWalletRoutes);
router.use('/mining-servers', miningServerRoutes);
router.use('/mining-contracts', miningContractRoutes);
router.use('/banks', bankRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/transactions', transactionRoutes);
router.use('/kyc', kycRoutes);
router.use('/kyc-fees', kycFeeRoutes);
router.use('/email', emailRoutes);

// Health check route
router.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'Satoshi Vertex API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  });
});

export default router;