'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { miningContractService } from '@/services';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { MiningContract } from '@/types/api';
import { MiningContractWithServer } from '@/services/miningContractService';

export default function AdminMiningContractsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  const itemsPerPage = 10;

  const { data: contracts = [], isLoading, error, refetch } = useApiQuery(
    ['admin-mining-contracts', statusFilter, periodFilter],
    () => miningContractService.getAllContracts()
  );

  const deleteMutation = useApiMutation(
    (id: number) => miningContractService.deleteContract(id),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const toggleStatusMutation = useApiMutation(
    ({ id, isActive }: { id: number; isActive: boolean }) =>
      miningContractService.updateContract(id, { isActive }),
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this mining contract? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await toggleStatusMutation.mutateAsync({ id, isActive: !currentStatus });
  };

  // Filter contracts based on search term
  const filteredContracts = contracts.filter((contract: MiningContractWithServer) => {
    const matchesSearch = 
      contract.miningServer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.period?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.periodReturn?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && contract.isActive) ||
      (statusFilter === 'inactive' && !contract.isActive);

    const matchesPeriod = periodFilter === 'all' || contract.period === periodFilter;

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const aValue = a[sortKey as keyof MiningContract] as string | number | boolean ;
    const bValue = b[sortKey as keyof MiningContract] as string | number | boolean;
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedContracts = sortedContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'secondary' : 'default';
  };

  const getPeriodBadgeVariant = (period: string) => {
    switch (period) {
      case 'daily': return 'default';
      case 'weekly': return 'secondary';
      case 'fortnightly': return 'outline';
      case 'monthly': return 'secondary';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      mobilePriority: 1,
      render: (value: number) => (
        <span className="font-mono text-sm text-gray-600">#{value}</span>
      ),
    },
    {
      key: 'miningServer',
      label: 'Mining Server',
      sortable: true,
      mobilePriority: 2,
      render: (value: any, row: MiningContract) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value?.name || 'Unknown Server'}</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {value?.hashRate || 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              {value?.powerConsumptionInKwH || 'N/A'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'periodReturn',
      label: 'Return Rate',
      sortable: true,
      mobilePriority: 3,
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-green-600 text-lg">
            {value}%
          </span>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Payout Period',
      sortable: true,
      render: (value: string) => (
        <Badge variant='default'>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      mobilePriority: 4,
      render: (value: boolean, row: MiningContract) => (
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(value)}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(row.id, value)}
            className="h-6 text-xs"
            disabled={toggleStatusMutation.isPending}
          >
            {value ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
    {
      key: 'subscriptionCount',
      label: 'Subscriptions',
      sortable: true,
      render: (value: number, row: any) => (
        <div className="text-center">
          <span className="font-medium text-blue-600">{row._count?.subscriptions || 0}</span>
          <div className="text-xs text-gray-500">active</div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      mobilePriority: 5,
      render: (_: any, row: MiningContract) => (
        <div className="flex space-x-2">
          <Link href={`/admin/contracts/${row.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Link href={`/admin/contracts/edit/${row.id}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600 mb-4">Failed to load mining contracts</p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const activeContractsCount = contracts.filter((c: MiningContract) => c.isActive).length;
  const inactiveContractsCount = contracts.filter((c: MiningContract) => !c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mining Contracts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage mining contracts and their configurations
          </p>
        </div>
        <Link href="/admin/contracts/create">
          <Button className="mt-4 sm:mt-0">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Contract
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold text-green-600">{activeContractsCount}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Contracts</p>
                <p className="text-2xl font-bold text-gray-600">{inactiveContractsCount}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {contracts.reduce((sum: number, contract: any) => sum + (contract._count?.subscriptions || 0), 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Management</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${filteredContracts.length} contract${filteredContracts.length !== 1 ? 's' : ''} found`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                placeholder="Search by server name, period, or return rate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Period Filter */}
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || periodFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPeriodFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Contracts Table */}
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={8} />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || periodFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first mining contract'}
              </p>
              <Link href="/admin/contracts/create">
                <Button>
                  Create Contract
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={paginatedContracts}
                loading={isLoading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                mobileView="auto"
              />
              
              {/* Pagination */}
              {filteredContracts.length > itemsPerPage && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredContracts.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}