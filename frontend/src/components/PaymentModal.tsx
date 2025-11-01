'use client';

import React, { useState, useEffect } from 'react';
import { adminWalletService, API_ROUTES, apiService, bankService, miningSubscriptionService } from '@/services';
import { useApiQuery } from '@/hooks/useApi';
import { Coin, useCoins } from '@/hooks/useCoins';
import Image from 'next/image';
import { MiningSubscription } from '@/types/subscription';

export const uploadFile = async (
  file: File,
  type: 'thumbnail' | 'video' | 'image' = 'image'
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'amafor');
  formData.append('folder', 'amafor');

  const resourceType = type === 'video' ? 'video' : 'image';
  const cloudUrl = `https://api.cloudinary.com/v1_1/dh2cpesxu/${resourceType}/upload`;

  const uploadRes = await fetch(cloudUrl, { method: 'POST', body: formData });

  const data = await uploadRes.json();
  return data.url;
};

interface PaymentModalProps {
  contract: any;
  minerId: number;
  isOpen: boolean;
  subscription?: MiningSubscription;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ subscription, contract, minerId, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'coin' | 'method' | 'details' | 'proof'>('coin');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'bank' | ''>('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [subscriptionCreated, setSubscriptionCreated] = useState(false);
  const [createdSubscriptionId, setCreatedSubscriptionId] = useState<number | null>(null);
  const { data: coins, loading: coinsLoading } = useCoins();
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // If subscription is provided, user should go directly to payment details
  const isExistingSubscription = !!subscription;

  // Fetch banks and wallets
  const { data: banks, isLoading: banksLoading } = useApiQuery(
    ['banks'],
    () => bankService.getAllBanks(),
    { enabled: step === 'details' && paymentMethod === 'bank' }
  );

  const { data: wallets, isLoading: walletsLoading } = useApiQuery(
    ['wallets'],
    () => adminWalletService.getActiveWallets(),
    { enabled: step === 'details' && paymentMethod === 'crypto' }
  );

  // Initialize with existing subscription data
  useEffect(() => {
    if (isExistingSubscription && subscription) {
      setSubscriptionCreated(true);
      setCreatedSubscriptionId(subscription.id);
      
      // Pre-fill coin selection from existing subscription
      if (coins && subscription.symbol) {
        const existingCoin = coins.find((coin: Coin) =>
          coin.symbol.toLowerCase() === subscription.symbol?.toLowerCase()
        );
        if (existingCoin) {
          setSelectedCoin(existingCoin);
        }
      }
      
      // Skip to payment method step for existing subscriptions
      setStep('method');
    }
  }, [isExistingSubscription, subscription, coins]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(isExistingSubscription ? 'method' : 'coin');
      setPaymentMethod('');
      setSelectedBank('');
      setSelectedCrypto('');
      setPaymentProof(null);
      setError('');
      if (!isExistingSubscription) {
        setSelectedCoin(null);
        setSubscriptionCreated(false);
        setCreatedSubscriptionId(null);
      }
    }
  }, [isOpen, isExistingSubscription]);

  if (!isOpen) return null;

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setSearchTerm('');
    setStep('method');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handlePaymentMethodSelect = (method: 'crypto' | 'bank') => {
    setPaymentMethod(method);
    setStep('details');
    setError('');
  };

  const handleBack = () => {
    if (step === 'method') {
      if (!isExistingSubscription) {
        setStep('coin');
        setSelectedCoin(null);
      } else {
        onClose();
      }
    } else if (step === 'details') {
      setStep('method');
      setPaymentMethod('');
      setSelectedBank('');
      setSelectedCrypto('');
    } else if (step === 'proof') {
      setStep('details');
    }
  };

  const createSubscription = async () => {
      if (selectedCoin) {
      alert('Please select a coin first');
    
    }
    if (!selectedCoin) {
      setError('Please select a coin first');
      return null;
    }
   

    try {
      const newSubscription = await apiService.post(API_ROUTES.subscriptions.create(minerId),{
   
        miningContractId: contract.id,
        currency: selectedCoin.name,
        symbol: selectedCoin.image,
        Id: minerId,
      });

      setSubscriptionCreated(true);
      setCreatedSubscriptionId(newSubscription.id);
      return newSubscription.id;
    } catch (err) {
      setError('Failed to create subscription. Please try again.');
      return null;
    }
  };

  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentProof) {
      setError('Please upload payment proof');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Upload payment proof to Cloudinary first
      const paymentProofUrl = await uploadFile(paymentProof, 'image');

      const subscriptionIdToUse = subscription?.id || createdSubscriptionId;

      if (!subscriptionIdToUse) {
        setError('No subscription found. Please try again.');
        return;
      }

      // Update subscription with payment proof URL
      await miningSubscriptionService.updateSubpscriptionPaymentProof(
        subscriptionIdToUse,
        {
          paymentMethod: paymentMethod as 'bank' | 'crypto',
          paymentProof: paymentProofUrl
        }
      );
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Create subscription only for new subscriptions
      if (!subscriptionCreated && !isExistingSubscription) {
        await createSubscription();
      }

      // Move to proof step
      setStep('proof');

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy details. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    const subscriptionIdToCancel = subscription?.id || createdSubscriptionId;
    if (!subscriptionIdToCancel) return;

    setIsSubmitting(true);
    try {
      await miningSubscriptionService.cancelSubscription(subscriptionIdToCancel);
      onClose();
      onSuccess(); // Refresh the parent component
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredCoins = coins?.filter((coin: Coin) =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedBankDetails = banks?.find((bank: any) => bank.id === parseInt(selectedBank));
  const selectedWalletDetails = wallets?.find((wallet: any) => wallet.id === parseInt(selectedCrypto));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isExistingSubscription ? 'Complete Payment' : subscriptionCreated ? 'Complete Payment' : 'Subscribe to Mining Contract'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Contract #{contract.id} - {contract.miningServer?.name}
            {isExistingSubscription && subscription && (
              <span className="ml-2 text-blue-600">
                • {subscription.currency} ({subscription.symbol})
              </span>
            )}
          </p>
        </div>

        {/* Contract Summary */}
        <div className="p-6 bg-blue-50 border-b border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-700">Minimum Deposit</p>
              <p className="text-2xl font-bold text-blue-800">
                {formatCurrency(contract.minimumDeposit || 100)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">Return Rate</p>
              <p className="text-xl font-bold text-blue-800">{contract.periodReturn}% {contract.period}</p>
            </div>
          </div>
          {isExistingSubscription && subscription && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                Subscription Status: <span className="font-semibold capitalize">{subscription.amountDeposited?'Active' : 'Pending Payment'}</span>
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {['coin', 'method', 'details', 'proof']
              .filter(step => !isExistingSubscription || step !== 'coin') // Hide coin step for existing subscriptions
              .map((s, index) => (
                <React.Fragment key={s}>
                  <div className={`flex flex-col items-center ${getStepStatus(s, step, isExistingSubscription)}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepStatus(s, step, isExistingSubscription) === 'completed'
                      ? 'bg-green-600 text-white'
                      : getStepStatus(s, step, isExistingSubscription) === 'current'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                      }`}>
                      {isExistingSubscription ? index + 1 : index + 1}
                    </div>
                    <span className="text-xs mt-1 capitalize">{s}</span>
                  </div>
                  {index < (isExistingSubscription ? 2 : 3) && (
                    <div className={`w-8 h-1 ${getStepStatus(s, step, isExistingSubscription) === 'completed'
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                      }`} />
                  )}
                </React.Fragment>
              ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 'coin' && !isExistingSubscription && (
            <CoinSelectionStep
              coinsLoading={coinsLoading}
              filteredCoins={filteredCoins}
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              clearSearch={clearSearch}
              selectedCoin={selectedCoin}
              handleCoinSelect={handleCoinSelect}
            />
          )}

          {step === 'method' && (
            <PaymentMethodStep
              onMethodSelect={handlePaymentMethodSelect}
              onBack={handleBack}
              isExistingSubscription={isExistingSubscription}
            />
          )}

          {step === 'details' && (
            <PaymentDetailsStep
              paymentMethod={paymentMethod}
              selectedBank={selectedBank}
              selectedCrypto={selectedCrypto}
              banks={banks || []}
              wallets={wallets || []}
              onBankSelect={setSelectedBank}
              onCryptoSelect={setSelectedCrypto}
              onCopy={copyToClipboard}
              onBack={handleBack}
              banksLoading={banksLoading}
              walletsLoading={walletsLoading}
              copied={copied}
              selectedBankDetails={selectedBankDetails}
              selectedWalletDetails={selectedWalletDetails}
              isExistingSubscription={isExistingSubscription}
            />
          )}

          {step === 'proof' && (
            <PaymentProofStep
              paymentMethod={paymentMethod}
              paymentProof={paymentProof}
              onPaymentProofChange={setPaymentProof}
              onSubmit={handlePaymentSubmission}
              onBack={handleBack}
              onCancel={handleCancelSubscription}
              isSubmitting={isSubmitting}
              error={error}
              selectedBankDetails={selectedBankDetails}
              selectedWalletDetails={selectedWalletDetails}
              subscriptionCreated={subscriptionCreated || isExistingSubscription}
              isExistingSubscription={isExistingSubscription}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function getStepStatus(step: string, currentStep: string, isExistingSubscription: boolean) {
  const steps = isExistingSubscription ? ['method', 'details', 'proof'] : ['coin', 'method', 'details', 'proof'];
  const currentIndex = steps.indexOf(currentStep);
  const stepIndex = steps.indexOf(step);

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
}


function CoinSelectionStep({
  coinsLoading,
  filteredCoins,
  searchTerm,
  handleSearchChange,
  clearSearch,
  selectedCoin,
  handleCoinSelect
}: any) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Coin to Mine</h3>
      <p className="text-gray-600 mb-6">Choose which cryptocurrency you want to mine with this contract</p>

      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search coins by name or symbol..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {coinsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading coins...</p>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
          {filteredCoins.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No coins found matching your search.' : 'No coins available.'}
            </div>
          ) : (
            filteredCoins.map((coin: Coin) => (
              <div
                key={coin.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${selectedCoin?.id === coin.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                onClick={() => handleCoinSelect(coin)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 truncate">{coin.name}</span>
                      <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                        {coin.symbol.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      ${coin.current_price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedCoin && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Selected Coin</h4>
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={selectedCoin.image}
                alt={selectedCoin.name}
                fill
                className="rounded-full object-cover"
                sizes="40px"
              />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-green-900 truncate">{selectedCoin.name}</p>
              <p className="text-sm text-green-700">{selectedCoin.symbol.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentMethodStep({ onMethodSelect, onBack }: any) {
  return (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onMethodSelect('bank')}
          className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Bank Transfer</p>
              <p className="text-sm text-gray-600">Transfer to our bank account</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onMethodSelect('crypto')}
          className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-10h-1M4 12H3m17.5-6.5L18 7m-12 5l-1.5 1.5M18 7l-1.5-1.5M18 7l1.5-1.5M6 17l-1.5 1.5" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Cryptocurrency</p>
              <p className="text-sm text-gray-600">Pay with crypto wallet</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function PaymentDetailsStep({
  paymentMethod,
  selectedBank,
  selectedCrypto,
  banks,
  wallets,
  onBankSelect,
  onCryptoSelect,
  onCopy,
  onBack,
  banksLoading,
  walletsLoading,
  copied,
  selectedBankDetails,
  selectedWalletDetails
}: any) {
  const canCopy = paymentMethod === 'bank' ? selectedBank : selectedCrypto;

  return (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {paymentMethod === 'bank' ? 'Select Bank' : 'Select Cryptocurrency'}
        </h3>
      </div>

      {paymentMethod === 'bank' && (
        <div className="space-y-4">
          {banksLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading banks...</p>
            </div>
          ) : (
            <>
              <select
                value={selectedBank}
                onChange={(e) => onBankSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a bank</option>
                {banks.map((bank: any) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} - {bank.accountName}
                  </option>
                ))}
              </select>

              {selectedBankDetails && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Bank Transfer Details</h4>
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
                          onClick={() => onCopy(selectedBankDetails.accountNumber)}
                          disabled={!canCopy}
                          className="text-blue-600 hover:text-blue-700 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
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
            </>
          )}
        </div>
      )}

      {paymentMethod === 'crypto' && (
        <div className="space-y-4">
          {walletsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading wallets...</p>
            </div>
          ) : (
            <>
              <select
                value={selectedCrypto}
                onChange={(e) => onCryptoSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose cryptocurrency</option>
                {wallets.map((wallet: any) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.currency} ({wallet.currencyAbbreviation})
                  </option>
                ))}
              </select>

              {selectedWalletDetails && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Wallet Address</h4>
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
                          onClick={() => onCopy(selectedWalletDetails.address)}
                          disabled={!canCopy}
                          className="text-blue-600 hover:text-blue-700 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentProofStep({
  paymentMethod,
  paymentProof,
  onPaymentProofChange,
  onSubmit,
  onBack,
  onCancel,
  isSubmitting,
  error,
  selectedBankDetails,
  selectedWalletDetails,
  subscriptionCreated
}: any) {
  return (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Upload Payment Proof</h3>
      </div>

      {/* Subscription Created Notice */}
      {subscriptionCreated && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-medium">Subscription Created!</p>
              <p>Please make the payment and upload proof below. You can cancel if you change your mind.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          {/* Payment Details Reminder */}
          {paymentMethod === 'bank' && selectedBankDetails && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Bank Details</h4>
              <div className="text-sm">
                <p><span className="font-medium">Bank:</span> {selectedBankDetails.name}</p>
                <p><span className="font-medium">Account:</span> {selectedBankDetails.accountNumber}</p>
              </div>
            </div>
          )}

          {paymentMethod === 'crypto' && selectedWalletDetails && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2">Wallet Details</h4>
              <div className="text-sm">
                <p><span className="font-medium">Currency:</span> {selectedWalletDetails.currency}</p>
                <p><span className="font-medium">Address:</span> {selectedWalletDetails.address}</p>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Proof *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => onPaymentProofChange(e.target.files?.[0] || null)}
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-between space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border border-red-300 text-red-700 py-2 px-6 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Cancel Subscription
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onBack}
                className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!paymentProof || isSubmitting}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}