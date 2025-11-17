'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { earningService } from '@/services/earningService';
import { Earning } from '@/types/api';
import { MiningSubscriptionWithMiner } from '@/types/subscription';

interface EarningModalProps {
  earning?: Earning;
  subscription: MiningSubscriptionWithMiner;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EarningModal({ 
  earning, 
  subscription,
  isOpen, 
  onClose, 
  onSuccess 
}: EarningModalProps) {
  
  const [amount, setAmount] = useState(0);
  const [shouldSendEmail, setShouldSendEmail] = useState(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]); // yyyy-mm-dd
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Load initial values when editing
  useEffect(() => {
    if (earning) {
      setAmount(earning.amount);
      setDate(earning.date.split("T")[0]); 
    } else {
      setAmount(0);
      setDate(new Date().toISOString().split("T")[0]);
      setShouldSendEmail(false);
    }
  }, [earning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Frontend validation
    if (!amount || amount <= 0) {
      setError("Amount must be greater than 0.");
      setIsLoading(false);
      return;
    }

    if (!date) {
      setError("Date is required.");
      setIsLoading(false);
      return;
    }

    try {
      if (earning) {
        await earningService.updateEarning(earning.id, { 
          amount, 
          date, 
          shouldSendEmail 
        });
      } else {
        await earningService.createEarning({ 
          miningSubscriptionId: subscription.id,
          date,
          shouldSendEmail,
          amount 
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to process earning. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {earning ? 'Update' : 'Add'} Earning
        </h2>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Miner: {subscription.miner?.firstname} {subscription.miner?.lastname}</p>
          <p className="text-sm text-gray-600">Current Deposit: {formatCurrency(subscription.amountDeposited)}</p>
          <p className="text-sm text-gray-600">Subscription ID: #{subscription.id}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">

            {/* AMOUNT FIELD */}
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                required
              />
            </div>

            {/* DATE FIELD */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* SHOULD SEND EMAIL */}
            <div>
              <Label className="block mb-1">Should send Email?</Label>

              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shouldSendEmail"
                    checked={shouldSendEmail === true}
                    onChange={() => setShouldSendEmail(true)}
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shouldSendEmail"
                    checked={shouldSendEmail === false}
                    onChange={() => setShouldSendEmail(false)}
                  />
                  No
                </label>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : `${earning ? 'Update' : 'Add'} Earning`}
              </Button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
