"use client";


interface UseCoinsResult {
  data: Coin[] | null;
  loading: boolean;
  error: string | null;
}

import { useEffect, useState } from "react";

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
}

interface UseCoinsResult {
  data: Coin[] | null;
  loading: boolean;
  error: string | null;
}

export const useCoins = (): UseCoinsResult => {
  const [data, setData] = useState<Coin[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`, // ✅ Added required parameter
          {
            method: "GET",
            headers: {
              "x-cg-api-key": "CG-6bitY7W2uLwfT62sbPiQWfFL", // ✅ Correct header key for PRO API
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  return { data, loading, error };
};


export const useExchangeRates = () => {
  const { data: coins, loading: coinsLoading } = useCoins();

  const getExchangeRate = (currencyName: string): number => {
    if (!coins) return 1;
    
    const coin = coins.find(c => 
      c.name.toLowerCase() === currencyName.toLowerCase() ||
      c.symbol.toLowerCase() === currencyName.toLowerCase()
    );
    
    return coin?.current_price || 1;
  };

  const convertToUSD = (amount: number, currencyName: string): number => {
    const rate = getExchangeRate(currencyName);
    return amount * rate;
  };

  const convertFromUSD = (usdAmount: number, currencyName: string): number => {
    const rate = getExchangeRate(currencyName);
    return rate > 0 ? usdAmount / rate : 0;
  };

  const getCoinData = (currencyName: string) => {
    if (!coins) return null;
    
    return coins.find(c => 
      c.name.toLowerCase() === currencyName.toLowerCase() ||
      c.symbol.toLowerCase() === currencyName.toLowerCase()
    );
  };

  return {
    getExchangeRate,
    convertToUSD,
    convertFromUSD,
    getCoinData,
    coinsLoading,
    coins
  };
};