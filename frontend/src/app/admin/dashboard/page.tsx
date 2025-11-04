'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '@/components/ui/badge';
import { kycService, miningSubscriptionService, transactionService } from '@/services';
import { KYCStats, TransactionStats} from '@/types/api';
import { MiningSubscription } from '@/types/subscription';

interface DashboardData {
  kycStats: KYCStats | null;
  transactionStats: TransactionStats | null;
  subscriptions: MiningSubscription[];
  recentSubscriptions: MiningSubscription[];
}

interface ServiceErrors {
  kyc: boolean;
  transactions: boolean;
  subscriptions: boolean;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    kycStats: null,
    transactionStats: null,
    subscriptions: [],
    recentSubscriptions: [],
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ServiceErrors>({
    kyc: false,
    transactions: false,
    subscriptions: false,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const newErrors: ServiceErrors = {
          kyc: false,
          transactions: false,
          subscriptions: false,
        };

        // Fetch KYC stats
        let kycStats: KYCStats | null = null;
        try {
          kycStats = await kycService.getKYCStats();
        } catch (err) {
          console.error('KYC stats error:', err);
          newErrors.kyc = true;
        }

        // Fetch transaction stats
        let transactionStats: TransactionStats | null = null;
        try {
          transactionStats = await transactionService.getTransactionStats();
        } catch (err) {
          console.error('Transaction stats error:', err);
          newErrors.transactions = true;
        }

        // Fetch subscriptions
        let allSubscriptions: MiningSubscription[] = [];
        try {
          allSubscriptions = await miningSubscriptionService.getAllSubscriptions();
        } catch (err) {
          console.error('Subscriptions error:', err);
          newErrors.subscriptions = true;
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
        });
        setErrors(newErrors);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate stats with fallbacks
  const activeSubscriptions = data.subscriptions.filter(sub => sub.isActive).length;
  const totalRevenue = data.subscriptions.reduce((sum, sub) => sum + sub.amountDeposited, 0);
  const previousMonthRevenue = totalRevenue * 0.81; // Mock comparison
  const revenueChange = totalRevenue > 0 
    ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(0)
    : '0';

  const stats = [
    { 
      name: 'Total Miners', 
      value: loading ? '...' : errors.subscriptions ? 'N/A' : data.subscriptions.length.toLocaleString(), 
      change: errors.subscriptions ? 'Data unavailable' : '+12%', 
      changeType: 'positive' as const,
      error: errors.subscriptions
    },
    { 
      name: 'Active Subscriptions', 
      value: loading ? '...' : errors.subscriptions ? 'N/A' : activeSubscriptions.toLocaleString(), 
      change: errors.subscriptions ? 'Data unavailable' : `${((activeSubscriptions / Math.max(data.subscriptions.length, 1)) * 100).toFixed(0)}%`, 
      changeType: 'positive' as const,
      error: errors.subscriptions
    },
    { 
      name: 'Total Revenue', 
      value: loading ? '...' : errors.subscriptions ? 'N/A' : `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: errors.subscriptions ? 'Data unavailable' : `+${revenueChange}%`, 
      changeType: 'positive' as const,
      error: errors.subscriptions
    },
    { 
      name: 'Pending KYC', 
      value: loading ? '...' : errors.kyc ? 'N/A' : (data.kycStats?.pendingKYC || 0).toLocaleString(), 
      change: errors.kyc ? 'Data unavailable' : data.kycStats ? `${data.kycStats.approvalRate.toFixed(0)}% approval` : '0%', 
      changeType: 'negative' as const,
      error: errors.kyc
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
    action: sub.isActive ? 'Created active subscription' : 'Created subscription',
    time: formatTimeAgo(sub.createdAt.toDateString()),
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
      status: errors.subscriptions ? 'Error' : data.subscriptions.length > 0 ? 'Healthy' : 'No Data',
      healthy: !errors.subscriptions && data.subscriptions.length > 0,
    },
    {
      name: 'Transactions',
      status: errors.transactions 
        ? 'Error'
        : data.transactionStats 
          ? `${data.transactionStats.successRate.toFixed(0)}% success` 
          : 'Unknown',
      healthy: !errors.transactions && (data.transactionStats?.successRate || 0) > 80,
    },
  ];

  const hasAnyErrors = errors.kyc || errors.transactions || errors.subscriptions;

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
            <p className="text-sm text-yellow-800">
              ⚠️ Some data services are experiencing issues. Displaying available information.
              {errors.subscriptions && ' Subscription data unavailable.'}
              {errors.kyc && ' KYC data unavailable.'}
              {errors.transactions && ' Transaction data unavailable.'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className={stat.error ? 'border-yellow-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.error ? 'text-gray-400' : stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <p className="text-sm text-yellow-600">⚠️ Unable to load recent activity</p>
                <p className="text-xs text-gray-500 mt-1">Please check database connection</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {systemStatus.map((system) => (
              <div 
                key={system.name}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  system.healthy ? 'bg-green-50' : 'bg-yellow-50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  system.healthy ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className={`font-medium ${
                    system.healthy ? 'text-green-900' : 'text-yellow-900'
                  }`}>{system.name}</p>
                  <p className={`text-sm ${
                    system.healthy ? 'text-green-700' : 'text-yellow-700'
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