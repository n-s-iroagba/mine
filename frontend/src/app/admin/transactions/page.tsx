'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Table } from '../../../components/ui/table';
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  const handleStatusUpdate = async (transactionId: number, newStatus: string) => {
    try {
      await transactionService.updateTransactionStatus(transactionId, { 
        status: newStatus as any,
        amountInUSD: transactions.find(t => t.id === transactionId)?.amountInUSD || 0
      });
      await loadTransactions(); // Reload to reflect changes
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  };

  const handleEditAmount = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(transaction.amountInUSD.toString());
    setIsEditDialogOpen(true);
  };

  const handleUpdateAmount = async () => {
    if (!editingTransaction || !editAmount) return;

    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsUpdating(true);
    try {
      await transactionService.updateTransactionStatus(editingTransaction.id, {
        status: editingTransaction.status,
        amountInUSD: newAmount
      });
      await loadTransactions();
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      setEditAmount('');
    } catch (error) {
      console.error('Failed to update transaction amount:', error);
      alert('Failed to update transaction amount');
    } finally {
      setIsUpdating(false);
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
        </div>
      ),
    },
    {
      key: 'amountInUSD',
      label: 'Amount',
      render: (value: number, row: Transaction) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {formatCurrency(value)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditAmount(row)}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            title="Edit amount"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
        </div>
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
      render: (value: string, row: Transaction) => (
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(value)}>
            {getStatusLabel(value)}
          </Badge>
          {value === 'pending' && (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(row.id, 'successful')}
                className="h-6 text-xs"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(row.id, 'failed')}
                className="h-6 text-xs text-red-600"
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
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {value?.slice(0, 8)}...
        </code>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => formatDate(value),
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor and manage all platform transactions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
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
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {statusCounts.successful}
              </p>
              <p className="text-sm text-gray-600">Successful</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {statusCounts.failed}
              </p>
              <p className="text-sm text-gray-600">Failed</p>
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
                  { value: 'successful', label: 'Successful', count: statusCounts.successful },
                  { value: 'failed', label: 'Failed', count: statusCounts.failed },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
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
                    onClick={() => setTypeFilter(filter.value)}
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
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredTransactions.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Amount Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction Amount</DialogTitle>
            <DialogDescription>
              Update the amount for this transaction. This will affect the miner's subscription balance.
            </DialogDescription>
          </DialogHeader>
          
          {editingTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Miner</p>
                  <p>{editingTransaction.miner?.firstname} {editingTransaction.miner?.lastname}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Current Amount</p>
                  <p className="font-semibold">{formatCurrency(editingTransaction.amountInUSD)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Type</p>
                  <p>{editingTransaction.entity === 'subscription' ? 'Subscription' : 'KYC Fee'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Status</p>
                  <Badge variant={getStatusVariant(editingTransaction.status)}>
                    {getStatusLabel(editingTransaction.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  New Amount (USD)
                </label>
                <Input
                  id="amount"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Enter new amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAmount}
              disabled={isUpdating || !editAmount}
            >
              {isUpdating ? 'Updating...' : 'Update Amount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}