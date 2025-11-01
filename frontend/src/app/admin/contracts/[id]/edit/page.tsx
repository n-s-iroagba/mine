'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { miningContractService } from '@/services';
import { MiningContractForm } from '@/components/forms/miningContract/MiningContractForm';
import { useApiQuery } from '@/hooks/useApi';

export default function EditMiningContractPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: contract, isLoading, error } = useApiQuery(
    ['mining-contract', id],
    () => miningContractService.getContractById(id)
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

  if (error || !contract) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load mining contract</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Mining Contract</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update mining contract #{contract.id}
        </p>
      </div>
      <MiningContractForm contract={contract} isEdit={true} />
    </div>
  );
}