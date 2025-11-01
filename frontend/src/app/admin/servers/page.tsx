'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/table';
import { miningServerService } from '@/services';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { MiningServer } from '@/types/api';

export default function AdminMiningServersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  const { data: servers = [], isLoading, error } = useApiQuery(
    ['admin-mining-servers'],
    () => miningServerService.getAllServers()
  );

  const deleteMutation = useApiMutation(
    (id: number) => miningServerService.deleteServer(id),
    {
      invalidateQueries: [['admin-mining-servers']],
    }
  );

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this mining server?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await miningServerService.updateServer(id, { isActive: !currentStatus });
  };

  const sortedServers = [...servers].sort((a, b) => {
    const aValue = a[sortKey as keyof MiningServer];
    const bValue = b[sortKey as keyof MiningServer];
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedServers = sortedServers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      mobilePriority: 1,
      render: (value: number) => (
        <span className="font-mono text-sm">#{value}</span>
      ),
    },
    {
      key: 'name',
      label: 'Server Name',
      sortable: true,
      mobilePriority: 2,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'hashRate',
      label: 'Hash Rate',
      sortable: true,
      mobilePriority: 3,
      render: (value: string) => (
        <span className="text-sm font-mono bg-blue-50 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'powerConsumptionInKwH',
      label: 'Power Consumption',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      mobilePriority: 4,
      render: (value: boolean, row: MiningServer) => (
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
      render: (_: any, row: MiningServer) => (
        <div className="flex space-x-2">
          <Link href={`/admin/servers/${row.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Link href={`/admin/servers/edit/${row.id}`}>
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
          <p className="text-gray-600">Failed to load mining servers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mining Servers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage mining servers and their configurations
          </p>
        </div>
        <Link href="/admin/servers/create">
          <Button className="mt-4 sm:mt-0">
            Add New Server
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server List</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${servers.length} server${servers.length !== 1 ? 's' : ''} configured`
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
                data={paginatedServers}
                loading={isLoading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                mobileView="auto"
              />
              {servers.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(servers.length / itemsPerPage)}
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