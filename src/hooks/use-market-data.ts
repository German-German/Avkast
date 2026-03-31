"use client";

import { useState, useEffect, useCallback } from "react";

export interface MarketData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export function useMarketData(tickers: string[], refreshInterval = 60000) {
  const [data, setData] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (tickers.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/market-data?tickers=${tickers.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch market data");
      
      const result = await res.json();
      const mapping: Record<string, MarketData> = {};
      result.forEach((d: MarketData) => {
        mapping[d.ticker] = d;
      });
      
      setData(prev => ({ ...prev, ...mapping }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [tickers]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refresh: fetchData };
}
