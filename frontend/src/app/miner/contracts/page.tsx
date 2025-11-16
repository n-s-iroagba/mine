'use client';

import React, { useState } from 'react';
import { miningContractService, miningSubscriptionService } from '@/services';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PaymentModal } from '@/components/PaymentModal';
import {  useRequiredAuth } from '@/context/AuthContext';
import { MiningContract } from '@/types/api';
import { DepositStatus, MiningSubscriptionWithTransactions } from '@/types/subscription';
import { useApiQuery } from '@/hooks/useApi';

export default function MiningContractsPage() {
  const { user } = useRequiredAuth();
  const minerId = user?.roleId;
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscribed, setSubscribed] = useState<MiningSubscriptionWithTransactions | undefined>(undefined);
  
  const { data: contracts = [], isLoading } = useApiQuery(
    ['mining-contracts'],
    () => miningContractService.getAllContracts()
  );

  const { data: existingSubscriptions = [] } = useApiQuery<MiningSubscriptionWithTransactions[]>(
    ['miner-subscriptions', minerId],
    () => miningSubscriptionService.getSubscriptionsByMinerId(minerId!),
    { enabled: !!minerId }
  );

  const isSubscribed = (contractId: number) => {
    return existingSubscriptions.some((sub: any) => sub.miningContractId === contractId);
  };

  const handleSubscribe = (contract: MiningContract) => {
    const subscription = existingSubscriptions.find((sub: MiningSubscriptionWithTransactions) => 
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

  // Get contract duration in days based on period
  const getContractDuration = () => {
    switch (contract.period) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'fortnightly': return 14;
      case 'monthly': return 30;
      default: return 30;
    }
  };

  // Calculate mining progress based on earnings vs potential
  const calculateMiningProgress = () => {
    if (!subscription || !contract) return 0;

    const totalEarnings = Number(subscription.total) || 0;
    const amountDeposited = Number(subscription.amountDeposited) || 0;
    const periodReturn = Number(contract.periodReturn) || 0;

    // Prevent division by zero or invalid calculations
    if (amountDeposited <= 0 || periodReturn <= 0) return 0;

    const totalPotential = amountDeposited * (periodReturn / 100);
    const progress = (totalEarnings / totalPotential) * 100;

    // Clamp between 0 and 100
    return Math.min(Math.max(progress, 0), 100);
  };

  // Calculate days since first payment for payout eligibility
  const calculateDaysSinceFirstPayment = () => {
    if (!subscription?.dateOfFirstPayment) return 0;
    
    const firstPaymentDate = new Date(subscription.dateOfFirstPayment);
    const currentDate = new Date();
    
    // Reset both dates to midnight for accurate day calculation
    const firstPaymentMidnight = new Date(firstPaymentDate.getFullYear(), firstPaymentDate.getMonth(), firstPaymentDate.getDate());
    const currentDateMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    const timeDifference = currentDateMidnight.getTime() - firstPaymentMidnight.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    return Math.max(daysDifference, 0);
  };

  // Determine payout eligibility based on first deposit date and contract period
  const isPayoutEligible = () => {
    if (!subscription?.dateOfFirstPayment) return false;
    const daysSinceFirstPayment = calculateDaysSinceFirstPayment();
    const contractDuration = getContractDuration();
    
    // Payout becomes eligible after contract duration
    return daysSinceFirstPayment >= contractDuration;
  };

  // Calculate next payout date based on contract period
  const calculateNextPayout = () => {
    if (!subscription?.dateOfFirstPayment) return null;
    
    const firstPaymentDate = new Date(subscription.dateOfFirstPayment);
    const daysSinceFirstPayment = calculateDaysSinceFirstPayment();
    const contractDuration = getContractDuration();
    
    // Calculate days until the contract duration is reached
    const daysUntilEligibility = contractDuration - daysSinceFirstPayment;
    
    const nextPayout = new Date();
    nextPayout.setDate(nextPayout.getDate() + daysUntilEligibility);
    return nextPayout;
  };

  // Calculate withdrawal availability date based on contract period
  const calculateWithdrawalDate = () => {
    if (!subscription?.dateOfFirstPayment) return null;
    
    const firstPaymentDate = new Date(subscription.dateOfFirstPayment);
    const contractDuration = getContractDuration();
    const withdrawalDate = new Date(firstPaymentDate);
    withdrawalDate.setDate(firstPaymentDate.getDate() + contractDuration);
    return withdrawalDate;
  };

  // Calculate days until withdrawal/payout becomes available
  const calculateDaysUntilAvailable = () => {
    if (!subscription?.dateOfFirstPayment) return getContractDuration();
    
    const daysSinceFirstPayment = calculateDaysSinceFirstPayment();
    const contractDuration = getContractDuration();
    
    // Days until eligibility
    const daysUntilEligibility = contractDuration - daysSinceFirstPayment;
    
    // Ensure it's never negative and never 0 on the first day
    return Math.max(daysUntilEligibility, 1);
  };

  const calculateROI = () => {
    if (!subscription) return 0;
    const totalReturn = subscription.total || 0;
    const investment = subscription.amountDeposited || 0;
    return investment > 0 ? (totalReturn / investment) * 100 : 0;
  };

  // Determine card status based on deposit status and amount
  const getCardStatus = () => {
    if (!subscription) return 'not_subscribed';

    const { depositStatus, amountDeposited } = subscription;

    switch (depositStatus) {
      case DepositStatus.NO_DEPOSIT:
        return 'no_deposit';
      
      case DepositStatus.PENDING:
        if (amountDeposited > 0) {
          return 'pending_with_amount';
        } else {
          return 'pending_no_amount';
        }
      
      case DepositStatus.INCOMPLETE:
        return 'incomplete_deposit';
      
      case DepositStatus.COMPLETE_DEPOSIT:
        return isPayoutEligible() ? 'active_with_payout' : 'active_mining';
      
      default:
        return 'unknown';
    }
  };

  const miningProgress = calculateMiningProgress();
  const daysUntilAvailable = calculateDaysUntilAvailable();
  const daysSinceFirstPayment = calculateDaysSinceFirstPayment();
  const contractDuration = getContractDuration();
  const nextPayout = calculateNextPayout();
  const withdrawalDate = calculateWithdrawalDate();
  const roi = calculateROI();
  const cardStatus = getCardStatus();

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
    if (days < Math.ceil(contractDuration * 0.25)) return 'text-red-600 bg-red-50';
    if (days < Math.ceil(contractDuration * 0.5)) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  // Get period display name
  const getPeriodDisplayName = () => {
    switch (contract.period) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'fortnightly': return 'Fortnightly';
      case 'monthly': return 'Monthly';
      default: return contract.period;
    }
  };

const renderStatusBadge = () => {
  if (!subscription) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
        ✖️ Not Subscribed
      </Badge>
    );
  }

  const { depositStatus, amountDeposited } = subscription;

  switch (depositStatus) {

    case DepositStatus.NO_DEPOSIT:
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
          ⏳ Awaiting Deposit
        </Badge>
      );

    case DepositStatus.PENDING:
      if (amountDeposited > 0) {
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  🔄 New Deposit Verification Pending
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
               🔄 Deposit Verification Pending
        </Badge>
      );

    case DepositStatus.INCOMPLETE:
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          💰 Complete Deposit
        </Badge>
      );

    case DepositStatus.COMPLETE_DEPOSIT:
      return isPayoutEligible() ? (
        <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">
          🎉 Ready for Payout!
        </Badge>
      ) : (
        <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
          ⛏️ Active Mining ({daysSinceFirstPayment}/{contractDuration} days)
        </Badge>
      );

    default:
      return null;
  }
};


  // Get main action button based on status
  const renderActionButton = () => {
    const buttonBaseClass = "w-full py-4 px-6 rounded-xl font-semibold shadow-inner flex items-center justify-center space-x-2 transition-all duration-300";
    
    switch (cardStatus) {
      case 'no_deposit':
      case 'pending_no_amount':
        return (
          <button
            onClick={() => onSubscribe(contract)}
            className={`${buttonBaseClass} bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transform hover:-translate-y-1`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Start Mining - Deposit Now</span>
          </button>
        );
      
      case 'pending_with_amount':
        return (
          <button
            className={`${buttonBaseClass} bg-gradient-to-r from-yellow-500 to-orange-600 text-white cursor-not-allowed opacity-90`}
            disabled
          >
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Verification in Progress...</span>
          </button>
        );
      
      case 'incomplete_deposit':
        return (
          <button
            onClick={() => onSubscribe(contract)}
            className={`${buttonBaseClass} bg-gradient-to-r from-purple-600 to-pink-700 text-white hover:from-purple-700 hover:to-pink-800 transform hover:-translate-y-1`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Complete Deposit to Start Mining</span>
          </button>
        );
      
      case 'active_mining':
        return (
          <button
            className={`${buttonBaseClass} bg-gradient-to-r from-green-600 to-emerald-700 text-white cursor-not-allowed`}
            disabled
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>⛏️ Active Mining (Day {daysSinceFirstPayment + 1})</span>
          </button>
        );
      
      case 'active_with_payout':
        return (
          <button
            onClick={() => onSubscribe(contract)} // This could trigger payout
            className={`${buttonBaseClass} bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:from-emerald-700 hover:to-green-800 transform hover:-translate-y-1 shadow-lg`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>💰 Withdraw Earnings</span>
          </button>
        );
      
      default:
        return (
          <button
            onClick={() => onSubscribe(contract)}
            className={`${buttonBaseClass} bg-gradient-to-r from-gray-600 to-gray-700 text-white`}
          >
            <span>Subscribe to Mine</span>
          </button>
        );
    }
  };

  // Render payout eligibility section
  const renderPayoutEligibility = () => {
    if (!subscription?.dateOfFirstPayment) return null;

    const daysSinceFirstPayment = calculateDaysSinceFirstPayment();
    const isEligible = isPayoutEligible();

    return (
      <div className={`rounded-xl p-4 border ${
        isEligible 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-semibold text-gray-900">Payout Status</h5>
          {isEligible ? (
            <Badge variant="default" className="bg-emerald-100 text-emerald-700">
              🎉 Eligible
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              ⏳ Day {daysSinceFirstPayment + 1} of {contractDuration}
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          {isEligible ? (
            <p>Your {getPeriodDisplayName().toLowerCase()} earnings are ready for withdrawal! 🎊</p>
          ) : (
            <div>
              <p>
                <strong>Progress:</strong> {daysSinceFirstPayment} of {contractDuration} days completed
              </p>
              <p className="mt-1">
                <strong>Time remaining:</strong> {daysUntilAvailable} {daysUntilAvailable === 1 ? 'day' : 'days'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getPeriodDisplayName()} contract • {contract.periodReturn}% return
              </p>
            </div>
          )}
        </div>

        {nextPayout && !isEligible && (
          <div className="mt-2 text-xs text-blue-600">
            Estimated payout date: {formatDate(nextPayout)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">{contract.miningServer?.name}</h3>
            <p className="text-blue-100 opacity-90">
              {cardStatus === 'active_with_payout' ? 'Ready for Withdrawal!' : `${getPeriodDisplayName()} Mining Contract`}
            </p>
          </div>
          {renderStatusBadge()}
        </div>
        
        {/* Period Badge */}
        <div className="absolute -bottom-4 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold">{getPeriodDisplayName()}</span>
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
            <div className="text-sm text-gray-600 mb-1">Contract Period</div>
            <div className="font-bold text-gray-900 text-lg">{getPeriodDisplayName()}</div>
          </div>
        </div>

        {/* Subscription Status - Expanded */}
        {subscription && (
          <div className="mb-6 space-y-6">
            {/* Mining Progress Section */}
            {(cardStatus === 'active_mining' || cardStatus === 'active_with_payout' || cardStatus === 'incomplete_deposit') && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-blue-900 text-lg">Mining Progress</h4>
                  {cardStatus === 'active_mining' && (
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(daysUntilAvailable)}`}>
                      {daysUntilAvailable} {daysUntilAvailable === 1 ? 'day' : 'days'} remaining
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-blue-800 mb-2">
                    <span>Mining Progress</span>
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
                    <div className="font-bold text-blue-600">${subscription.total}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-xs text-gray-600">Day {daysSinceFirstPayment + 1}</div>
                    <div className="font-bold text-purple-600">
                      +${((subscription.total || 0) / Math.max(daysSinceFirstPayment, 1)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payout Eligibility Section */}
            {renderPayoutEligibility()}

            {/* Rest of your component remains the same... */}
          </div>
        )}

        {/* Return Rate Highlight */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center mb-6">
          <div className="text-3xl font-bold text-green-600 mb-2">{contract.periodReturn}%</div>
          <p className="text-green-700 font-semibold">{getPeriodDisplayName()} Return Rate</p>
          <p className="text-sm text-green-600 mt-2">
            Projected return: ${((subscription?.amountDeposited || 0) * (contract.periodReturn / 100)).toFixed(2)}
          </p>
        </div>

        {/* Dynamic Action Button */}
        {renderActionButton()}
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
            <div className="font-bold text-gray-900 text-sm">{contract.miningServer?.hashRate} EH/s</div>
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
            {contract.period} payouts.
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