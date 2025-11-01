'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { bankService } from '@/services';
import { BankForm } from '@/components/forms/bank/BankForm';
import { useApiQuery } from '@/hooks/useApi';

export default function EditBankPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: bank, isLoading, error } = useApiQuery(
    ['bank', id],
    () => bankService.getBankById(id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !bank) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load bank account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Bank Account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update bank account details
        </p>
      </div>
      <BankForm bank={bank} isEdit={true} />
    </div>
  );
}