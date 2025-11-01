'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '@/components/ui/badge';


export default function AdminDashboard() {
  // Mock data for dashboard - in real app, this would come from API
  const stats = [
    { name: 'Total Miners', value: '1,234', change: '+12%', changeType: 'positive' },
    { name: 'Active Subscriptions', value: '892', change: '+8%', changeType: 'positive' },
    { name: 'Total Revenue', value: '$124,567', change: '+23%', changeType: 'positive' },
    { name: 'Pending KYC', value: '23', change: '-5%', changeType: 'negative' },
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Created subscription', time: '2 min ago', type: 'subscription' },
    { id: 2, user: 'Jane Smith', action: 'KYC approved', time: '5 min ago', type: 'kyc' },
    { id: 3, user: 'Mike Johnson', action: 'Payment received', time: '10 min ago', type: 'payment' },
    { id: 4, user: 'Sarah Wilson', action: 'New miner registered', time: '15 min ago', type: 'registration' },
  ];

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'subscription': return 'secondary';
      case 'kyc': return 'default';
      case 'payment': return 'secondary';
      case 'registration': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Admin!</h1>
        <p className="text-gray-600">
          Here's what's happening with your mining platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/wallets/create">
              <Button variant="outline" className="w-full h-16 flex-col">
                <span className="text-lg mb-1">👛</span>
                Add Wallet
              </Button>
            </Link>
            <Link href="/admin/servers/create">
              <Button variant="outline" className="w-full h-16 flex-col">
                <span className="text-lg mb-1">🖥️</span>
                Add Server
              </Button>
            </Link>
            <Link href="/admin/contractsss/create">
              <Button variant="outline" className="w-full h-16 flex-col">
                <span className="text-lg mb-1">📑</span>
                Create Contract
              </Button>
            </Link>
            <Link href="/admin/kyc">
              <Button variant="outline" className="w-full h-16 flex-col">
                <span className="text-lg mb-1">✅</span>
                Review KYC
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Badge variant={getActivityBadgeVariant(activity.type)}>
                    {activity.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current platform health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">API</p>
                <p className="text-sm text-green-700">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Database</p>
                <p className="text-sm text-green-700">Healthy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium text-yellow-900">Payments</p>
                <p className="text-sm text-yellow-700">Processing</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}