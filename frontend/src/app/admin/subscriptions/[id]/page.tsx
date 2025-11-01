'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { miningSubscriptionService} from '@/services';
import { useApiQuery } from '@/hooks/useApi';
import { MiningSubscriptionWithTransaction, Transaction } from '@/types/api';

export default function MiningSubscriptionDetailsPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: subscription, isLoading: subscriptionLoading, error: subscriptionError } = useApiQuery<MiningSubscriptionWithTransaction>(
    ['mining-subscription', id],
    () => miningSubscriptionService.getSubscriptionById(id)
  );
const transactions = subscription?.transactions||[]

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  if (subscriptionError || !subscription) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load mining subscription</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatMinerName = (miner: any) => {
    if (!miner) return 'Unknown Miner';
    return `${miner.firstname} ${miner.lastname}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'secondary';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getTransactionStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'successful': return 'secondary';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'initialized': return 'default';
      default: return 'default';
    }
  };

  const getAutoUpdateBadgeVariant = (shouldUpdate: boolean) => {
    return shouldUpdate ? 'secondary' : 'default';
  };

  const totalDeposited = transactions
    .filter((t:Transaction)=> t.status === 'successful' && t.entity === 'subscription')
    .reduce((sum:number, transaction:Transaction) => sum + transaction.amountInUSD, 0);

  const totalEarnings = subscription.earnings;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Details</h1>
          <p className="mt-1 text-sm text-gray-600">
            Subscription #{subscription.id} - {formatMinerName(subscription.miner)}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Link href={`/admin/subscriptions/edit/${subscription.id}`}>
            <Button variant="outline">
              Edit Subscription
            </Button>
          </Link>
          <Link href="/admin/subscriptions">
            <Button>
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deposited</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(subscription.amountDeposited)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-10h-1M4 12H3m17.5-6.5L18 7m-12 5l-1.5 1.5M18 7l-1.5-1.5M18 7l1.5-1.5M6 17l-1.5 1.5" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(subscription.earnings)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(subscription.isActive ? 'active' : 'inactive')}>
                    {subscription.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto Update</p>
                <div className="mt-1">
                  <Badge variant={getAutoUpdateBadgeVariant(subscription.shouldUpdateAutomatically)}>
                    {subscription.shouldUpdateAutomatically ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Subscription ID:</span>
              <span className="font-mono">#{subscription.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount Deposited:</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(subscription.amountDeposited)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Earnings:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(subscription.earnings)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Auto Update:</span>
              <Badge variant={getAutoUpdateBadgeVariant(subscription.shouldUpdateAutomatically)}>
                {subscription.shouldUpdateAutomatically ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={getStatusBadgeVariant(subscription.isActive ? 'active' : 'inactive')}>
                {subscription.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Created:</span>
              <span>{new Date(subscription.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated:</span>
              <span>{new Date(subscription.updatedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Miner Information */}
        <Card>
          <CardHeader>
            <CardTitle>Miner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Miner ID:</span>
              <span className="font-mono">#{subscription.minerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span className="font-medium">{formatMinerName(subscription.miner)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Country:</span>
              <span className="text-gray-600">{subscription.miner?.country || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span className="text-gray-600">{subscription.miner?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phone:</span>
              <span className="text-gray-600">{subscription.miner?.phone || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Contract Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Contract ID:</span>
              <span className="font-mono">#{subscription.miningContractId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Period Return:</span>
              <span className="font-semibold text-green-600">
                {subscription.miningContract?.periodReturn}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payout Period:</span>
              <Badge variant="default">
                {subscription.miningContract&&(subscription.miningContract?.period?.charAt(0).toUpperCase() + subscription.miningContract?.period?.slice(1))}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Mining Server:</span>
              <span className="text-gray-600">
                {subscription.miningContract?.miningServer?.name || 'Unknown Server'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Server Hash Rate:</span>
              <span className="text-gray-600">
                {subscription.miningContract?.miningServer?.hashRate || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Contract Status:</span>
              <Badge variant={subscription.miningContract?.isActive ? 'secondary' : 'default'}>
                {subscription.miningContract?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <div className="text-center py-4">
                <div className="text-gray-600">Loading transactions...</div>
              </div>
            ) : subscriptionError ? (
              <div className="text-center py-4">
                <div className="text-red-600">Failed to load transactions</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-600">No transactions found</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction:Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {formatCurrency(transaction.amountInUSD)}
                        </span>
                        <Badge variant={getTransactionStatusBadgeVariant(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Transaction #{transaction.id} • {transaction.entity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {transactions.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Successful Deposits:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(totalDeposited)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="font-medium">Total Transactions:</span>
                  <span className="font-semibold">{transactions.length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/subscriptions/edit/${subscription.id}`}>
              <Button variant="outline">
                Edit Subscription
              </Button>
            </Link>
            <Link href={`/admin/transactions?entity=subscription&entityId=${subscription.id}`}>
              <Button variant="outline">
                View All Transactions
              </Button>
            </Link>
            <Link href={`/admin/miners/${subscription.minerId}`}>
              <Button variant="outline">
                View Miner Profile
              </Button>
            </Link>
            <Link href={`/admin/contractsss/${subscription.miningContractId}`}>
              <Button variant="outline">
                View Contract Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}