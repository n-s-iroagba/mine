'use client';

import { BankForm } from '@/components/forms/bank/BankForm';
import React from 'react';


export default function CreateBankPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Bank Account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new bank account for receiving payments
        </p>
      </div>
      <BankForm />
    </div>
  );
}