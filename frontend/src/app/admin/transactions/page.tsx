'use client';

import React, { useState, useEffect } from 'react';
import { DataTable} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { transactionService } from '../../../services/transactionService';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Transaction } from '../../../types/api';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface UpdateTransactionStatusData {
  status: 'pending' | 'successful' | 'failed';
  amountInUSD: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [approvingTransaction, setApprovingTransaction] = useState<Transaction | null>(null);
  const [actualAmount, setActualAmount] = useState<string>('');
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;
    const typeMatch = typeFilter === 'all' || transaction.entity === typeFilter;
    return statusMatch && typeMatch;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusVariant = (status: string) => {
    const variants = {
      initialized: 'default',
      pending: 'warning',
      successful: 'secondary',
      failed: 'error',
    } as const;
    return variants[status as keyof typeof variants] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      initialized: 'Initialized',
      pending: 'Pending',
      successful: 'Successful',
      failed: 'Failed',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleApproveTransaction = (transaction: Transaction) => {
    setApprovingTransaction(transaction);
    setActualAmount(transaction.amountInUSD.toString()); // Start with the claimed amount
    setIsApproveDialogOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!approvingTransaction || !actualAmount) return;

    const confirmedAmount = parseFloat(actualAmount);
    if (isNaN(confirmedAmount) || confirmedAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    setIsUpdating(true);
    try {
      await transactionService.updateTransactionStatus(approvingTransaction.id, {
        status: 'successful',
        amountInUSD: confirmedAmount
      });
      await loadTransactions();
      setIsApproveDialogOpen(false);
      setApprovingTransaction(null);
      setActualAmount('');
    } catch (error) {
      console.error('Failed to approve transaction:', error);
      alert('Failed to approve transaction. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectTransaction = async (transactionId: number) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      await transactionService.updateTransactionStatus(transactionId, {
        status: 'failed',
        amountInUSD: transaction.amountInUSD // Keep original amount for rejected transactions
      });
      await loadTransactions();
    } catch (error) {
      console.error('Failed to reject transaction:', error);
    }
  };

  const columns = [
    {
      key: 'miner',
      label: 'Miner',
      render: (value: any, row: Transaction) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.miner?.firstname} {row.miner?.lastname}
          </p>
          <p className="text-sm text-gray-600">{row.miner?.email}</p>
          <p className="text-xs text-gray-500">ID: {row.minerId}</p>
        </div>
      ),
    },
    {
      key: 'amountInUSD',
      label: 'Amount',
      render: (value: number, row: Transaction) => (
        <div className="text-center">
          <span className="font-medium text-lg">
            {formatCurrency(value)}
          </span>
          {row.status === 'pending' && (
            <p className="text-xs text-gray-500 mt-1">Claimed by user</p>
          )}
          {row.status === 'successful' && (
            <p className="text-xs text-green-600 mt-1">Confirmed by admin</p>
          )}
        </div>
      ),
    },
    {
      key: 'entity',
      label: 'Type',
      render: (value: string, row: Transaction) => (
        <div>
          <Badge variant={value === 'subscription' ? 'secondary' : 'default'}>
            {value === 'subscription' ? 'Subscription' : 'KYC Fee'}
          </Badge>
          {row.entityId && (
            <p className="text-xs text-gray-500 mt-1">Ref: {row.entityId}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: Transaction) => (
        <div className="space-y-2">
          <Badge variant={getStatusVariant(value)}>
            {getStatusLabel(value)}
          </Badge>
          {value === 'pending' && (
            <div className="flex space-x-1">
              <Button
                size="sm"
                onClick={() => handleApproveTransaction(row)}
                className="h-6 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectTransaction(row.id)}
                className="h-6 text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'originatingId',
      label: 'Transaction ID',
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
          {value?.slice(0, 8)}...
        </code>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => (
        <div className="text-sm">
          <p>{formatDate(value)}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
  ];

  const statusCounts = {
    all: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    successful: transactions.filter(t => t.status === 'successful').length,
    failed: transactions.filter(t => t.status === 'failed').length,
  };

  const typeCounts = {
    all: transactions.length,
    subscription: transactions.filter(t => t.entity === 'subscription').length,
    kyc: transactions.filter(t => t.entity === 'kyc').length,
  };

  const totalVolume = transactions
    .filter(t => t.status === 'successful')
    .reduce((sum, t) => sum + t.amountInUSD, 0);

  const pendingVolume = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amountInUSD, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve pending transactions by confirming actual amounts
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {statusCounts.all}
              </p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {statusCounts.pending}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xs text-yellow-600">
                {formatCurrency(pendingVolume)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {statusCounts.successful}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {statusCounts.failed}
              </p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalVolume)}
              </p>
              <p className="text-sm text-gray-600">Total Volume</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Button 
                onClick={loadTransactions}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter transactions by status and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All', count: statusCounts.all },
                  { value: 'pending', label: 'Pending', count: statusCounts.pending },
                  { value: 'successful', label: 'Approved', count: statusCounts.successful },
                  { value: 'failed', label: 'Rejected', count: statusCounts.failed },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setStatusFilter(filter.value);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      statusFilter === filter.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All', count: typeCounts.all },
                  { value: 'subscription', label: 'Subscription', count: typeCounts.subscription },
                  { value: 'kyc', label: 'KYC Fee', count: typeCounts.kyc },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setTypeFilter(filter.value);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      typeFilter === filter.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
            {statusFilter !== 'all' && ` • Filtered by: ${statusFilter}`}
            {typeFilter !== 'all' && `, ${typeFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={paginatedTransactions}
            loading={loading}
            emptyMessage="No transactions found matching your filters."
          />
          {filteredTransactions.length > itemsPerPage && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredTransactions.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Transaction Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
            <DialogDescription>
              Confirm the actual transaction amount and approve this payment.
            </DialogDescription>
          </DialogHeader>
          
          {approvingTransaction && (
            <div className="space-y-4 py-4">
              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Miner</p>
                    <p className="font-semibold">
                      {approvingTransaction.miner?.firstname} {approvingTransaction.miner?.lastname}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Type</p>
                    <Badge variant={approvingTransaction.entity === 'subscription' ? 'secondary' : 'default'}>
                      {approvingTransaction.entity === 'subscription' ? 'Subscription' : 'KYC Fee'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Claimed Amount</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(approvingTransaction.amountInUSD)}
                  </p>
                </div>
              </div>

              {/* Actual Amount Input */}
              <div>
                <label htmlFor="actualAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Amount Received (USD) *
                </label>
                <Input
                  id="actualAmount"
                  type="number"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  placeholder="Enter the actual amount received"
                  min="0"
                  step="0.01"
                  className="text-lg font-medium border-green-300 focus:border-green-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Claimed: {formatCurrency(approvingTransaction.amountInUSD)}</span>
                  {actualAmount && (
                    <span className={
                      parseFloat(actualAmount) !== approvingTransaction.amountInUSD 
                        ? 'text-orange-600 font-medium' 
                        : 'text-green-600'
                    }>
                      Difference: {formatCurrency(parseFloat(actualAmount) - approvingTransaction.amountInUSD)}
                    </span>
                  )}
                </div>
              </div>

              {/* Warning for amount differences */}
              {actualAmount && parseFloat(actualAmount) !== approvingTransaction.amountInUSD && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    <strong>Note:</strong> The actual amount differs from the claimed amount. 
                    This will update the miner's balance accordingly.
                  </p>
                </div>
              )}

              {/* Subscription-specific warning */}
              {approvingTransaction.entity === 'subscription' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Subscription Impact:</strong> This amount will be added to the miner's 
                    subscription balance and affect their mining earnings.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApproval}
              disabled={isUpdating || !actualAmount}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Approving...
                </>
              ) : (
                'Confirm & Approve'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}