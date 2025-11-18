'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { emailService } from '@/services';
import { minerService } from '@/services/minerService';

export default function EmailManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'miners' | 'admins'>('single');
  const [formData, setFormData] = useState({
    to: 0,
    subject: '',
    message: '',
    type: 'general' as 'general' | 'notification' | 'alert',
  });
  const [bulkFormData, setBulkFormData] = useState({
    minerIds: [] as number[],
    subject: '',
    message: '',
  });
  const [groupFormData, setGroupFormData] = useState({
    subject: '',
    message: '',
    minerId: undefined as number | undefined,
  });
  const [result, setResult] = useState<any>(null);

  // Miner list state
  const [miners, setMiners] = useState<any[]>([]);
  const [minersLoading, setMinersLoading] = useState(false);

  // Load miners when SINGLE or BULK tab is opened
  useEffect(() => {
    if (activeTab === 'bulk' || activeTab === 'single') loadMiners();
  }, [activeTab]);

  const loadMiners = async () => {
    try {
      setMinersLoading(true);
      const minersData = await minerService.getAllMiners();
      setMiners(minersData);
    } catch (error) {
      console.error('Failed to load miners:', error);
    } finally {
      setMinersLoading(false);
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const success = await emailService.sendEmail(formData);
      setResult({ success, message: success ? 'Email sent successfully' : 'Failed to send email' });
      if (success) {
        setFormData({ to: 0, subject: '', message: '', type: 'general' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const result = await emailService.sendBulkEmail(bulkFormData);
      setResult({
        success: true,
        message: `Bulk email sent: ${result.sent} successful, ${result.failed} failed`,
        details: result
      });

      if (result.sent > 0) {
        setBulkFormData({ minerIds: [], subject: '', message: '' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleMinersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const result = await emailService.sendEmailToAllMiners(groupFormData);
      setResult({
        success: true,
        message: `Email sent: ${result.sent} successful, ${result.failed} failed`,
        details: result
      });

      if (result.sent > 0) {
        setGroupFormData({ subject: '', message: '', minerId: undefined });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const result = await emailService.sendEmailToAllAdmins(groupFormData);
      setResult({
        success: true,
        message: `Email sent to admins: ${result.sent} successful, ${result.failed} failed`,
        details: result
      });

      if (result.sent > 0) {
        setGroupFormData({ subject: '', message: '', minerId: undefined });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'single', label: 'Single Email', icon: '📧' },
    { id: 'bulk', label: 'Bulk Email', icon: '👥' },
    { id: 'miners', label: 'All Miners', icon: '⛏️' },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
        <p className="mt-1 text-sm text-gray-600">Send emails to users and manage communications</p>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className={result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.message}
                </p>
                {result.details && (
                  <p className="text-sm text-gray-600 mt-1">
                    {result.details.sent} sent, {result.details.failed} failed
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SINGLE EMAIL */}
      {activeTab === 'single' && (
        <Card>
          <CardHeader>
            <CardTitle>Send Single Email</CardTitle>
            <CardDescription>Send an email to a specific user</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleSubmit} className="space-y-6">

              {/* ---- NEW MINER DROPDOWN ADDED HERE ---- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Miner
                </label>
                <select
                  disabled={minersLoading}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const miner = miners.find((m) => m.id === id);
                    setFormData((prev) => ({
                      ...prev,
                      to: miner?.id || ''
                    }));
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">-- Choose Miner --</option>
                  {miners.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName || m.email || ` ${m.firstname} ${m.lastname}`}
                    </option>
                  ))}
                </select>
              </div>
           

          

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="general">General</option>
                  <option value="notification">Notification</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject..."
                required
              />

              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Email message..."
                required
              />

              <Button type="submit" loading={loading} disabled={loading}>
                Send Email
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* BULK EMAIL */}
      {activeTab === 'bulk' && (
        <Card>
          <CardHeader>
            <CardTitle>Send Bulk Email</CardTitle>
            <CardDescription>Select miners to send bulk email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Miners
                </label>

                <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                  {minersLoading && <p className="text-sm text-gray-500">Loading miners...</p>}
                  {!minersLoading && miners.length === 0 && (
                    <p className="text-sm text-gray-500">No miners found.</p>
                  )}
                  {!minersLoading &&
                    miners.map((m: any) => (
                      <label key={m.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bulkFormData.minerIds.includes(m.id)}
                          onChange={(e) => {
                            setBulkFormData((prev) => ({
                              ...prev,
                              minerIds: e.target.checked
                                ? [...prev.minerIds, m.id]
                                : prev.minerIds.filter((id) => id !== m.id)
                            }));
                          }}
                        />
                        <span>{m.fullName || m.email || `Miner ${m.id}`}</span>
                      </label>
                    ))}
                </div>
              </div>

              <Input
                label="Subject"
                value={bulkFormData.subject}
                onChange={(e) => setBulkFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              />

              <textarea
                value={bulkFormData.message}
                onChange={(e) => setBulkFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />

              <Button
                type="submit"
                loading={loading}
                disabled={loading || bulkFormData.minerIds.length === 0}
              >
                Send Bulk Email ({bulkFormData.minerIds.length} selected)
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ALL MINERS */}
      {activeTab === 'miners' && (
        <Card>
          <CardHeader>
            <CardTitle>Email All Miners</CardTitle>
            <CardDescription>Send email to all registered miners</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMinersSubmit} className="space-y-6">
              <Input
                label="Subject"
                value={groupFormData.subject}
                onChange={(e) => setGroupFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              />

              <textarea
                value={groupFormData.message}
                onChange={(e) => setGroupFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />

              <Button type="submit" loading={loading} disabled={loading}>
                Send to All Miners
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ADMINS */}
      {activeTab === 'admins' && (
        <Card>
          <CardHeader>
            <CardTitle>Email All Admins</CardTitle>
            <CardDescription>Send email to all admins</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminsSubmit} className="space-y-6">
              <Input
                label="Subject"
                value={groupFormData.subject}
                onChange={(e) => setGroupFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              />

              <textarea
                value={groupFormData.message}
                onChange={(e) => setGroupFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />

              <Button type="submit" loading={loading} disabled={loading}>
                Send to All Admins
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
