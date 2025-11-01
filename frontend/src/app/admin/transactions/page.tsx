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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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
      await transactionService.updateTransactionStatus(transactionId, { status: newStatus as any });
      await loadTransactions(); // Reload to reflect changes
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  };

  const columns = [
    {
      key: 'miner',
      label: 'Miner',
      render: (value: any, row: Transaction) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.miner?.firstName} {row.miner?.lastName}
          </p>
          <p className="text-sm text-gray-600">{row.miner?.email}</p>
        </div>
      ),
    },
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
          {value.slice(0, 8)}...
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
    initialized: transactions.filter(t => t.status === 'initialized').length,
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {statusCounts.initialized}
              </p>
              <p className="text-sm text-gray-600">Initialized</p>
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
                  { value: 'initialized', label: 'Initialized', count: statusCounts.initialized },
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
    </div>
  );
}