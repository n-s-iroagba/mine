'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/table';
import { bankService } from '@/services';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { Bank } from '@/types/api';
import { Badge } from '@/components/ui/badge';

export default function AdminBanksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  const { data: banks = [], isLoading, error } = useApiQuery(
    ['admin-banks'],
    () => bankService.getAllBanks()
  );

  const deleteMutation = useApiMutation(
    (id: number) => bankService.deleteBank(id),
    {
      invalidateQueries: [['admin-banks']],
    }
  );

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await bankService.updateBank(id, { isActive: !currentStatus });
  };
const sortedBanks = [...banks].sort((a, b) => {
  const aValue = (a[sortKey as keyof Bank] ?? '') as string | number;
  const bValue = (b[sortKey as keyof Bank] ?? '') as string | number;

  if (sortDirection === 'asc') {
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  } else {
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
  }
});


  const paginatedBanks = sortedBanks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatAccountNumber = (accountNumber: string) => {
    // Show last 4 digits only for security
    return `****${accountNumber.slice(-4)}`;
  };

  const columns = [
    {
      key: 'name',
      label: 'Bank Name',
      sortable: true,
      mobilePriority: 1,
      render: (value: string, row: Bank) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{value}</span>
          {row.swiftCode && (
            <span className="text-xs text-gray-500">({row.swiftCode})</span>
          )}
        </div>
      ),
    },
    {
      key: 'accountName',
      label: 'Account Name',
      sortable: true,
      mobilePriority: 2,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'accountNumber',
      label: 'Account Number',
      mobilePriority: 3,
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
          {formatAccountNumber(value)}
        </code>
      ),
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || '-'}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      mobilePriority: 4,
      render: (value: boolean, row: Bank) => (
        <div className="flex items-center space-x-2">
          <Badge variant={value ? 'secondary' : 'default'}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(row.id, value)}
            className="h-6 text-xs"
          >
            {value ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
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
      render: (_: any, row: Bank) => (
        <div className="flex space-x-2">
          <Link href={`/admin/banks/${row.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Link href={`/admin/banks/${row.id}/edit`}>
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
          <p className="text-gray-600">Failed to load bank accounts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage bank accounts for receiving payments
          </p>
        </div>
        <Link href="/admin/banks/create">
          <Button className="mt-4 sm:mt-0">
            Add New Bank
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bank Accounts List</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${banks.length} bank account${banks.length !== 1 ? 's' : ''} configured`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={7} />
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={paginatedBanks}
                loading={isLoading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                mobileView="auto"
              />
              {banks.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(banks.length / itemsPerPage)}
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