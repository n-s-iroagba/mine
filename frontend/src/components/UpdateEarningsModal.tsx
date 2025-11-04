'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { miningSubscriptionService } from '@/services';

interface CreditDebitModalProps {
  subscription: any;
  actionType: 'credit' | 'debit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreditDebitModal({ 
  subscription, 
  actionType, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreditDebitModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (actionType === 'credit') {
        await miningSubscriptionService.updateEarnings(subscription.id, {earnings:numericAmount,actionType:'credit'});
      } else {
        if (numericAmount > subscription.amountDeposited) {
          setError('Debit amount cannot exceed current deposited amount');
          setIsLoading(false);
          return;
        }
        await miningSubscriptionService.updateEarnings(subscription.id, {earnings:numericAmount,actionType:'debit'});
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
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
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
                variant={actionType === 'credit' ? 'default' : 'destructive'}
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