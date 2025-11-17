'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/table';
import { miningSubscriptionService } from '@/services';
import { CreditDebitDepositModal } from '@/components/CreditDebitDepositModal';
import {  MiningContract } from '@/types/api';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { FullMiningSubscription, MiningSubscriptionWithMiner } from '@/types/subscription';
import { EarningModal } from '@/components/EarningModal';



export default function AdminMiningSubscriptionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedSubscription, setSelectedSubscription] = useState<FullMiningSubscription | null>(null);
  const [showCreditDebitDepositModal, setShowCreditDebitDepositModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [actionType, setActionType] = useState<'credit' | 'debit'>('credit');

  const itemsPerPage = 10;

  const { data: subscriptions = [], isLoading, error, refetch } = useApiQuery<FullMiningSubscription[]>(
    ['admin-mining-subscriptions'],
    () => miningSubscriptionService.getAllSubscriptions()
  );

  // Debug: Log subscriptions to see what data you're getting
  React.useEffect(() => {
    if (subscriptions.length > 0) {
      console.log('Subscriptions data:', subscriptions);
      console.log('First subscription earnings:', subscriptions[0]?.earnings);
    }
  }, [subscriptions]);



  const toggleAutoUpdateMutation = useApiMutation(
    ({ id, shouldUpdateAutomatically }: { id: number; shouldUpdateAutomatically: boolean }) =>
      miningSubscriptionService.updateSubscription(id, { shouldUpdateAutomatically }),
    {
      invalidateQueries: [['admin-mining-subscriptions']],
    }
  );

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };



  const handleToggleAutoUpdate = async (id: number, currentStatus: boolean) => {
    await toggleAutoUpdateMutation.mutateAsync({ 
      id, 
      shouldUpdateAutomatically: !currentStatus 
    });
  };

  const handleCreditDebitDeposit = (subscription: FullMiningSubscription, type: 'credit' | 'debit') => {
    setSelectedSubscription(subscription);
    setActionType(type);
    setShowCreditDebitDepositModal(true);
  };

    const handleAddEarning = (subscription: FullMiningSubscription) => {
    setSelectedSubscription(subscription);
    setShowEarningsModal(true);
  };



  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const aValue = a[sortKey as keyof FullMiningSubscription] as string | number | boolean | MiningContract;
    const bValue = b[sortKey as keyof FullMiningSubscription] as string | number | boolean | MiningContract;
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedSubscriptions = sortedSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatMinerName = (miner: any) => {
    if (!miner) return 'Unknown Miner';
    return `${miner.firstname} ${miner.lastname}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0); // Handle undefined/null amounts
  };

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
      key: 'minerId',
      label: 'Miner',
      sortable: true,
      mobilePriority: 2,
      render: (value: number, row: FullMiningSubscription) => (
        <div className="flex flex-col">
          <span className="font-medium">{formatMinerName(row.miner)}</span>
          <span className="text-xs text-gray-500">
            Miner #{value} • {row.miner?.country || 'Unknown Country'}
          </span>
        </div>
      ),
    },
    {
      key: 'miningContractId',
      label: 'Contract',
      sortable: true,
      render: (value: number, row: FullMiningSubscription) => (
        <div className="flex flex-col">
          <span className="font-medium">Contract #{value}</span>
          <span className="text-xs text-gray-500">
            {row.miningContract?.periodReturn || 0}% {row.miningContract?.period || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'amountDeposited',
      label: 'Deposited',
      sortable: true,
      mobilePriority: 3,
      render: (value: number) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(value)}
        </span>
      ),
    },
{
  key: 'earnings',
  label: 'Earnings',
  sortable: true,
  mobilePriority: 4,
  render: (_: any, row: FullMiningSubscription) => {
    const total = row.earnings?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

    return (
      <span className="font-semibold text-green-600">
        {formatCurrency(total)}
      </span>
    );
  },
},

    {
      key: 'shouldUpdateAutomatically',
      label: 'Auto Update',
      sortable: true,
      render: (value: boolean, row: FullMiningSubscription) => (
        <div className="flex items-center space-x-2">
          <Badge variant={value ? 'secondary' : 'default'}>
            {value ? 'ON' : 'OFF'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleAutoUpdate(row.id, value)}
            className="h-6 text-xs"
            disabled={toggleAutoUpdateMutation.isPending}
          >
            {value ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: FullMiningSubscription) => (
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Link href={`/admin/subscriptions/${row.id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
              <Button 
              variant="outline" 
              size="sm"
              className="text-green-600 hover:text-green-700"
              onClick={() => handleAddEarning(row)}
            >
              Credit Earnings
            </Button>
        
          </div>
          <div className="flex space-x-2">
         
              <Button
                   onClick={() => handleCreditDebitDeposit(row, 'credit')}
              className="text-white hover:text-green-700"
            size="sm">
                Credit Amount Deposited
              </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-orange-600 hover:text-orange-700"
              onClick={() => handleCreditDebitDeposit(row, 'debit')}
            >
              Debit Amount Deposited
            </Button>
              
          </div>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load mining subscriptions</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mining Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage mining subscriptions, deposits, and earnings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription List</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${subscriptions.length} subscription${subscriptions.length !== 1 ? 's' : ''}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={8} />
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={paginatedSubscriptions}
                loading={isLoading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                mobileView="auto"
              />
              {subscriptions?.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(subscriptions.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Credit/Debit Modal */}
      {showCreditDebitDepositModal && selectedSubscription && (
        <CreditDebitDepositModal
          subscription={selectedSubscription}
          actionType={actionType}
          isOpen={showCreditDebitDepositModal}
          onClose={() => {
            setShowCreditDebitDepositModal(false);
            setSelectedSubscription(null);
          }}
          onSuccess={() => {
            setShowCreditDebitDepositModal(false);
            setSelectedSubscription(null);
            refetch();
          }}
        />
      )}
      {showEarningsModal && (
        <EarningModal 
        isOpen={showEarningsModal}
        onClose={()=>{
          setShowEarningsModal(false)
          setSelectedSubscription(null)
        }}
          onSuccess={()=>{
          setShowEarningsModal(false)
          setSelectedSubscription(null)
          refetch()
        }}
        subscription={selectedSubscription as MiningSubscriptionWithMiner } />
      )}
    </div>
  );
}