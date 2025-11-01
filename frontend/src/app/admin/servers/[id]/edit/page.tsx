'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { miningServerService } from '@/services';
import { MiningServerForm } from '@/components/forms/miningServer/MiningServerForm';
import { useApiQuery } from '@/hooks/useApi';

export default function EditMiningServerPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: server, isLoading, error } = useApiQuery(
    ['mining-server', id],
    () => miningServerService.getServerById(id)
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

  if (error || !server) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <p className="text-gray-600">Failed to load mining server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Mining Server</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update mining server details
        </p>
      </div>
      <MiningServerForm server={server} isEdit={true} />
    </div>
  );
}