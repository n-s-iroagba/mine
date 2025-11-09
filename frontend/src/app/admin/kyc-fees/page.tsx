// components/KYCFeeManagementPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { kycFeeService } from '../../../services/kycFeeService';
import { minerService } from '../../../services/minerService';
import { KYCFee, KYCFeeStats, CreateKYCFeeData, Miner } from '../../../types/api';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/Pagination';
import { DataTable } from '@/components/ui/table';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



export default function KYCFeeManagementPage() {
  const [kycFees, setKycFees] = useState<KYCFee[]>([]);
  const [miners, setMiners] = useState<Miner[]>([]);
  const [loading, setLoading] = useState(true);
  const [minersLoading, setMinersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<KYCFeeStats | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFeeData, setNewFeeData] = useState({
    minerId: '',
    amountInUSD: '',
    description: 'KYC Verification Fee'
  });

  const itemsPerPage = 10;

  useEffect(() => {
    loadKYCFees();
    loadStats();
    loadMiners();
  }, [statusFilter]);

  const loadKYCFees = async () => {
    try {
      setLoading(true);
      let data: KYCFee[];
      if (statusFilter === 'all') {
        data = await kycFeeService.getAllKYCFees();
      } else if (statusFilter === 'paid') {
        data = await kycFeeService.getPaidFees();
      } else if (statusFilter === 'unpaid') {
        data = await kycFeeService.getUnpaidFees();
      } else {
        data = await kycFeeService.getAllKYCFees();
      }
      setKycFees(data);
    } catch (error) {
      console.error('Failed to load KYC fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await kycFeeService.getKYCFeeStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load KYC fee stats:', error);
    }
  };

  const loadMiners = async () => {
    try {
      setMinersLoading(true);
      const minersData = await minerService.getAllMiners();
      setMiners(minersData);
    } catch (error) {
      console.error('Failed to load miners:', error);
    } finally {
      setMinersLoading(false);
    }
  };

  const paginatedFees = kycFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleMarkAsPaid = async (feeId: number) => {
    try {
      await kycFeeService.markFeeAsPaid(feeId);
      await loadKYCFees();
      await loadStats();
    } catch (error) {
      console.error('Failed to mark fee as paid:', error);
    }
  };

  const handleCreateFee = async () => {
    if (!newFeeData.minerId || !newFeeData.amountInUSD) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(newFeeData.amountInUSD);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsCreating(true);
    try {
      await kycFeeService.createKYCFee({
        minerId: parseInt(newFeeData.minerId),
        amount: amount,
  
      });
      
      await loadKYCFees();
      await loadStats();
      setIsCreateDialogOpen(false);
      setNewFeeData({
        minerId: '',
        amountInUSD: '',
        description: 'KYC Verification Fee'
      });
    } catch (error) {
      console.error('Failed to create KYC fee:', error);
      alert('Failed to create KYC fee. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getSelectedMinerEmail = () => {
    const selectedMiner = miners.find(miner => miner.id === parseInt(newFeeData.minerId));
    return selectedMiner?.userId || '';
  };

  const columns = [
    {
      key: 'miner',
      label: 'Miner',
      render: (value: any, row: KYCFee) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.miner?.firstname} {row.miner?.lastname}
          </p>
          <p className="text-sm text-gray-600">{row.miner?.email}</p>
          <p className="text-xs text-gray-500">ID: {row.miner?.id}</p>
        </div>
      ),
    },
    {
      key: 'amountInUSD',
      label: 'Amount',
      render: (value: number) => (
        <span className="font-medium text-green-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: KYCFee) => (
        <div className="space-y-2">
          <Badge variant={
            value === 'paid' ? 'secondary' : 
            value === 'pending' ? 'warning' : 'default'
          }>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
          {value === 'pending' && (
            <Button
              size="sm"
              onClick={() => handleMarkAsPaid(row.id)}
              className="text-xs h-7"
            >
              Mark as Paid
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (value: string) => (
        value ? (
          <Badge variant="outline" className="capitalize">
            {value}
          </Badge>
        ) : (
          <span className="text-sm text-gray-500">Not paid</span>
        )
      ),
    },
    {
      key: 'paidAt',
      label: 'Paid Date',
      render: (value: string, row: KYCFee) => (
        value ? formatDate(value) : (
          <span className="text-sm text-gray-500">Not paid</span>
        )
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
  ];

  const statusCounts = {
    all: kycFees.length,
    paid: kycFees.filter(f => f.isPaid === true).length,
    unpaid: kycFees.filter(f => f.isPaid !== true).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Fee Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage KYC verification fees for miners
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create KYC Fee
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalFees || 0}
              </p>
              <p className="text-sm text-gray-600">Total Fees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.unpaidFees || 0}
              </p>
              <p className="text-sm text-gray-600">Pending Payment</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats?.paidFees || 0}
              </p>
              <p className="text-sm text-gray-600">Paid</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter KYC fees by payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All', count: statusCounts.all },
              { value: 'unpaid', label: 'Unpaid', count: statusCounts.unpaid },
              { value: 'paid', label: 'Paid', count: statusCounts.paid },
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

      {/* KYC Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Fees</CardTitle>
          <CardDescription>
            {kycFees.length} fee{kycFees.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={paginatedFees}
            loading={loading}
            emptyMessage="No KYC fees found matching your filters."
          />
          {kycFees.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(kycFees.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Create KYC Fee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create KYC Fee</DialogTitle>
            <DialogDescription>
              Create a new KYC verification fee for a miner
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="miner">Select Miner *</Label>
              <Select
                value={newFeeData.minerId}
                onValueChange={(value) => setNewFeeData({...newFeeData, minerId: value})}
                disabled={minersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={minersLoading ? "Loading miners..." : "Select a miner"} />
                </SelectTrigger>
                <SelectContent>
                  {miners.map((miner) => (
                    <SelectItem key={miner.id} value={miner.id.toString()}>
                      {miner.firstname}     {miner.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newFeeData.minerId && (
                <p className="text-xs text-green-600">
                  Selected miner email: {getSelectedMinerEmail()}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Select the miner who needs to pay the KYC fee
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <Input
                id="amount"
                type="number"
                value={newFeeData.amountInUSD}
                onChange={(e) => setNewFeeData({...newFeeData, amountInUSD: e.target.value})}
                placeholder="Enter amount in USD"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newFeeData.description}
                onChange={(e) => setNewFeeData({...newFeeData, description: e.target.value})}
                placeholder="Fee description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFee}
              disabled={isCreating || !newFeeData.minerId || !newFeeData.amountInUSD}
            >
              {isCreating ? 'Creating...' : 'Create Fee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}