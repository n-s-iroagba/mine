'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Coin, useCoins } from '@/hooks/useCoins';
import { adminWalletService } from '@/services';

export default function EditWalletPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const { data: coins, loading: coinsLoading } = useCoins();
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    address: '',
  });

  // Fetch existing wallet data
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setFetchLoading(true);
        const wallet = await adminWalletService.getWalletById(Number(walletId));
        
        setFormData({
          address: wallet.address,
        });

        // Find and set the matching coin
        if (coins && coins.length > 0) {
          const matchingCoin = coins.find(
            (coin: Coin) => coin.symbol.toUpperCase() === wallet.currencyAbbreviation.toUpperCase()
          );
          if (matchingCoin) {
            setSelectedCoin(matchingCoin);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch wallet details');
      } finally {
        setFetchLoading(false);
      }
    };

    if (walletId) {
      fetchWallet();
    }
  }, [walletId, coins]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!selectedCoin) {
      setError('Please select a wallet.');
      setLoading(false);
      return;
    }

    const walletData = {
      currencyAbbreviation: selectedCoin.symbol.toUpperCase(),
      logo: selectedCoin.image,
      currency: selectedCoin.name,
      address: formData.address,
    };
    
    try {
      await adminWalletService.updateWallet(Number(walletId), walletData);
      router.push('/admin/wallets');
    } catch (err: any) {
      setError(err.message || 'Failed to update wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setSearchTerm('');
  };

  const filteredCoins = coins?.filter((coin: Coin) => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Loading wallet details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/wallets">
          <Button variant="outline" size="sm">
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Wallet</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update the wallet information and address
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
          <CardDescription>
            Modify the wallet details. Be careful when changing the address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search coins by name or symbol..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {coinsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading coins...</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                {filteredCoins.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No coins found matching your search.' : 'No coins available.'}
                  </div>
                ) : (
                  filteredCoins.map((coin: Coin) => (
                    <div
                      key={coin.id}
                      className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedCoin?.id === coin.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleCoinSelect(coin)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image
                            src={coin.image}
                            alt={coin.name}
                            fill
                            className="rounded-full object-cover"
                            sizes="24px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900 truncate">{coin.name}</span>
                            <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                              {coin.symbol.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            ${coin.current_price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected Coin Preview */}
            {selectedCoin && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">Selected Coin</h4>
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src={selectedCoin.image}
                      alt={selectedCoin.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-green-900 truncate">{selectedCoin.name}</p>
                    <p className="text-sm text-green-700">{selectedCoin.symbol.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Wallet Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter the wallet address"
              required
            />

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="sm:w-auto"
              >
                Update Wallet
              </Button>
              <Link href="/admin/wallets">
                <Button type="button" variant="outline" className="sm:w-auto">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}