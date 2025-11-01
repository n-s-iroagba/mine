'use client';

import { MiningContractForm } from '@/components/forms/miningContract/MiningContractForm';
import React from 'react';

export default function CreateMiningContractPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Mining Contract</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new mining contract configuration
        </p>
      </div>
      <MiningContractForm />
    </div>
  );
}