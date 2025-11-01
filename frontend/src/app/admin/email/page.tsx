'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { emailService } from '@/services';


export default function EmailManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'miners' | 'admins'>('single');
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    type: 'general' as 'general' | 'notification' | 'alert',
  });
  const [bulkFormData, setBulkFormData] = useState({
    userIds: [] as number[],
    subject: '',
    message: '',
  });
  const [groupFormData, setGroupFormData] = useState({
    subject: '',
    message: '',
  });
  const [result, setResult] = useState<any>(null);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const success = await emailService.sendEmail(formData);
      setResult({ success, message: success ? 'Email sent successfully' : 'Failed to send email' });
      if (success) {
        setFormData({ to: '', subject: '', message: '', type: 'general' });
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
        setBulkFormData({ userIds: [], subject: '', message: '' });
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
        message: `Email sent to miners: ${result.sent} successful, ${result.failed} failed`,
        details: result
      });
      if (result.sent > 0) {
        setGroupFormData({ subject: '', message: '' });
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
        setGroupFormData({ subject: '', message: '' });
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
    { id: 'admins', label: 'All Admins', icon: '👨‍💼' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Send emails to users and manage communications
        </p>
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
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
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

      {/* Result Display */}
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

      {/* Single Email Form */}
      {activeTab === 'single' && (
        <Card>
          <CardHeader>
            <CardTitle>Send Single Email</CardTitle>
            <CardDescription>
              Send an email to a specific user by email address or user ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Recipient"
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="Email address or User ID"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="notification">Notification</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
              </div>

              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject line"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email message here..."
                  required
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Send Email
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Email Form */}
      {activeTab === 'bulk' && (
        <Card>
          <CardHeader>
            <CardTitle>Send Bulk Email</CardTitle>
            <CardDescription>
              Send email to multiple users by their user IDs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User IDs (comma-separated)
                </label>
                <Input
                  value={bulkFormData.userIds.join(', ')}
                  onChange={(e) => setBulkFormData(prev => ({ 
                    ...prev, 
                    userIds: e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                  }))}
                  placeholder="1, 2, 3, 4, 5"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter user IDs separated by commas
                </p>
              </div>

              <Input
                label="Subject"
                value={bulkFormData.subject}
                onChange={(e) => setBulkFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject line"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={bulkFormData.message}
                  onChange={(e) => setBulkFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email message here..."
                  required
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading || bulkFormData.userIds.length === 0}
                className="w-full sm:w-auto"
              >
                Send Bulk Email ({bulkFormData.userIds.length} users)
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* All Miners Email Form */}
      {activeTab === 'miners' && (
        <Card>
          <CardHeader>
            <CardTitle>Email All Miners</CardTitle>
            <CardDescription>
              Send email to all registered miners on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMinersSubmit} className="space-y-6">
              <Input
                label="Subject"
                value={groupFormData.subject}
                onChange={(e) => setGroupFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject line"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={groupFormData.message}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email message here..."
                  required
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Send to All Miners
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* All Admins Email Form */}
      {activeTab === 'admins' && (
        <Card>
          <CardHeader>
            <CardTitle>Email All Admins</CardTitle>
            <CardDescription>
              Send email to all platform administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminsSubmit} className="space-y-6">
              <Input
                label="Subject"
                value={groupFormData.subject}
                onChange={(e) => setGroupFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject line"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={groupFormData.message}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email message here..."
                  required
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Send to All Admins
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>
            Pre-built email templates for common communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Welcome Email',
                description: 'Welcome new miners to the platform',
                subject: 'Welcome to Satoshi Vertex!',
                message: 'Welcome to Satoshi Vertex! We\'re excited to have you join our mining community...'
              },
              {
                title: 'Payment Received',
                description: 'Confirm payment receipt',
                subject: 'Payment Received - Satoshi Vertex',
                message: 'We have successfully received your payment. Your mining subscription is now active...'
              },
              {
                title: 'KYC Approved',
                description: 'Notify KYC approval',
                subject: 'KYC Verification Approved',
                message: 'Great news! Your KYC verification has been approved. You now have full access to all platform features...'
              },
              {
                title: 'Maintenance Notice',
                description: 'Platform maintenance announcement',
                subject: 'Scheduled Maintenance Notice',
                message: 'We will be performing scheduled maintenance on our platform...'
              },
            ].map((template, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    subject: template.subject,
                    message: template.message
                  }));
                  setActiveTab('single');
                }}
              >
                <h4 className="font-medium text-gray-900 mb-1">{template.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <Badge variant="default">Click to use</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}