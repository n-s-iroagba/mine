'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { miningServerService } from '@/services';
import { useApiQuery } from '@/hooks/useApi';

export default function MiningServerDetailsPage() {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mining Server Details</h1>
          <p className="mt-1 text-sm text-gray-600">
            {server.name} - #{server.id}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Link href={`/admin/servers/edit/${server.id}`}>
            <Button variant="outline">
              Edit Server
            </Button>
          </Link>
          <Link href="/admin/servers">
            <Button>
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Server Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Server ID:</span>
              <span className="font-mono">#{server.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Server Name:</span>
              <span className="font-medium">{server.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Hash Rate:</span>
              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-sm">
                {server.hashRate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Power Consumption:</span>
              <span className="text-gray-600">{server.powerConsumptionInKwH}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={server.isActive ? 'secondary' : 'default'}>
                {server.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Created:</span>
              <span>{new Date(server.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated:</span>
              <span>{new Date(server.updatedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}