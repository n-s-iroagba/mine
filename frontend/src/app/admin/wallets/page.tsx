'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { AdminWallet } from '../../../types/api';
import { truncateAddress } from '../../../lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/table';
import { adminWalletService } from '@/services';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';

export default function AdminWalletsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  const { data: wallets = [], isLoading, error } = useApiQuery(
    ['admin-wallets'],
    () => adminWalletService.getActiveWallets()
  );

  const deleteMutation = useApiMutation(
    (id: number) => adminWalletService.deleteWallet(id),
    {
      invalidateQueries: [['admin-wallets']],
    }
  );

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const sortedWallets = [...wallets].sort((a, b) => {
    const aValue = a[sortKey as keyof AdminWallet];
    const bValue = b[sortKey as keyof AdminWallet];
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedWallets = sortedWallets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: 'currency',
      label: 'Currency',
      sortable: true,
      mobilePriority: 1,
      render: (value: string, row: AdminWallet) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{row.currencyAbbreviation}</span>
          <span className="text-sm text-gray-500">{row.currency}</span>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      mobilePriority: 2,
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {truncateAddress(value)}
        </code>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      mobilePriority: 3,
      render: (value: boolean) => (
        <Badge variant={value ? 'secondary' : 'default'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: AdminWallet) => (
        <div className="flex space-x-2">
          <Link href={`/admin/wallets/edit/${row.id}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDelete(row.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load wallets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Wallets</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage cryptocurrency wallets for receiving payments
          </p>
        </div>
        <Link href="/admin/wallets/create">
          <Button className="mt-4 sm:mt-0">
            Add New Wallet
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet List</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''} configured`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={5} />
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={paginatedWallets}
                loading={isLoading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                mobileView="auto"
              />
              {wallets.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(wallets.length / itemsPerPage)}
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