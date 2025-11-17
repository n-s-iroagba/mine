
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { miningSubscriptionService } from '@/services';
import { earningService } from '@/services/earningService';
import { useApiQuery } from '@/hooks/useApi';
import { Earning, Transaction } from '@/types/api';
import { CreditDebitDepositModal } from '@/components/CreditDebitDepositModal';
import { EarningModal } from '@/components/EarningModal';
import { MiningSubscriptionWithMiner } from '@/types/subscription';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function MiningSubscriptionDetailsPage() {
  const params = useParams();
  const id = parseInt(params.id as string);


  const [updateLoading, setUpdateLoading] = useState(false);


  const [actionType, setActionType] = useState<'credit' | 'debit'>('credit');

  const { data: subscription, isLoading, error, refetch } = useApiQuery<any>(
    ['mining-subscription-details', id, updateLoading],
    () => miningSubscriptionService.getSubscriptionById(id)
  );

  const transactions = subscription?.transactions || [];
  const earnings: Earning[] = subscription?.earnings || [];

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error || !subscription)
    return <div className="p-10 text-center text-red-600">Failed to load subscription</div>;


    const formatMinerName = (miner: any) => {
    if (!miner) return 'Unknown Miner';
    return `${miner.firstname} ${miner.lastname}`;
  };
    const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0); // Handle undefined/null amounts
  };

  // ====== DELETE EARNING ======
  const deleteEarning = async (earningId: number) => {
    if (!confirm('Delete earning?')) return;
    await earningService.deleteEarning(earningId);
    refetch();
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

 // ===== Chart Data (CUMULATIVE) =====
let runningTotal = 0;

const chartData = earnings
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((e) => {
    runningTotal += Number(e.amount);

    return {
      date: new Date(e.date).toLocaleDateString(),
      amount: runningTotal, // cumulative amount
    };
  });



  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscription Details</h1>
        <Link href="/admin/subscriptions">
          <Button>Back</Button>
        </Link>
      </div>

      {/* ===== Summary cards ===== */}
      <div className="grid md:grid-cols-3 gap-4">

        {/* Deposited */}
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm">Total Deposited</p>
            <p className="text-3xl font-bold text-blue-600">
              ${subscription.amountDeposited.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600">
              $
              {earnings.reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

    

      </div>

      {/* ============ CHART ============ */}
<Card>
  <CardHeader>
    <CardTitle>Earnings Chart</CardTitle>
  </CardHeader>
  <CardContent>
    {earnings.length === 0 ? (
      <p className="text-gray-500 text-center py-4">No earnings yet</p>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    )}
  </CardContent>
</Card>


      {/* ============ Earnings List ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
        </CardHeader>
        <CardContent>
     

          {earnings.length === 0 ? (
            <p className="text-gray-500 mt-4">No earnings added yet.</p>
          ) : (
            <div className="space-y-3 mt-4">
              {earnings.map((e) => (
                <div
                  key={e.id}
                  className="flex justify-between p-3 border rounded-md items-center"
                >
                  <div>
                    <p className="font-semibold">${Number(e.amount).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(e.date).toLocaleString()}
                    </p>
                  </div>

              

               
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                {formatCurrency(subscription.amountDeposited??0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Earnings:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(subscription.earnings??0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Auto Update:</span>
              <Badge variant={getAutoUpdateBadgeVariant(subscription.shouldUpdateAutomatically)}>
                {subscription.shouldUpdateAutomatically ? 'Enabled' : 'Disabled'}
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
        
        
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
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
    
            <Link href={`/miner/transactions/${subscription.id}`}>
              <Button variant="outline">
                View All Transactions
              </Button>
            </Link>
            
          
         
          </div>
        </CardContent>
      </Card>
            
    </div>
  )  
}





   


