'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { formatCurrency } from '../../../lib/utils';
import { miningSubscriptionService } from '@/services';
import { useAuth, useRequiredAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';


export default function MinerDashboard() {
  const { user } = useRequiredAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {

    
    try {
      setLoading(true);
      const data = await miningSubscriptionService.getMinerDashboard(Number(user?.roleId));
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    { 
      name: 'Total Earnings', 
      value: formatCurrency(dashboardData?.summary.totalEarnings || 0),
      description: 'Lifetime earnings',
      icon: '💰',
      color: 'text-green-600'
    },
    { 
      name: 'Active Subscriptions', 
      value: dashboardData?.summary.activeSubscriptions || 0,
      description: 'Currently mining',
      icon: '⚡',
      color: 'text-blue-600'
    },
    { 
      name: 'Total Deposits', 
      value: formatCurrency(dashboardData?.summary.totalDeposits || 0),
      description: 'Total invested',
      icon: '💵',
      color: 'text-purple-600'
    },
    { 
      name: 'Net Profit', 
      value: formatCurrency(dashboardData?.summary.netProfit || 0),
      description: 'Earnings - Deposits',
      icon: '📈',
      color: dashboardData?.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {/* Welcome back, {user?.firstName}! 👋 */}
            </h1>
            <p className="text-gray-600">
              Here's your mining performance overview.
            </p>
          </div>
          <Link href="/miner/contracts" className="mt-4 sm:mt-0">
            <Button>
              Start New Mining
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ROI Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Summary</CardTitle>
            <CardDescription>Your return on investment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall ROI</span>
                <Badge variant={
                  (dashboardData?.summary.overallROI || 0) >= 0 ? 'secondary': 'error'
                }>
                  {dashboardData?.summary.overallROI}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Subscriptions</span>
                <span className="text-sm font-medium">
                  {dashboardData?.summary.totalSubscriptions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Mining</span>
                <span className="text-sm font-medium">
                  {dashboardData?.summary.activeSubscriptions} / {dashboardData?.summary.totalSubscriptions}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your mining operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/miner/contracts/create">
                <Button variant="outline" className="w-full h-14 flex-col">
                  <span className="text-lg mb-1">🔄</span>
                  New Subscription
                </Button>
              </Link>
              <Link href="/miner/payments">
                <Button variant="outline" className="w-full h-14 flex-col">
                  <span className="text-lg mb-1">💳</span>
                  Make Payment
                </Button>
              </Link>
              <Link href="/miner/contracts">
                <Button variant="outline" className="w-full h-14 flex-col">
                  <span className="text-lg mb-1">📋</span>
                  View All
                </Button>
              </Link>
              <Link href="/miner/kyc">
                <Button variant="outline" className="w-full h-14 flex-col">
                  <span className="text-lg mb-1">✅</span>
                  KYC Status
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
          <CardDescription>
            Your latest mining subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData?.subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⛏️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subscriptions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start your first mining subscription to begin earning
              </p>
              <Link href="/miner/contracts/create">
                <Button>Start Mining</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData?.subscriptions.slice(0, 5).map((subscription: any) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⛏️</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {subscription.miningContract?.miningServer?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(subscription.amountDeposited)} • {subscription.miningContract?.period}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={subscription.isActive ? 'secondary' : 'default'}>
                      {subscription.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      +{formatCurrency(subscription.earnings)}
                    </p>
                  </div>
                </div>
              ))}
              {dashboardData?.subscriptions.length > 5 && (
                <div className="text-center pt-4">
                  <Link href="/miner/contracts">
                    <Button variant="outline">
                      View All Subscriptions
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}