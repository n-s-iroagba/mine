'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '@/components/ui/badge';
import { kycService, miningSubscriptionService, transactionService } from '@/services';
import { KYCStats, TransactionStats } from '@/types/api';
import { MiningSubscription } from '@/types/subscription';
import { ApiError } from '@/types/api';
import { minerService } from '@/services/minerService';

interface DashboardData {
  kycStats: KYCStats | null;
  transactionStats: TransactionStats | null;
  subscriptions: MiningSubscription[];
  recentSubscriptions: MiningSubscription[];
  totalMiners: number;
}

interface ServiceErrors {
  kyc: boolean;
  transactions: boolean;
  subscriptions: boolean;
  miners: boolean;
}

interface ErrorMessages {
  kyc: string;
  transactions: string;
  subscriptions: string;
  miners: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    kycStats: null,
    transactionStats: null,
    subscriptions: [],
    recentSubscriptions: [],
    totalMiners: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ServiceErrors>({
    kyc: false,
    transactions: false,
    subscriptions: false,
    miners: false,
  });
  const [errorMessages, setErrorMessages] = useState<ErrorMessages>({
    kyc: '',
    transactions: '',
    subscriptions: '',
    miners: '',
  });

  // Helper function to extract error message from ApiError
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        return apiError.response.data.message;
      }
      if ((error as Error).message) {
        return (error as Error).message;
      }
    }
    return 'An unexpected error occurred';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const newErrors: ServiceErrors = {
          kyc: false,
          transactions: false,
          subscriptions: false,
          miners: false,
        };
        const newErrorMessages: ErrorMessages = {
          kyc: '',
          transactions: '',
          subscriptions: '',
          miners: '',
        };

        // Fetch KYC stats
        let kycStats: KYCStats | null = null;
        try {
          kycStats = await kycService.getKYCStats();
        } catch (err) {
          console.error('KYC stats error:', err);
          newErrors.kyc = true;
          newErrorMessages.kyc = getErrorMessage(err);
        }

        // Fetch transaction stats
        let transactionStats: TransactionStats | null = null;
        try {
          transactionStats = await transactionService.getTransactionStats();
        } catch (err) {
          console.error('Transaction stats error:', err);
          newErrors.transactions = true;
          newErrorMessages.transactions = getErrorMessage(err);
        }

        // Fetch subscriptions
        let allSubscriptions: MiningSubscription[] = [];
        try {
          allSubscriptions = await miningSubscriptionService.getAllSubscriptions();
        } catch (err) {
          console.error('Subscriptions error:', err);
          newErrors.subscriptions = true;
          newErrorMessages.subscriptions = getErrorMessage(err);
        }

        // Fetch miners to get total count
        let totalMiners = 0;
        try {
          const miners = await minerService.getAllMiners();
          totalMiners = miners.length;
        } catch (err) {
          console.error('Miners fetch error:', err);
          newErrors.miners = true;
          newErrorMessages.miners = getErrorMessage(err);
        }

        // Get recent subscriptions (last 5, sorted by creation date)
        const recentSubs = [...allSubscriptions]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setData({
          kycStats,
          transactionStats,
          subscriptions: allSubscriptions,
          recentSubscriptions: recentSubs,
          totalMiners,
        });
        setErrors(newErrors);
        setErrorMessages(newErrorMessages);
      } catch (err) {
        console.error('Dashboard error:', err);
        // Set general error state if the entire fetch fails
        setErrors({
          kyc: true,
          transactions: true,
          subscriptions: true,
          miners: true,
        });
        setErrorMessages({
          kyc: getErrorMessage(err),
          transactions: getErrorMessage(err),
          subscriptions: getErrorMessage(err),
          miners: getErrorMessage(err),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate stats with fallbacks
  const activeSubscriptions = data.subscriptions.length;
  const totalRevenue = data.subscriptions.reduce((sum, sub) => sum + sub.amountDeposited, 0);
  const previousMonthRevenue = totalRevenue * 0.81; // Mock comparison
  const revenueChange = totalRevenue > 0 
    ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(0)
    : '0';

  const stats = [
    { 
      name: 'Total Miners', 
      value: loading ? '...' : errors.miners ? 'N/A' : data.totalMiners.toLocaleString(), 
      change: errors.miners ? `Error: ${errorMessages.miners}` : '+12%', 
      changeType: errors.miners ? 'negative' : 'positive' as const,
      error: errors.miners,
      errorMessage: errorMessages.miners
    },
    { 
      name: 'Active Subscriptions', 
      value: loading ? '...' : errors.subscriptions ? 'N/A' : activeSubscriptions.toLocaleString(), 
      change: errors.subscriptions ? `Error: ${errorMessages.subscriptions}` : `${((activeSubscriptions / Math.max(data.totalMiners, 1)) * 100).toFixed(0)}% of miners`, 
      changeType: errors.subscriptions ? 'negative' : 'positive' as const,
      error: errors.subscriptions,
      errorMessage: errorMessages.subscriptions
    },
    { 
      name: 'Total Revenue', 
      value: loading ? '...' : errors.subscriptions ? 'N/A' : `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: errors.subscriptions ? `Error: ${errorMessages.subscriptions}` : `+${revenueChange}%`, 
      changeType: errors.subscriptions ? 'negative' : 'positive' as const,
      error: errors.subscriptions,
      errorMessage: errorMessages.subscriptions
    },
    { 
      name: 'Pending KYC', 
      value: loading ? '...' : errors.kyc ? 'N/A' : (data.kycStats?.pendingKYC || 0).toLocaleString(), 
      change: errors.kyc ? `Error: ${errorMessages.kyc}` : data.kycStats ? `${data.kycStats.approvalRate.toFixed(0)}% approval` : '0%', 
      changeType: errors.kyc ? 'negative' : 'negative' as const,
      error: errors.kyc,
      errorMessage: errorMessages.kyc
    },
  ];

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return `${seconds} sec ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
      return `${Math.floor(seconds / 86400)} days ago`;
    } catch {
      return 'Unknown';
    }
  };

  const recentActivity = data.recentSubscriptions.map((sub) => ({
    id: sub.id,
    user: sub.miner ? `${sub.miner.firstname || ''} ${sub.miner.lastname || ''}`.trim() || `Miner #${sub.minerId}` : `Miner #${sub.minerId}`,
    action: sub.updatedAt > sub.createdAt ? ' Subscription was updated' : 'Created subscription',
    time: formatTimeAgo(new Date(sub.createdAt).toDateString()),
    type: 'subscription' as const,
  }));

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'subscription': return 'secondary';
      case 'kyc': return 'default';
      case 'payment': return 'secondary';
      case 'registration': return 'default';
      default: return 'default';
    }
  };

  // System status based on real data
  const systemStatus = [
    {
      name: 'API',
      status: 'Operational',
      healthy: true,
    },
    {
      name: 'Database',
      status: errors.subscriptions ? `Error: ${errorMessages.subscriptions}` : data.subscriptions.length > 0 ? 'Healthy' : 'No Data',
      healthy: !errors.subscriptions && data.subscriptions.length > 0,
    },
    {
      name: 'Transactions',
      status: errors.transactions 
        ? `Error: ${errorMessages.transactions}`
        : data.transactionStats 
          ? `${data.transactionStats.successRate.toFixed(0)}% success` 
          : 'Unknown',
      healthy: !errors.transactions && (data.transactionStats?.successRate || 0) > 80,
    },
    {
      name: 'Miners Service',
      status: errors.miners ? `Error: ${errorMessages.miners}` : data.totalMiners > 0 ? 'Healthy' : 'No Data',
      healthy: !errors.miners && data.totalMiners > 0,
    },
  ];

  const hasAnyErrors = errors.kyc || errors.transactions || errors.subscriptions || errors.miners;

  // Retry function for failed services
  const retryService = async (service: keyof ServiceErrors) => {
    try {
      setErrors(prev => ({ ...prev, [service]: false }));
      setErrorMessages(prev => ({ ...prev, [service]: '' }));

      switch (service) {
        case 'kyc':
          const kycStats = await kycService.getKYCStats();
          setData(prev => ({ ...prev, kycStats }));
          break;
        case 'transactions':
          const transactionStats = await transactionService.getTransactionStats();
          setData(prev => ({ ...prev, transactionStats }));
          break;
        case 'subscriptions':
          const subscriptions = await miningSubscriptionService.getAllSubscriptions();
          const recentSubs = [...subscriptions]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setData(prev => ({ ...prev, subscriptions, recentSubscriptions: recentSubs }));
          break;
        case 'miners':
          const miners = await minerService.getAllMiners();
          setData(prev => ({ ...prev, totalMiners: miners.length }));
          break;
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [service]: true }));
      setErrorMessages(prev => ({ ...prev, [service]: getErrorMessage(err) }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Admin!</h1>
        <p className="text-gray-600">
          Here's what's happening with your mining platform today.
        </p>
        {hasAnyErrors && !loading && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 mb-2">
              ⚠️ Some data services are experiencing issues. Displaying available information.
            </p>
            <div className="text-xs text-yellow-700 space-y-1">
              {errors.miners && <div>• Miners: {errorMessages.miners}</div>}
              {errors.subscriptions && <div>• Subscriptions: {errorMessages.subscriptions}</div>}
              {errors.kyc && <div>• KYC: {errorMessages.kyc}</div>}
              {errors.transactions && <div>• Transactions: {errorMessages.transactions}</div>}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry All
            </Button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className={stat.error ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${stat.error ? 'text-red-700' : ''}`}>
                {stat.name}
              </CardTitle>
              {stat.error && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => retryService(stat.name.toLowerCase().replace(' ', '_') as keyof ServiceErrors)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                >
                  ⟳
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.error ? 'text-red-600' : ''}`}>
                {stat.value}
              </div>
              <p className={`text-xs ${
                stat.error 
                  ? 'text-red-600' 
                  : stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : 'text-red-600'
              }`}>
                {stat.change}
              </p>
              {stat.error && stat.errorMessage && (
                <p className="text-xs text-red-500 mt-1 truncate" title={stat.errorMessage}>
                  {stat.errorMessage.length > 30 
                    ? `${stat.errorMessage.substring(0, 30)}...` 
                    : stat.errorMessage
                  }
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rest of the component remains the same */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/wallets/create">
              <Button variant="outline" className="w-full h-16 flex-col">
                <span className="text-lg mb-1">👛</span>
                Add Wallet
              </Button>
            </Link>
            <Link href="/admin/servers/create">
              <Button variant="outline" className="w-full h-16 flex-col">
                <span className="text-lg mb-1">🖥️</span>
                Add Server
              </Button>
            </Link>
            <Link href="/admin/contracts/create">
              <Button variant="outline" className="w-full h-16 flex-col">
                <span className="text-lg mb-1">📑</span>
                Create Contract
              </Button>
            </Link>
            <Link href="/admin/kyc">
              <Button variant="outline" className="w-full h-16 flex-col">
                <span className="text-lg mb-1">✅</span>
                Review KYC
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading activity...</p>
            ) : errors.subscriptions ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-600 mb-2">⚠️ Unable to load recent activity</p>
                <p className="text-xs text-gray-500 mb-2">{errorMessages.subscriptions}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => retryService('subscriptions')}
                >
                  Retry
                </Button>
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <Badge variant={getActivityBadgeVariant(activity.type)}>
                      {activity.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.action}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current platform health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {systemStatus.map((system) => (
              <div 
                key={system.name}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  system.healthy ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  system.healthy ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className={`font-medium ${
                    system.healthy ? 'text-green-900' : 'text-red-900'
                  }`}>{system.name}</p>
                  <p className={`text-sm ${
                    system.healthy ? 'text-green-700' : 'text-red-700'
                  }`}>{system.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      {data.transactionStats && !errors.transactions && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
            <CardDescription>Platform transaction statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{data.transactionStats.totalTransactions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.transactionStats.successRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Volume</p>
                <p className="text-2xl font-bold">
                  ${data.transactionStats.totalVolume.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data.transactionStats.pendingTransactions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}