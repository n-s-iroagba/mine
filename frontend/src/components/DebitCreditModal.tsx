'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { miningSubscriptionService } from '@/services';

interface UpdateEarningsModalProps {
  subscription: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateEarningsModal({ 
  subscription, 
  isOpen, 
  onClose, 
  onSuccess 
}: UpdateEarningsModalProps) {
  const [actionType, setActionType] = useState<'set' | 'add' | 'subtract'>('set');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount < 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (actionType === 'subtract' && numericAmount > subscription.earnings) {
      setError('Subtraction amount cannot exceed current earnings');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await miningSubscriptionService.updateEarnings(
        subscription.id, 
        numericAmount, 
        actionType
      );
      onSuccess();
    } catch (err) {
      setError('Failed to update earnings. Please try again.');
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

  const getActionDescription = () => {
    switch (actionType) {
      case 'set':
        return 'Set earnings to a specific amount';
      case 'add':
        return 'Add to current earnings';
      case 'subtract':
        return 'Subtract from current earnings';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Update Earnings</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Miner: {subscription.miner?.firstname} {subscription.miner?.lastname}</p>
          <p className="text-sm text-gray-600">Current Earnings: {formatCurrency(subscription.earnings)}</p>
          <p className="text-sm text-gray-600">Subscription ID: #{subscription.id}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="actionType">Action Type</Label>
              <Select value={actionType} onValueChange={(value:string ) => setActionType(value as 'set' | 'add' | 'subtract' )}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set Earnings</SelectItem>
                  <SelectItem value="add">Add to Earnings</SelectItem>
                  <SelectItem value="subtract">Subtract from Earnings</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">{getActionDescription()}</p>
            </div>

            <div>
              <Label htmlFor="amount">
                Amount (USD) {actionType !== 'set' ? `to ${actionType}` : ''}
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
                variant="primary"
              >
                {isLoading ? 'Updating...' : 'Update Earnings'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}