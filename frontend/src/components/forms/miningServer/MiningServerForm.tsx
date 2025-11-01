'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { miningServerService } from '@/services';

interface MiningServerFormData {
  name: string;
  hashRate: string;
  powerConsumptionInKwH: string;
  isActive: boolean;
}

interface MiningServerFormProps {
  server?: MiningServer;
  isEdit?: boolean;
}

type FormErrors = Partial<Record<keyof MiningServerFormData, string>> & {
  form?: string;
};

export function MiningServerForm({ server, isEdit = false }: MiningServerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MiningServerFormData>({
    name: '',
    hashRate: '',
    powerConsumptionInKwH: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when server is available
  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name,
        hashRate: server.hashRate,
        powerConsumptionInKwH: server.powerConsumptionInKwH,
        isActive: server.isActive,
      });
    }
  }, [server]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Server name must be less than 100 characters';
    }

    if (!formData.hashRate.trim()) {
      newErrors.hashRate = 'Hash rate is required';
    } else if (formData.hashRate.length > 50) {
      newErrors.hashRate = 'Hash rate must be less than 50 characters';
    }

    if (!formData.powerConsumptionInKwH.trim()) {
      newErrors.powerConsumptionInKwH = 'Power consumption is required';
    } else if (formData.powerConsumptionInKwH.length > 50) {
      newErrors.powerConsumptionInKwH = 'Power consumption must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof MiningServerFormData, value: string | boolean) => {
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
      if (isEdit && server) {
        await miningServerService.updateServer(server.id, formData);
      } else {
        await miningServerService.createServer(formData);
      }
      router.push('/admin/servers');
      router.refresh();
    } catch (error) {
      console.error('Failed to save server:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save mining server. Please try again.',
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
            {isEdit ? 'Edit Mining Server' : 'Add New Mining Server'}
          </CardTitle>
          <CardDescription>
            {isEdit 
              ? 'Update the mining server details'
              : 'Add a new mining server configuration'
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
              <Label htmlFor="name">Server Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter server name (e.g., Antminer S19 Pro)"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashRate">Hash Rate *</Label>
              <Input
                id="hashRate"
                value={formData.hashRate}
                onChange={(e) => handleInputChange('hashRate', e.target.value)}
                placeholder="Enter hash rate (e.g., 110 TH/s)"
              />
              {errors.hashRate && (
                <p className="text-sm text-red-600">{errors.hashRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="powerConsumptionInKwH">Power Consumption *</Label>
              <Input
                id="powerConsumptionInKwH"
                value={formData.powerConsumptionInKwH}
                onChange={(e) => handleInputChange('powerConsumptionInKwH', e.target.value)}
                placeholder="Enter power consumption (e.g., 3.25 kW/h)"
              />
              {errors.powerConsumptionInKwH && (
                <p className="text-sm text-red-600">{errors.powerConsumptionInKwH}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active Server</Label>
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
              {isLoading ? 'Saving...' : isEdit ? 'Update Server' : 'Add Server'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}