'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useApiQuery } from '../../../hooks/useApi';
import { formatCurrency } from '../../../lib/utils';
import { miningSubscriptionService, kycService, kycFeeService, bankService, adminWalletService, miningContractService } from '../../../services';
import { MiningSubscription } from '@/types/subscription';
import { MiningContract } from '@/types/api';


const uploadFile = async (
  file: File,
  type: 'thumbnail' | 'video' | 'image'
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'amafor');
    formData.append('folder', 'amafor');

    if (type === 'image') {
      formData.append('quality', 'auto');
      formData.append('fetch_format', 'auto');
    }

    const resourceType = type === 'video' ? 'video' : 'image';
    const cloudUrl = `https://api.cloudinary.com/v1_1/dh2cpesxu/${resourceType}/upload`;

    const uploadRes = await fetch(cloudUrl, { 
      method: 'POST', 
      body: formData 
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed with status: ${uploadRes.status}`);
    }

    const data = await uploadRes.json();
    
    if (!data.url) {
      throw new Error('No URL returned from Cloudinary');
    }

    return data.url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const validateFile = (file: File, maxSizeMB: number = 10, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `File type not supported. Please upload ${allowedTypes.join(', ')}`;
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size too large. Maximum size is ${maxSizeMB}MB`;
  }

  return null;
};

// Utility functions for withdrawal calculation
const calculateWithdrawalDueDate = (
  subscription: MiningSubscription,
  contract: MiningContract
): Date | null => {
  if (!subscription.dateOfFirstPayment || subscription.depositStatus !== 'complete deposit') {
    return null;
  }

  const firstPaymentDate = new Date(subscription.dateOfFirstPayment);
  const now = new Date();
  
  let daysToAdd = 0;
  switch (contract.period) {
    case 'daily':
      daysToAdd = 1;
      break;
    case 'weekly':
      daysToAdd = 7;
      break;
    case 'fortnightly':
      daysToAdd = 14;
      break;
    case 'monthly':
      daysToAdd = 30;
      break;
    default:
      return null;
  }

  let nextDueDate = new Date(firstPaymentDate);
  
  while (nextDueDate <= now) {
    nextDueDate.setDate(nextDueDate.getDate() + daysToAdd);
  }

  return nextDueDate;
};

const isWithdrawalDueToday = (
  subscription: MiningSubscription,
  contract: MiningContract
): boolean => {
  const dueDate = calculateWithdrawalDueDate(subscription, contract);
  if (!dueDate) return false;

  const today = new Date();
  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
};

const isWithdrawalOverdue = (
  subscription: MiningSubscription,
  contract: MiningContract
): boolean => {
  const dueDate = calculateWithdrawalDueDate(subscription, contract);
  if (!dueDate) return false;

  const now = new Date();
  return dueDate < now;
};

const getDaysUntilNextWithdrawal = (
  subscription: MiningSubscription,
  contract: MiningContract
): number => {
  const dueDate = calculateWithdrawalDueDate(subscription, contract);
  if (!dueDate) return -1;

  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

const canProceedWithKYC = (
  subscriptions: MiningSubscription[],
  contracts: MiningContract[]
): boolean => {
  const hasActiveSubscription = subscriptions.some(sub => 
    sub.depositStatus === 'complete deposit'
  );

  if (!hasActiveSubscription) return false;

  for (const subscription of subscriptions) {
    if (subscription.depositStatus !== 'complete deposit') continue;
    
    const contract = contracts.find(c => c.id === subscription.miningContractId);
    if (!contract) continue;

    if (isWithdrawalDueToday(subscription, contract) || isWithdrawalOverdue(subscription, contract)) {
      return true;
    }
  }

  return false;
};

export default function KYCPage() {
  const { user } = useAuth();
  const minerId = user?.roleId;

  const [activeStep, setActiveStep] = useState<'check' | 'kyc' | 'fee' | 'payment' | 'complete'>('check');
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'bank' | ''>('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useApiQuery<MiningSubscription[]>(
    ['miner-subscriptions', minerId],
    () => miningSubscriptionService.getSubscriptionsByMinerId(minerId!),
    { enabled: !!minerId }
  );

  // Fetch contracts
  const { data: contracts, isLoading: contractsLoading } = useApiQuery<MiningContract[]>(
    ['mining-contracts'],
    () => miningContractService.getAllContracts(),
    { enabled: !!minerId }
  );

  // Fetch KYC status
  const { data: kyc, isLoading: kycLoading } = useApiQuery(
    ['miner-kyc', minerId],
    () => kycService.getKYCByMinerId(minerId!),
    { enabled: !!minerId }
  );

  // Fetch KYC fee
  const { data: kycFee, isLoading: kycFeeLoading } = useApiQuery(
    ['miner-kyc-fee', minerId],
    () => kycFeeService.getKYCFeeByMinerId(minerId!),
    { enabled: !!minerId }
  );

  // Fetch banks and wallets
  const { data: banks, isLoading: banksLoading } = useApiQuery(
    ['banks'],
    () => bankService.getAllBanks(),
    { enabled: activeStep === 'payment' && paymentMethod === 'bank' }
  );

  const { data: wallets, isLoading: walletsLoading } = useApiQuery(
    ['wallets'],
    () => adminWalletService.getActiveWallets(),
    { enabled: activeStep === 'payment' && paymentMethod === 'crypto' }
  );

  // Calculate withdrawal status
  const withdrawalStatus = React.useMemo(() => {
    if (!subscriptions || !contracts) return null;

    for (const subscription of subscriptions) {
      if (subscription.depositStatus !== 'complete deposit') continue;
      
      const contract = contracts.find(c => c.id === subscription.miningContractId);
      if (!contract) continue;

      const dueDate = calculateWithdrawalDueDate(subscription, contract);
      const daysUntilDue = getDaysUntilNextWithdrawal(subscription, contract);
      const isDueToday = isWithdrawalDueToday(subscription, contract);
      const isOverdue = isWithdrawalOverdue(subscription, contract);

      return {
        dueDate,
        daysUntilDue,
        isDueToday,
        isOverdue,
        subscription,
        contract
      };
    }
    return null;
  }, [subscriptions, contracts]);

  // Determine if user can proceed with KYC
  const canProceed = React.useMemo(() => {
    if (!subscriptions || !contracts) return false;
    return canProceedWithKYC(subscriptions, contracts);
  }, [subscriptions, contracts]);

  // Determine current step based on data
  React.useEffect(() => {
    if (subscriptionsLoading || kycLoading || kycFeeLoading || contractsLoading) return;

    if (!canProceed) {
      setActiveStep('check');
      return;
    }

    if (!kyc) {
      setActiveStep('kyc');
      return;
    }

    if (kyc.status === 'pending') {
      setActiveStep('kyc');
      return;
    }

    if (kyc.status === 'successful' && !kycFee) {
      setActiveStep('fee');
      return;
    }

    if (kycFee && !kycFee.isPaid) {
      setActiveStep('payment');
      return;
    }

    if (kycFee && kycFee.isPaid) {
      setActiveStep('complete');
      return;
    }
  }, [subscriptions, kyc, kycFee, contracts, canProceed, subscriptionsLoading, kycLoading, kycFeeLoading, contractsLoading]);

  const handleFileSelect = (file: File, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setFile(null);
    } else {
      setError('');
      setFile(file);
    }
  };

  const handleIdCardUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardFile) {
      setError('Please upload your ID card');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const idCardUrl = await uploadFile(idCardFile, 'image');
      
      await kycService.createKYCRequest({
        minerId: minerId as number,
        idCard: idCardUrl
      });
      
      setActiveStep('fee');
    } catch (err) {
      setError('Failed to upload ID card. Please try again.');
      console.error('KYC submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodSelect = (method: 'crypto' | 'bank') => {
    setPaymentMethod(method);
    setError('');
  };

  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentProof) {
      setError('Please upload payment proof');
      return;
    }

    if (paymentMethod === 'bank' && !selectedBank) {
      setError('Please select a bank');
      return;
    }

    if (paymentMethod === 'crypto' && !selectedCrypto) {
      setError('Please select a cryptocurrency');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const paymentProofUrl = await uploadFile(paymentProof, 'image');
      
      await kycFeeService.submitPaymentProof(
        minerId!,
        paymentMethod as "bank" | "crypto",
        paymentMethod === 'bank' ? selectedBank : selectedCrypto,
        paymentProofUrl
      );
      setActiveStep('complete');
    } catch (err) {
      setError('Failed to submit payment proof. Please try again.');
      console.error('Payment submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startKYCProcess = () => {
    if (canProceed) {
      setActiveStep('kyc');
    }
  };

  if (subscriptionsLoading || kycLoading || kycFeeLoading || contractsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-2">Loading...</div>
          <p className="text-gray-500">Checking your KYC status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
          <p className="text-gray-600">Complete your Know Your Customer verification process</p>
        </div>

        {/* Withdrawal Status Banner */}
        {withdrawalStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            withdrawalStatus.isDueToday 
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : withdrawalStatus.isOverdue
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">
                  {withdrawalStatus.isDueToday 
                    ? "Withdrawal is due today!"
                    : withdrawalStatus.isOverdue
                    ? "Withdrawal is overdue!"
                    : `Next withdrawal in ${withdrawalStatus.daysUntilDue} days`
                  }
                </p>
                <p className="text-sm">
                  Complete KYC verification to enable withdrawals.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['check', 'kyc', 'fee', 'payment', 'complete'].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex flex-col items-center ${getStepStatus(step, activeStep)}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    getStepStatus(step, activeStep) === 'completed' 
                      ? 'bg-green-600 text-white'
                      : getStepStatus(step, activeStep) === 'current'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 capitalize">{step}</span>
                </div>
                {index < 4 && (
                  <div className={`w-12 h-1 ${
                    getStepStatus(step, activeStep) === 'completed' 
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeStep === 'check' && (
            <CheckSubscriptionStep 
              hasSubscription={(subscriptions && subscriptions.length > 0) as boolean}
              withdrawalStatus={withdrawalStatus}
              onStartKYC={startKYCProcess}
              canProceedWithKYC={canProceed}
            />
          )}

          {activeStep === 'kyc' && (
            <KYCSubmissionStep
              kyc={kyc}
              idCardFile={idCardFile}
              setIdCardFile={setIdCardFile}
              onFileSelect={handleFileSelect}
              onSubmit={handleIdCardUpload}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}

          {activeStep === 'fee' && (
            <KYCFeeStep
              kycFee={kycFee}
              kyc={kyc}
            />
          )}

          {activeStep === 'payment' && (
            <PaymentStep
              kycFee={kycFee}
              paymentMethod={paymentMethod}
              selectedBank={selectedBank}
              selectedCrypto={selectedCrypto}
              paymentProof={paymentProof}
              banks={banks || []}
              wallets={wallets || []}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              onBankSelect={setSelectedBank}
              onCryptoSelect={setSelectedCrypto}
              onPaymentProofChange={setPaymentProof}
              onFileSelect={handleFileSelect}
              onSubmit={handlePaymentSubmission}
              isSubmitting={isSubmitting}
              error={error}
              banksLoading={banksLoading}
              walletsLoading={walletsLoading}
            />
          )}

          {activeStep === 'complete' && (
            <CompleteStep />
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to determine step status
function getStepStatus(step: string, activeStep: string) {
  const steps = ['check', 'kyc', 'fee', 'payment', 'complete'];
  const currentIndex = steps.indexOf(activeStep);
  const stepIndex = steps.indexOf(step);

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
}

// Step Components
function CheckSubscriptionStep({ 
  hasSubscription, 
  withdrawalStatus, 
  onStartKYC, 
  canProceedWithKYC 
}: { 
  hasSubscription: boolean;
  withdrawalStatus: any;
  onStartKYC: () => void;
  canProceedWithKYC: boolean;
}) {
  return (
    <div className="text-center py-8">
      {canProceedWithKYC ? (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {hasSubscription && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready for KYC</h2>
              <p className="text-gray-600 mb-6">
                {withdrawalStatus?.isDueToday 
                  ? "Your withdrawal is due today. Complete KYC to access your funds."
                  : withdrawalStatus?.isOverdue
                  ? "Your withdrawal is overdue. Complete KYC to withdraw your earnings."
                  : `Your next withdrawal is in ${withdrawalStatus?.daysUntilDue} days. Complete KYC to enable withdrawals.`
                }
              </p>
            </>
          )}
          
          <button 
            onClick={onStartKYC}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start KYC Verification
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Requirements Not Met</h2>
          <p className="text-gray-600 mb-6">
            You need an active mining subscription with a withdrawal due date to proceed with KYC verification.
          </p>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Create Mining Subscription
            </button>
            <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Subscription Plans
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function KYCSubmissionStep({ 
  kyc, 
  idCardFile, 
  setIdCardFile, 
  onFileSelect,
  onSubmit, 
  isSubmitting, 
  error 
}: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h2>
      <p className="text-gray-600 mb-6">Upload a clear photo of your government-issued ID card</p>

      {kyc?.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-yellow-800">Your KYC submission is under review</span>
          </div>
        </div>
      )}

      {kyc?.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-red-800 font-medium">KYC Verification Failed</span>
          </div>
          {kyc.rejectionReason && (
            <p className="text-red-700 text-sm">{kyc.rejectionReason}</p>
          )}
          <p className="text-red-700 text-sm mt-1">Please upload a new ID card and try again.</p>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload ID Card *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onFileSelect(file, setIdCardFile);
                  }
                }}
                className="hidden"
                id="idCardUpload"
              />
              <label htmlFor="idCardUpload" className="cursor-pointer">
                {idCardFile ? (
                  <div className="text-green-600">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">{idCardFile.name}</p>
                    <p className="text-sm text-gray-500">Click to change file</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="font-medium">Click to upload ID card</p>
                    <p className="text-sm">PNG, JPG, PDF up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Requirements:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Government-issued ID (Passport, Driver's License, National ID)</li>
                  <li>Clear, readable photo of the entire document</li>
                  <li>File size should not exceed 10MB</li>
                  <li>Accepted formats: JPG, PNG, PDF</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!idCardFile || isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
}

function KYCFeeStep({ kycFee, kyc }: any) {
  return (
    <div className="text-center py-8">
      {kyc?.status === 'successful' && !kycFee && (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verified Successfully!</h2>
          <p className="text-gray-600 mb-6">Your identity has been verified. Admin will create a KYC fee for you shortly.</p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Waiting for fee creation...</p>
          </div>
        </>
      )}

      {kycFee && !kycFee.isPaid && (
        <>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-10h-1M4 12H3m17.5-6.5L18 7m-12 5l-1.5 1.5M18 7l-1.5-1.5M18 7l1.5-1.5M6 17l-1.5 1.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Fee Required</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-3xl font-bold text-yellow-800 mb-2">
              {formatCurrency(kycFee.amount)}
            </p>
            <p className="text-yellow-700">Please pay the KYC verification fee to complete the process</p>
          </div>
          <p className="text-sm text-gray-500">You will be redirected to payment automatically...</p>
        </>
      )}
    </div>
  );
}

function PaymentStep({
  kycFee,
  paymentMethod,
  selectedBank,
  selectedCrypto,
  paymentProof,
  banks,
  wallets,
  onPaymentMethodSelect,
  onBankSelect,
  onCryptoSelect,
  onPaymentProofChange,
  onFileSelect,
  onSubmit,
  isSubmitting,
  error,
  banksLoading,
  walletsLoading
}: any) {
  const [copied, setCopied] = useState(false);

  const selectedBankDetails = banks.find((bank: any) => bank.id === parseInt(selectedBank));
  const selectedWalletDetails = wallets.find((wallet: any) => wallet.id === parseInt(selectedCrypto));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pay KYC Fee</h2>
      <p className="text-gray-600 mb-6">Complete your KYC verification by paying the fee</p>

      {/* Fee Amount */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
        <p className="text-sm text-blue-700 mb-1">Amount to Pay</p>
        <p className="text-3xl font-bold text-blue-800">{formatCurrency(kycFee.amount)}</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onPaymentMethodSelect('bank')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  paymentMethod === 'bank'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
                    paymentMethod === 'bank' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-gray-500">Transfer to our bank account</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onPaymentMethodSelect('crypto')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  paymentMethod === 'crypto'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
                    paymentMethod === 'crypto' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium">Cryptocurrency</p>
                    <p className="text-sm text-gray-500">Pay with crypto wallet</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bank Selection */}
          {paymentMethod === 'bank' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bank *
              </label>
              {banksLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading banks...</p>
                </div>
              ) : (
                <select
                  value={selectedBank}
                  onChange={(e) => onBankSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a bank</option>
                  {banks.map((bank: any) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} - {bank.accountName}
                    </option>
                  ))}
                </select>
              )}

              {selectedBankDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Bank Transfer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="font-medium">{selectedBankDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium">{selectedBankDetails.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <div className="flex items-center">
                        <span className="font-medium font-mono mr-2">
                          {selectedBankDetails.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedBankDetails.accountNumber)}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    {selectedBankDetails.swiftCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SWIFT Code:</span>
                        <span className="font-medium">{selectedBankDetails.swiftCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Crypto Selection */}
          {paymentMethod === 'crypto' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Cryptocurrency *
              </label>
              {walletsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading wallets...</p>
                </div>
              ) : (
                <select
                  value={selectedCrypto}
                  onChange={(e) => onCryptoSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose cryptocurrency</option>
                  {wallets.map((wallet: any) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.currency} ({wallet.currencyAbbreviation})
                    </option>
                  ))}
                </select>
              )}

              {selectedWalletDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Wallet Address</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Currency:</span>
                      <span className="font-medium">
                        {selectedWalletDetails.currency} ({selectedWalletDetails.currencyAbbreviation})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet Address:</span>
                      <div className="flex items-center">
                        <span className="font-medium font-mono text-xs mr-2">
                          {selectedWalletDetails.address}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedWalletDetails.address)}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Proof Upload */}
          {paymentMethod && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Proof *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onFileSelect(file, onPaymentProofChange);
                    }
                  }}
                  className="hidden"
                  id="paymentProofUpload"
                />
                <label htmlFor="paymentProofUpload" className="cursor-pointer">
                  {paymentProof ? (
                    <div className="text-green-600">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">{paymentProof.name}</p>
                      <p className="text-sm text-gray-500">Click to change file</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="font-medium">Click to upload payment proof</p>
                      <p className="text-sm">Screenshot of transaction receipt</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!paymentMethod || !paymentProof || isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'I Have Made Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Complete!</h2>
      <p className="text-gray-600 mb-6">
        Your KYC verification is complete. Your payment proof is under review.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-green-800 text-sm">
          You will receive a notification once your payment is confirmed. 
          You can now access all mining features.
        </p>
      </div>
    </div>
  );
}