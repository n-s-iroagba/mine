'use client';

import { MiningServerForm } from '@/components/forms/miningServer/MiningServerForm';
import React from 'react';


export default function CreateMiningServerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Mining Server</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new mining server configuration
        </p>
      </div>
      <MiningServerForm />
    </div>
  );
}