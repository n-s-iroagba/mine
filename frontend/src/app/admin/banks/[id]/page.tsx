'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { bankService } from '@/services';
import { useApiQuery } from '@/hooks/useApi';

export default function BankDetailsPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: bank, isLoading, error } = useApiQuery(
    ['bank', id],
    () => bankService.getBankById(id)
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

  if (error || !bank) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load bank account</p>
        </div>
      </div>
    );
  }

  const formatAccountNumber = (accountNumber: string) => {
    // Show last 4 digits only for security in details view
    const visiblePart = accountNumber.slice(-4);
    const hiddenPart = '*'.repeat(accountNumber.length - 4);
    return `${hiddenPart}${visiblePart}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Account Details</h1>
          <p className="mt-1 text-sm text-gray-600">
            {bank.name} - {formatAccountNumber(bank.accountNumber)}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Link href={`/admin/banks/edit/${bank.id}`}>
            <Button variant="outline">
              Edit Bank
            </Button>
          </Link>
          <Link href="/admin/banks">
            <Button>
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bank Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Bank Name:</span>
              <span className="font-medium">{bank.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account Number:</span>
              <code className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                {formatAccountNumber(bank.accountNumber)}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account Name:</span>
              <span className="font-medium">{bank.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Branch:</span>
              <span className="text-gray-600">{bank.branch || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">SWIFT Code:</span>
              <span className="text-gray-600">{bank.swiftCode || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={bank.isActive ? 'secondary' : 'default'}>
                {bank.isActive ? 'Active' : 'Inactive'}
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
              <span>{new Date(bank.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated:</span>
              <span>{new Date(bank.updatedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}