'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { miningSubscriptionService } from '@/services';
import { earningService } from '@/services/earningService';
import { useApiQuery } from '@/hooks/useApi';
import { Earning, Transaction } from '@/types/api';
import { CreditDebitDepositModal } from '@/components/CreditDebitDepositModal';
import { EarningModal } from '@/components/EarningModal';
import { MiningSubscriptionWithMiner } from '@/types/subscription';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function MiningSubscriptionDetailsPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const [updateError, setUpdateError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const [showCreditDebitDepositModal, setShowCreditDebitDepositModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [editingEarning, setEditingEarning] = useState<Earning | undefined>(undefined);

  const [actionType, setActionType] = useState<'credit' | 'debit'>('credit');

  const { data: subscription, isLoading, error, refetch } = useApiQuery<any>(
    ['mining-subscription-details', id, updateLoading],
    () => miningSubscriptionService.getSubscriptionById(id)
  );

  const transactions = subscription?.transactions || [];
  const earnings: Earning[] = subscription?.earnings || [];

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error || !subscription)
    return <div className="p-10 text-center text-red-600">Failed to load subscription</div>;

  // ========== UPDATE AUTO UPDATE ===========
  const updateAutomaticUpdate = async () => {
    try {
      setUpdateLoading(true);
      await miningSubscriptionService.updateSubscription(subscription.id, {
        shouldUpdateAutomatically: !subscription.shouldUpdateAutomatically
      });
      await refetch();
    } catch (err) {
      setUpdateError('Error toggling automatic update');
    } finally {
      setUpdateLoading(false);
    }
  };

  // ====== DELETE EARNING ======
  const deleteEarning = async (earningId: number) => {
    if (!confirm('Delete earning?')) return;
    await earningService.deleteEarning(earningId);
    refetch();
  };


 // ===== Chart Data (CUMULATIVE) =====
let runningTotal = 0;

const chartData = earnings
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((e) => {
    runningTotal += Number(e.amount);

    return {
      date: new Date(e.date).toLocaleDateString(),
      amount: runningTotal, // cumulative amount
    };
  });


  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscription Details</h1>
        <Link href="/admin/subscriptions">
          <Button>Back</Button>
        </Link>
      </div>

      {/* ===== Summary cards ===== */}
      <div className="grid md:grid-cols-3 gap-4">

        {/* Deposited */}
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm">Total Deposited</p>
            <p className="text-3xl font-bold text-blue-600">
              ${subscription.amountDeposited.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600">
              $
              {earnings.reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Auto update */}
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm mb-2">Auto Update</p>
            <div onClick={updateAutomaticUpdate}>
              <Badge>
                {updateLoading
                  ? 'Updating...'
                  : subscription.shouldUpdateAutomatically
                  ? 'Enabled'
                  : 'Disabled'}
              </Badge>
            </div>
            {updateError && <p className="text-red-600 text-sm">{updateError}</p>}
          </CardContent>
        </Card>

      </div>

      {/* ============ CHART ============ */}
<Card>
  <CardHeader>
    <CardTitle>Earnings Chart</CardTitle>
  </CardHeader>
  <CardContent>
    {earnings.length === 0 ? (
      <p className="text-gray-500 text-center py-4">No earnings yet</p>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    )}
  </CardContent>
</Card>


      {/* ============ Earnings List ============ */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" onClick={() => { setEditingEarning(undefined); setShowEarningsModal(true); }}>
            Add Earning
          </Button>

          {earnings.length === 0 ? (
            <p className="text-gray-500 mt-4">No earnings added yet.</p>
          ) : (
            <div className="space-y-3 mt-4">
              {earnings.map((e) => (
                <div
                  key={e.id}
                  className="flex justify-between p-3 border rounded-md items-center"
                >
                  <div>
                    <p className="font-semibold">${Number(e.amount).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(e.date).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEarning(e);
                        setShowEarningsModal(true);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      className='text-red-700'
                      size="sm"
                      onClick={() => deleteEarning(e.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              onClick={() => {
                setEditingEarning(undefined);
                setShowEarningsModal(true);
              }}
            >
              Credit Earnings
            </Button>

            <Button size="sm" onClick={() => {
              setActionType('credit');
              setShowCreditDebitDepositModal(true);
            }}>
              Credit Deposit
            </Button>

            <Button size="sm" variant="outline" onClick={() => {
              setActionType('debit');
              setShowCreditDebitDepositModal(true);
            }}>
              Debit Deposit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreditDebitDepositModal && (
        <CreditDebitDepositModal
          subscription={subscription}
          actionType={actionType}
          isOpen={showCreditDebitDepositModal}
          onClose={() => setShowCreditDebitDepositModal(false)}
          onSuccess={() => {
            setShowCreditDebitDepositModal(false);
            refetch();
          }}
        />
      )}

      {showEarningsModal && (
        <EarningModal
          earning={editingEarning}
          subscription={subscription}
          isOpen={showEarningsModal}
          onClose={() => setShowEarningsModal(false)}
          onSuccess={() => {
            setShowEarningsModal(false);
            refetch();
          }}
        />
      )}

    </div>
  );
}
