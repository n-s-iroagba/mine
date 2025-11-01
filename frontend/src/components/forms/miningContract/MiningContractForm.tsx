'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { miningContractService, miningServerService } from '@/services';
import { MiningContract } from '@/types/api';
import { useApiQuery } from '@/hooks/useApi';

interface MiningContractFormData {
  miningServerId: number;
  periodReturn: number;
  period: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
  isActive: boolean;
}

interface MiningContractFormProps {
  contract?: MiningContract;
  isEdit?: boolean;
}

type FormErrors = Partial<Record<keyof MiningContractFormData, string>> & {
  form?: string;
};

export function MiningContractForm({ contract, isEdit = false }: MiningContractFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MiningContractFormData>({
    miningServerId: 0,
    periodReturn: 0,
    period: 'daily',
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: miningServers = [], isLoading: serversLoading } = useApiQuery(
    ['mining-servers'],
    () => miningServerService.getAllServers()
  );

  // Initialize form data when contract or mining servers are available
  useEffect(() => {
    if (contract) {
      setFormData({
        miningServerId: contract.miningServerId,
        periodReturn: contract.periodReturn,
        period: contract.period,
        isActive: contract.isActive,
      });
    } else if (miningServers.length > 0) {
      setFormData(prev => ({
        ...prev,
        miningServerId: miningServers[0]?.id || 0,
      }));
    }
  }, [contract, miningServers]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.miningServerId || formData.miningServerId <= 0) {
      newErrors.miningServerId = 'Please select a mining server';
    }

    if (formData.periodReturn === null || formData.periodReturn === undefined) {
      newErrors.periodReturn = 'Period return is required';
    } else if (formData.periodReturn < 0) {
      newErrors.periodReturn = 'Return must be at least 0';
    } else if (formData.periodReturn > 100) {
      newErrors.periodReturn = 'Return cannot exceed 100%';
    }

    if (!formData.period) {
      newErrors.period = 'Please select a payout period';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof MiningContractFormData, value: any) => {
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
      if (isEdit && contract) {
        await miningContractService.updateContract(contract.id, formData);
      } else {
        await miningContractService.createContract(formData);
      }
      router.push('/admin/contractss');
      router.refresh();
    } catch (error) {
      console.error('Failed to save contract:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save contract. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter only active mining servers for selection
  const activeMiningServers = miningServers.filter(server => server.isActive);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Edit Mining Contract' : 'Create New Mining Contract'}
          </CardTitle>
          <CardDescription>
            {isEdit 
              ? 'Update the mining contract details'
              : 'Configure a new mining contract for users'
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

            {/* Fixed Mining Server Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="miningServerId">Mining Server</Label>
              <Select
                value={formData.miningServerId.toString()}
                onValueChange={(value: string) => 
                  handleInputChange('miningServerId', parseInt(value))
                }
                disabled={serversLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mining server" />
                </SelectTrigger>
                <SelectContent className="z-50 max-h-60" >
                  {serversLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading servers...
                    </SelectItem>
                  ) : activeMiningServers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No active mining servers available
                    </SelectItem>
                  ) : (
                    activeMiningServers.map((server) => (
                      <SelectItem key={server.id} value={server.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{server.name}</span>
                          <span className="text-xs text-gray-500">
                            Hash Rate: {server.hashRate} | Power: {server.powerConsumptionInKwH}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.miningServerId && (
                <p className="text-sm text-red-600">{errors.miningServerId}</p>
              )}
              {activeMiningServers.length === 0 && !serversLoading && (
                <p className="text-sm text-amber-600">
                  No active mining servers available. Please create a mining server first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodReturn">Period Return (%)</Label>
              <Input
                id="periodReturn"
                type="number"
                step="0.01"
                value={formData.periodReturn}
                onChange={(e) => handleInputChange('periodReturn', parseFloat(e.target.value) || 0)}
              />
              {errors.periodReturn && (
                <p className="text-sm text-red-600">{errors.periodReturn}</p>
              )}
            </div>

            {/* Fixed Period Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="period">Payout Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value: string) => 
                  handleInputChange('period', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="z-50" >
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {errors.period && (
                <p className="text-sm text-red-600">{errors.period}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active Contract</Label>
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
            <Button 
              type="submit" 
              disabled={isLoading || serversLoading || activeMiningServers.length === 0}
            >
              {isLoading ? 'Saving...' : isEdit ? 'Update Contract' : 'Create Contract'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}