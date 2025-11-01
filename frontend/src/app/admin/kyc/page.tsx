'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '../../../components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

import { kycService } from '../../../services/kycService';

import { KYC } from '../../../types/api';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/Pagination';
import { DataTable } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

export default function KYCManagementPage() {
  const [kycRequests, setKycRequests] = useState<KYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const itemsPerPage = 10;

  useEffect(() => {
    loadKYCRequests();
  }, [statusFilter]);

  const loadKYCRequests = async () => {
    try {
      setLoading(true);
      let data: KYC[];
      if (statusFilter === 'all') {
        data = await kycService.getAllKYCRequests();
      } else {
        data = await kycService.getKYCByStatus(statusFilter);
      }
      setKycRequests(data);
    } catch (error) {
      console.error('Failed to load KYC requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const paginatedRequests = kycRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusUpdate = async (kycId: number, status: 'successful' | 'failed', rejectionReason?: string) => {
    try {
      await kycService.updateKYCStatus(kycId, { 
        status, 
        rejectionReason 
      });
      await loadKYCRequests(); // Reload to reflect changes
    } catch (error) {
      console.error('Failed to update KYC status:', error);
    }
  };

  const columns = [
    {
      key: 'miner',
      label: 'Miner',
      render: (value: any, row: KYC) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.miner?.firstName} {row.miner?.lastName}
          </p>
          <p className="text-sm text-gray-600">{row.miner?.email}</p>
          <p className="text-xs text-gray-500">ID: {row.miner?.id}</p>
        </div>
      ),
    },
    {
      key: 'idCard',
      label: 'ID Document',
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
          {value}
        </code>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: KYC) => (
        <div className="space-y-2">
          <Badge variant={
            value === 'successful' ? 'secondary':
            value === 'failed' ? 'error' : 'warning'
          }>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
          {value === 'pending' && (
            <div className="flex flex-col space-y-1">
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(row.id, 'successful')}
                className="text-xs h-7"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const reason = prompt('Enter rejection reason:');
                  if (reason) {
                    handleStatusUpdate(row.id, 'failed', reason);
                  }
                }}
                className="text-xs h-7 text-red-600"
              >
                Reject
              </Button>
            </div>
          )}
          {value === 'failed' && row.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">
              Reason: {row.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'reviewer',
      label: 'Reviewed By',
      render: (value: any, row: KYC) => (
        row.reviewer ? (
          <div>
            <p className="text-sm font-medium">
              {row.reviewer.firstName} {row.reviewer.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {row.reviewedAt && formatDate(row.reviewedAt)}
            </p>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Not reviewed</span>
        )
      ),
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (value: string) => formatDate(value),
    },
  ];

  const statusCounts = {
    all: kycRequests.length,
    pending: kycRequests.filter(k => k.status === 'pending').length,
    successful: kycRequests.filter(k => k.status === 'successful').length,
    failed: kycRequests.filter(k => k.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and verify miner identification documents
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {statusCounts.all}
              </p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {statusCounts.pending}
              </p>
              <p className="text-sm text-gray-600">Pending Review</p>
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
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter KYC requests by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All', count: statusCounts.all },
              { value: 'pending', label: 'Pending', count: statusCounts.pending },
              { value: 'successful', label: 'Approved', count: statusCounts.successful },
              { value: 'failed', label: 'Rejected', count: statusCounts.failed },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KYC Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Requests</CardTitle>
          <CardDescription>
            {kycRequests.length} request{kycRequests.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={paginatedRequests}
            loading={loading}
            emptyMessage="No KYC requests found matching your filters."
          />
          {kycRequests.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(kycRequests.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Approval Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Guidelines</CardTitle>
          <CardDescription>
            Standards for KYC verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h4 className="font-medium text-green-900">✅ Approve When:</h4>
              <ul className="space-y-2 text-green-800">
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Government-issued ID matches miner information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Document is clear and readable</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>ID is not expired</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>All required information is visible</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-900">❌ Reject When:</h4>
              <ul className="space-y-2 text-red-800">
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Information doesn't match miner details</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Document is blurry or unreadable</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>ID is expired or invalid</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Suspected fraudulent document</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}