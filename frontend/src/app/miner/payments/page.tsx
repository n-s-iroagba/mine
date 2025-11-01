'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

import { DataTable } from '../../../components/ui/table';
import { transactionService } from '../../../services/transactionService';
import { adminWalletService } from '../../../services/adminWalletService';

import { formatCurrency, formatDate, truncateAddress } from '../../../lib/utils';
import { Transaction, AdminWallet } from '../../../types/api';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [txData, walletData] = await Promise.all([
        transactionService.getTransactionsByMinerId(user.id),
        adminWalletService.getActiveWallets()
      ]);
      setTransactions(txData);
      setWallets(walletData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'amountInUSD',
      label: 'Amount',
      render: (value: number) => (
        <span className="font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'entity',
      label: 'Type',
      render: (value: string) => (
        <Badge variant={value === 'subscription' ? 'secondary': 'default'}>
          {value === 'subscription' ? 'Subscription' : 'KYC Fee'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const variants = {
          initialized: 'default',
          pending: 'warning',
          successful: 'secondary',
          failed: 'error',
        } as const;

        const labels = {
          initialized: 'Initialized',
          pending: 'Pending',
          successful: 'Successful',
          failed: 'Failed',
        };

        return (
          <Badge variant={variants[value as keyof typeof variants]}>
            {labels[value as keyof typeof labels]}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your payments and transaction history
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Available cryptocurrency wallets for payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="font-medium text-gray-700">
                          {wallet.currencyAbbreviation}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {wallet.currency}
                        </p>
                        <p className="text-sm text-gray-600">
                          {truncateAddress(wallet.address)}
                        </p>
                      </div>
                    </div>
                    <Badge variant='secondary'>Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your payment and transaction records
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={transactions}
                loading={loading}
                emptyMessage="No transactions found. Your transaction history will appear here."
              />
            </CardContent>
          </Card>
        </div>

        {/* Payment Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">How to Pay:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Choose a cryptocurrency from the list</li>
                  <li>Send the exact amount to the wallet address</li>
                  <li>Wait for network confirmation (1-3 confirmations)</li>
                  <li>Your payment will be processed automatically</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="font-medium text-yellow-900 mb-2">Important:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                  <li>Send only the specified currencies</li>
                  <li>Include the correct payment reference</li>
                  <li>Minimum payment: $1.00 equivalent</li>
                  <li>Contact support for payment issues</li>
                </ul>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-900 mb-2">Support:</p>
                <p className="text-green-800">
                  Need help with payments? Contact our support team for assistance.
                </p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-medium">{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful:</span>
                  <span className="font-medium text-green-600">
                    {transactions.filter(t => t.status === 'successful').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-yellow-600">
                    {transactions.filter(t => t.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="font-medium text-red-600">
                    {transactions.filter(t => t.status === 'failed').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}