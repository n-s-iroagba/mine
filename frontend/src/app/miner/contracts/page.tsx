'use client';

import React, { useState } from 'react';
import { miningContractService, miningSubscriptionService } from '@/services';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/PaymentModal';
import { useApiQuery } from '@/hooks/useApi';
import { useAuth, useRequiredAuth } from '@/context/AuthContext';
import { MiningContract } from '@/types/api';
import { MiningSubscription } from '@/types/subscription';

export default function MiningContractsPage() {
  const { user } = useRequiredAuth();
  const minerId = user.roleId;
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscribed, setSubscribed] = useState<MiningSubscription | undefined>(undefined);
  
  const { data: contracts = [], isLoading } = useApiQuery(
    ['mining-contracts'],
    () => miningContractService.getAllContracts()
  );

  const { data: existingSubscriptions = [] } = useApiQuery<MiningSubscription[]>(
    ['miner-subscriptions', minerId],
    () => miningSubscriptionService.getSubscriptionsByMinerId(minerId!),
    { enabled: !!minerId }
  );

  const isSubscribed = (contractId: number) => {
    return existingSubscriptions.some((sub: any) => sub.miningContractId === contractId);
  };

  const handleSubscribe = (contract: MiningContract) => {
    const subscription = existingSubscriptions.find((sub: MiningSubscription) => 
      sub.miningContractId === contract.id
    );
    
    if (isSubscribed(contract.id)) {
      setSubscribed(subscription);
    }
    
    setSelectedContract(contract);
    setShowPaymentModal(true);
  };

  const getSubscriptionData = (contractId: number) => {
    return existingSubscriptions.find((sub: any) => sub.miningContractId === contractId);
  };

  // Separate contracts with and without subscriptions
  const subscribedContracts = contracts.filter((contract: MiningContract) => 
    isSubscribed(contract.id)
  );
  
  const unsubscribedContracts = contracts.filter((contract: MiningContract) => 
    !isSubscribed(contract.id)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-2xl font-bold text-gray-600 mb-2">Loading Mining Contracts...</div>
            <p className="text-gray-500">Preparing your mining opportunities</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Mining Contracts</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your mining strategy and start earning passive income with our advanced mining infrastructure
          </p>
        </div>

        {/* Active Subscriptions Section */}
        {subscribedContracts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Mining Contracts</h2>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {subscribedContracts.length} Active
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {subscribedContracts.map((contract: MiningContract) => (
                <LargeContractCard
                  key={contract.id}
                  contract={contract}
                  isSubscribed={isSubscribed(contract.id)}
                  subscription={getSubscriptionData(contract.id)}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Contracts Section */}
        {unsubscribedContracts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Contracts</h2>
              <Badge variant="outline" className="text-gray-600">
                {unsubscribedContracts.length} Available
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unsubscribedContracts.map((contract: MiningContract) => (
                <SmallContractCard
                  key={contract.id}
                  contract={contract}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedContract && (
          <PaymentModal
            contract={selectedContract}
            minerId={minerId!}
            isOpen={showPaymentModal}
            subscription={subscribed}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedContract(null);
            }}
            onSuccess={() => {
              setShowPaymentModal(false);
              setSelectedContract(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Large Card for Subscribed Contracts
function LargeContractCard({ contract, isSubscribed, subscription, onSubscribe }: any) {
  const [showDetails, setShowDetails] = useState(false);

  const getPeriodBadgeVariant = (period: string) => {
    switch (period) {
      case 'daily': return 'default';
      case 'weekly': return 'secondary';
      case 'fortnightly': return 'outline';
      case 'monthly': return 'destructive';
      default: return 'default';
    }
  };

const calculateMiningProgress = () => {
  if (!subscription || !contract) return 0;

  const totalEarnings = Number(subscription.earnings) || 0;
  const amountDeposited = Number(subscription.amountDeposited) || 0;
  const periodReturn = Number(contract.periodReturn) || 0;

  // Prevent division by zero or invalid calculations
  if (amountDeposited <= 0 || periodReturn <= 0) return 0;

  const totalPotential = amountDeposited * (periodReturn / 100);
  const progress = (totalEarnings / totalPotential) * 100;

  // Clamp between 0 and 100
  return Math.min(Math.max(progress, 0), 100);
};


  const calculateDaysLeft = () => {
    if (!subscription?.createdAt) return 0;
    const contractDays = 30;
    const startDate = new Date(subscription.createdAt);
    const currentDate = new Date();
    const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(contractDays - daysPassed, 0);
  };

  const calculateNextPayout = () => {
    if (!subscription?.createdAt) return null;
    const startDate = new Date(subscription.createdAt);
    const nextPayout = new Date(startDate);
    nextPayout.setDate(startDate.getDate() + 7);
    return nextPayout;
  };

  const calculateWithdrawalDate = () => {
    if (!subscription?.createdAt) return null;
    const startDate = new Date(subscription.createdAt);
    const withdrawalDate = new Date(startDate);
    withdrawalDate.setDate(startDate.getDate() + 30);
    return withdrawalDate;
  };

  const calculateROI = () => {
    if (!subscription) return 0;
    const totalReturn = subscription.earnings || 0;
    const investment = subscription.amountDeposited || 0;
    return investment > 0 ? (totalReturn / investment) * 100 : 0;
  };

  const miningProgress = calculateMiningProgress();
  const daysLeft = calculateDaysLeft();
  const nextPayout = calculateNextPayout();
  const withdrawalDate = calculateWithdrawalDate();
  const roi = calculateROI();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'from-red-500 to-orange-500';
    if (progress < 70) return 'from-orange-500 to-yellow-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStatusColor = (days: number) => {
    if (days < 7) return 'text-red-600 bg-red-50';
    if (days < 14) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">{contract.miningServer?.name}</h3>
            <p className="text-blue-100 opacity-90">Active Mining</p>
          </div>
          <Badge variant={getPeriodBadgeVariant(contract.period)} className="bg-white text-blue-600 font-semibold">
            {contract.period.charAt(0).toUpperCase() + contract.period.slice(1)} Returns
          </Badge>
        </div>
        
        {/* ROI Badge */}
        <div className="absolute -bottom-4 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold">{roi.toFixed(1)}% ROI</span>
        </div>
      </div>

      <div className="p-6">
        {/* Server Specifications */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Hash Rate</div>
            <div className="font-bold text-gray-900 text-lg">{contract.miningServer?.hashRate} EH/s</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Power Usage</div>
            <div className="font-bold text-gray-900 text-lg">{contract.miningServer?.powerConsumptionInKwH} KwH</div>
          </div>
        </div>

        {/* Subscription Status - Expanded */}
        {subscription && (
          <div className="mb-6 space-y-6">
            {/* Mining Progress Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-blue-900 text-lg">Mining Progress</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(daysLeft)}`}>
                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-blue-800 mb-2">
                  <span>Progress</span>
                  <span className="font-bold">{miningProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className={`bg-gradient-to-r ${getProgressColor(miningProgress)} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${miningProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded-lg p-2">
                  <div className="text-xs text-gray-600">Invested</div>
                  <div className="font-bold text-green-600">${subscription.amountDeposited}</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-xs text-gray-600">Earned</div>
                  <div className="font-bold text-blue-600">${subscription.earnings}</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-xs text-gray-600">Daily</div>
                  <div className="font-bold text-purple-600">+${((subscription.earnings || 0) / 30)}</div>
                </div>
              </div>
            </div>

            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="font-semibold">{showDetails ? 'Hide' : 'Show'} Detailed Information</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Details */}
            {showDetails && (
              <div className="space-y-4 animate-fadeIn">
                {/* Mining Asset */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Mining Asset</h5>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{subscription.symbol?.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{subscription.currency}</div>
                      <div className="text-sm text-gray-600">{subscription.symbol}</div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Timeline</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Start Date</span>
                      <span className="font-semibold">{subscription.createdAt ? formatDate(new Date(subscription.createdAt)) : 'N/A'}</span>
                    </div>
                    {nextPayout && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Next Payout</span>
                        <span className="font-semibold text-green-600">{formatDate(nextPayout)}</span>
                      </div>
                    )}
                    {withdrawalDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Withdrawal Available</span>
                        <span className="font-semibold text-blue-600">{formatDate(withdrawalDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
                  <h5 className="font-semibold text-purple-900 mb-3">Performance Metrics</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{contract.periodReturn}%</div>
                      <div className="text-xs text-purple-700">Return Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{roi.toFixed(1)}%</div>
                      <div className="text-xs text-green-700">Current ROI</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Return Rate Highlight */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center mb-6">
          <div className="text-3xl font-bold text-green-600 mb-2">{contract.periodReturn}%</div>
          <p className="text-green-700 font-semibold">Period Return Rate</p>
          <p className="text-sm text-green-600 mt-2">
            Projected return: ${((subscription?.amountDeposited || 0) * (contract.periodReturn / 100)).toFixed(2)}
          </p>
        </div>

        {/* Active Mining Button */}
        <button
          disabled
          className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-xl font-semibold cursor-not-allowed shadow-inner flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{subscription?.amountDeposited===0?'⛏️ Active Mining':'Complete Deposit'}</span>
        </button>
      </div>
    </div>
  );
}

// Small Card for Unsubscribed Contracts
function SmallContractCard({ contract, onSubscribe }: any) {
  const getPeriodBadgeVariant = (period: string) => {
    switch (period) {
      case 'daily': return 'default';
      case 'weekly': return 'secondary';
      case 'fortnightly': return 'outline';
      case 'monthly': return 'destructive';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold mb-1 truncate">{contract.miningServer?.name}</h3>
            <p className="text-blue-100 opacity-90 text-sm">Available for Mining</p>
          </div>
          <Badge variant={getPeriodBadgeVariant(contract.period)} className="bg-white text-blue-600 font-semibold text-xs">
            {contract.period.charAt(0).toUpperCase() + contract.period.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Hash Rate</div>
            <div className="font-bold text-gray-900 text-sm">{contract.miningServer?.hashRate}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Min Deposit</div>
            <div className="font-bold text-gray-900 text-sm">{formatCurrency(contract.minimumDeposit || 100)}</div>
          </div>
        </div>

        {/* Return Rate */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 text-center mb-4">
          <div className="text-xl font-bold text-green-600">{contract.periodReturn}%</div>
          <p className="text-green-700 font-semibold text-xs">Return Rate</p>
        </div>

        {/* Features (Collapsed) */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3 h-3 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Real-time monitoring
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3 h-3 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Daily payouts
          </div>
        </div>

        {/* Subscribe Button */}
        <button
          onClick={() => onSubscribe(contract)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Start Mining</span>
        </button>
      </div>
    </div>
  );
}