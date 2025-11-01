'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { miningContractService } from '@/services';
import { useApiQuery } from '@/hooks/useApi';

export default function MiningContractDetailsPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: contract, isLoading, error } = useApiQuery(
    ['mining-contract', id],
    () => miningContractService.getContractById(id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load mining contract</p>
        </div>
      </div>
    );
  }

  const getPeriodBadgeVariant = (period: string) => {
    switch (period) {
      case 'daily': return 'default';
      case 'weekly': return 'secondary';
      case 'fortnightly': return 'outline';
      case 'monthly': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mining Contract Details</h1>
          <p className="mt-1 text-sm text-gray-600">
            Contract #{contract.id}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Link href={`/admin/contractss/edit/${contract.id}`}>
            <Button variant="outline">
              Edit Contract
            </Button>
          </Link>
          <Link href="/admin/contractss">
            <Button>
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Contract ID:</span>
              <span className="font-mono">#{contract.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Mining Server ID:</span>
              <span className="font-mono">Server #{contract.miningServerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Period Return:</span>
              <span className="font-semibold text-green-600">
                {contract.periodReturn}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payout Period:</span>
              <Badge variant={'default'}>
                {contract.period.charAt(0).toUpperCase() + contract.period.slice(1)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={contract.isActive ? 'secondary' : 'default'}>
                {contract.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Created:</span>
              <span>{new Date(contract.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated:</span>
              <span>{new Date(contract.updatedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}