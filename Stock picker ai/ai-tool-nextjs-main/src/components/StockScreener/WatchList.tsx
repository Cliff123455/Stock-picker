'use client';

import { useState, useEffect } from 'react';
import { StockData } from '@/types/trading';

interface WatchListProps {
  watchList: string[];
  onRemoveStock: (symbol: string) => void;
  onAnalyzeStock: (symbol: string) => void;
}

interface WatchListStock extends StockData {
  signal?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export default function WatchList({ watchList, onRemoveStock, onAnalyzeStock }: WatchListProps) {
  const [stocks, setStocks] = useState<WatchListStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current prices for watch list stocks
  const fetchWatchListData = async () => {
    if (watchList.length === 0) {
      setStocks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call our server-side API endpoint
      const response = await fetch(`/api/watchlist-data?symbols=${watchList.join(',')}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch watch list data');
      }

      setStocks(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch watch list data');
      console.error('Error fetching watch list data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when watch list changes
  useEffect(() => {
    fetchWatchListData();
  }, [watchList]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchWatchListData, 30000);
    return () => clearInterval(interval);
  }, [watchList]);

  const getSignalColor = (signal?: string) => {
    switch (signal) {
      case 'BULLISH': return 'text-green-600 bg-green-100';
      case 'BEARISH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (watchList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Watch List</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">👀</div>
          <p className="text-gray-600 mb-2">No stocks in your watch list</p>
          <p className="text-sm text-gray-500">Search for stocks above to add them to your watch list</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Watch List</h2>
        <button
          onClick={fetchWatchListData}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
                {stock.signal && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(stock.signal)}`}>
                    {stock.signal}
                  </span>
                )}
              </div>
              <button
                onClick={() => onRemoveStock(stock.symbol)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Remove from watch list"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold text-gray-900">
                ${stock.price.toFixed(2)}
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getChangeColor(stock.change)}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                </div>
                <div className={`text-sm ${getChangeColor(stock.change)}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAnalyzeStock(stock.symbol)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Analyze
              </button>
              <button
                onClick={() => onRemoveStock(stock.symbol)}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && stocks.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading watch list...</p>
        </div>
      )}
    </div>
  );
}
