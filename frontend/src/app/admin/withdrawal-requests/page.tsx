'use client';

import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/table';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { Withdrawal, withdrawalService } from '@/services/withdrawalService';

export default function AdminWithdrawalsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const itemsPerPage = 10;

  const { data: withdrawals = [], isLoading, error, refetch } = useApiQuery(
    ['admin-withdrawals', statusFilter],
    () => withdrawalService.getAllWithdrawals(statusFilter === 'all' ? undefined : statusFilter)
  );

  const updateStatusMutation = useApiMutation(
    ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) =>
      withdrawalService.updateWithdrawalStatus(id, status, rejectionReason),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleStatusUpdate = async (id: number, status: string, rejectionReason?: string) => {
    if (status === 'rejected' && !rejectionReason) {
      const reason = prompt('Please provide a reason for rejection:');
      if (!reason) return;
      
      await updateStatusMutation.mutateAsync({ id, status, rejectionReason: reason });
    } else {
      await updateStatusMutation.mutateAsync({ id, status });
    }
  };

  const sortedWithdrawals = [...withdrawals].sort((a, b) => {
    const aValue = a[sortKey as keyof Withdrawal] as string;
    const bValue = b[sortKey as keyof Withdrawal] as string;
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedWithdrawals = sortedWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'secondary';
      case 'rejected': return 'error';
      case 'processing': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value: number) => (
        <span className="font-mono text-sm">#{value}</span>
      ),
    },
    {
      key: 'minerId',
      label: 'Miner',
      sortable: true,
      render: (value: number, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.miner?.firstname} {row.miner?.lastname}
          </span>
          <span className="text-xs text-gray-500">
            Miner #{value} • {row.miner?.country || 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      key: 'subscriptionId',
      label: 'Subscription',
      render: (value: number, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium">Contract #{row.subscription?.miningContractId}</span>
          <span className="text-xs text-gray-500">
            Deposit: {formatCurrency(row.subscription?.amountDeposited || 0)}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'earnings' ? 'secondary' : 'default'}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex flex-col space-y-2">
          <Badge variant={getStatusBadgeVariant(value)}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
          {value === 'rejected' && row.rejectionReason && (
            <span className="text-xs text-red-600">{row.rejectionReason}</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Requested',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex flex-col space-y-2">
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(row.id, 'approved')}
                disabled={updateStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(row.id, 'rejected')}
                disabled={updateStatusMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                Reject
              </Button>
            </>
          )}
          {row.status === 'approved' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(row.id, 'processing')}
              disabled={updateStatusMutation.isPending}
            >
              Mark as Processing
            </Button>
          )}
          {row.status === 'processing' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(row.id, 'completed')}
              disabled={updateStatusMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Mark as Completed
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load withdrawal requests</p>
        </div>
      </div>
    );
  }

  const pendingCount = withdrawals.filter((w: any) => w.status === 'pending').length;
  const totalAmount = withdrawals
    .filter((w: any) => w.status === 'pending')
    .reduce((sum: number, w: any) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage miner withdrawal requests and approvals
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{withdrawals.length}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-10h-1M4 12H3m17.5-6.5L18 7m-12 5l-1.5 1.5M18 7l-1.5-1.5M18 7l1.5-1.5M6 17l-1.5 1.5" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${withdrawals.length} withdrawal request${withdrawals.length !== 1 ? 's' : ''}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Filter */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'ghost' : 'outline'}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'approved' ? 'secondary' : 'outline'}
              onClick={() => setStatusFilter('approved')}
            >
              Approved
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'destructive' : 'outline'}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </Button>
          </div>

          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={8} />
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={paginatedWithdrawals}
                loading={isLoading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                mobileView="auto"
              />
              {withdrawals.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(withdrawals.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}