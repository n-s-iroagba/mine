'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { transactionService } from '../../../services/transactionService';
import { adminWalletService } from '../../../services/adminWalletService';
import { formatCurrency, formatDate, truncateAddress } from '../../../lib/utils';
import { Transaction, AdminWallet } from '../../../types/api';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

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
        transactionService.getTransactionsByMinerId(user.roleId),
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-600">Transaction History</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="mt-1 text-sm text-gray-600">
          Transaction History
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Payment Methods & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Methods */}
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
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
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
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CurrencyDollarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>No transactions found.</p>
                  <p className="text-sm">Your transaction history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {formatCurrency(transaction.amountInUSD)}
                            </span>
                            <Badge variant={transaction.entity === 'subscription' ? 'secondary' : 'default'}>
                              {transaction.entity === 'subscription' ? 'Subscription' : 'KYC Fee'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>ID: #{transaction.id}</span>
                            <span>•</span>
                            <span className="capitalize">{transaction.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.createdAt?.toString())}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="text-sm font-medium">
                            {transaction.status === 'successful' ? 'Successful' : 
                             transaction.status === 'pending' ? 'Pending' : 
                             transaction.status === 'failed' ? 'Failed' : 'Initialized'}
                          </span>
                        </div>
{/*                         
                        {transaction.receipt && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(transaction.r, '_blank')}
                            className="flex items-center space-x-1"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                            <span>Receipt</span>
                          </Button>
                        )} */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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