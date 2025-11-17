'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { miningSubscriptionService } from '@/services';
import { DepositStatus } from '@/types/subscription';

interface CreditDebitDepositModalProps {
  subscription: any;
  actionType: 'credit' | 'debit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreditDebitDepositModal({ 
  subscription, 
  actionType, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreditDebitDepositModalProps) {
  const [amount, setAmount] = useState(0);
  const [shouldSendEmail, setShouldSendEmail] = useState(false)
  const [depositStatus, setDepositStatus] = useState<DepositStatus>(subscription.depositStatus)
  const [shouldCreateTransaction, setShouldCreateTransaction] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
  

    try {
      if (actionType === 'credit') {
        await miningSubscriptionService.mutateDeposit(subscription.id, {amount,actionType:'credit',shouldSendEmail,shouldCreateTransaction,depositStatus});
      } else if(actionType==='debit') {
        await miningSubscriptionService.mutateDeposit(subscription.id, {amount,actionType:'debit',shouldSendEmail, shouldCreateTransaction,depositStatus});
      }else{
        alert('Choose a transaction type')
      }
      onSuccess();
    } catch (err) {
      setError('Failed to process transaction. Please try again.');
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
          {actionType === 'credit' ? 'Credit' : 'Debit'} Deposit
        </h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Miner: {subscription.miner?.firstname} {subscription.miner?.lastname}</p>
          <p className="text-sm text-gray-600">Current Deposit: {formatCurrency(subscription.amountDeposited)}</p>
          <p className="text-sm text-gray-600">Subscription ID: #{subscription.id}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">
                Amount to {actionType === 'credit' ? 'Credit' : 'Debit'} (USD)
              </Label>
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
<div>
  <Label className="block mb-1">Should send Email?</Label>

  <div className="flex items-center gap-4 mt-1">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="shouldSendEmail"
        value="yes"
        checked={shouldSendEmail === true}
        onChange={() => setShouldSendEmail(true)}
      />
      Yes
    </label>

    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="shouldSendEmail"
        value="no"
        checked={shouldSendEmail === false}
        onChange={() => setShouldSendEmail(false)}
      />
      No
    </label>
  </div>
</div>

<div>
  <Label className="block mb-1">Should the miner be able to see this transaction?</Label>

  <div className="flex items-center gap-4 mt-1">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="shouldCreateTransaction"
        value="yes"
        checked={shouldCreateTransaction === true}
        onChange={() => setShouldCreateTransaction(true)}
      />
      Yes
    </label>

    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="shouldCreateTransaction"
        value="no"
        checked={shouldCreateTransaction === false}
        onChange={() =>  setShouldCreateTransaction(false)}
      />
      No
    </label>
  </div>

</div>
<div>
  <Label className="block mb-1">Deposit Status</Label>

  <select
    className="border rounded-md p-2 w-full"
    value={depositStatus}
    onChange={(e) => setDepositStatus(e.target.value as DepositStatus)}
  >
    {Object.values(DepositStatus).map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>

  <p className="text-xs text-gray-500 mt-1">
    Leave unchanged or select a new status.
  </p>
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
                variant='default'
              >
                {isLoading ? 'Processing...' : `${actionType === 'credit' ? 'Credit' : 'Debit'} Deposit`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}