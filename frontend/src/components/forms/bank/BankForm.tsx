'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { bankService } from '@/services';

interface BankFormData {
  name: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  swiftCode: string;
  isActive: boolean;
}

interface BankFormProps {
  bank?: Bank;
  isEdit?: boolean;
}

type FormErrors = Partial<Record<keyof BankFormData, string>> & {
  form?: string;
};

export function BankForm({ bank, isEdit = false }: BankFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BankFormData>({
    name: '',
    accountNumber: '',
    accountName: '',
    branch: '',
    swiftCode: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when bank is available
  useEffect(() => {
    if (bank) {
      setFormData({
        name: bank.name,
        accountNumber: bank.accountNumber,
        accountName: bank.accountName,
        branch: bank.branch || '',
        swiftCode: bank.swiftCode || '',
        isActive: bank.isActive,
      });
    }
  }, [bank]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must contain only numbers';
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BankFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && bank) {
        await bankService.updateBank(bank.id, formData);
      } else {
        await bankService.createBank(formData);
      }
      router.push('/admin/banks');
      router.refresh();
    } catch (error) {
      console.error('Failed to save bank:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save bank account. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Edit Bank Account' : 'Add New Bank Account'}
          </CardTitle>
          <CardDescription>
            {isEdit 
              ? 'Update the bank account details'
              : 'Add a new bank account for receiving payments'
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {errors.form && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.form}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Bank Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter bank name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="Enter account number"
              />
              {errors.accountNumber && (
                <p className="text-sm text-red-600">{errors.accountNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name *</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                placeholder="Enter account holder name"
              />
              {errors.accountName && (
                <p className="text-sm text-red-600">{errors.accountName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  placeholder="Enter branch name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="swiftCode">SWIFT Code</Label>
                <Input
                  id="swiftCode"
                  value={formData.swiftCode}
                  onChange={(e) => handleInputChange('swiftCode', e.target.value.toUpperCase())}
                  placeholder="Enter SWIFT code"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active Bank Account</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Update Bank' : 'Add Bank'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}