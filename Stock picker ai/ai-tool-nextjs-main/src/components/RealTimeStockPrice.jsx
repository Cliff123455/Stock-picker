'use client';

import { useStockWebSocket } from '@/hooks/useStockWebSocket';
import { useEffect, useState } from 'react';

export default function RealTimeStockPrice({ symbol, showDetails = true }) {
  const { prices, connectionStatus } = useStockWebSocket([symbol]);
  const [fallbackPrice, setFallbackPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentData = prices[symbol] || fallbackPrice;

  // Fallback to REST API if WebSocket doesn't provide data
  useEffect(() => {
    const fetchFallbackPrice = async () => {
      try {
        const response = await fetch(`/api/stock/${symbol}`);
        const data = await response.json();
        setFallbackPrice({
          price: data.c, // current price
          change: data.d, // change
          changePercent: data.dp, // change percent
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Failed to fetch fallback price:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch fallback price initially and if no WebSocket data after 3 seconds
    fetchFallbackPrice();
    const timeout = setTimeout(() => {
      if (!prices[symbol]) {
        fetchFallbackPrice();
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [symbol, prices]);

  if (loading && !currentData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  const isPositive = currentData?.change >= 0;
  const priceColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className={`p-4 rounded-lg ${showDetails ? bgColor : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">
              ${currentData?.price?.toFixed(2) || '---'}
            </span>
            {currentData?.change !== undefined && (
              <div className={`flex items-center ${priceColor}`}>
                {isPositive ? (
                  <ArrowUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(currentData.change).toFixed(2)}
                  {currentData.changePercent && (
                    <span className="ml-1">
                      ({Math.abs(currentData.changePercent).toFixed(2)}%)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {showDetails && (
          <div className="text-right">
            <ConnectionIndicator status={connectionStatus} />
            {currentData?.volume && (
              <p className="text-sm text-gray-500 mt-1">
                Vol: {(currentData.volume / 1000000).toFixed(2)}M
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Connection status indicator
function ConnectionIndicator({ status }) {
  const statusConfig = {
    connected: { color: 'bg-green-500', text: 'Live' },
    disconnected: { color: 'bg-gray-500', text: 'Offline' },
    reconnecting: { color: 'bg-yellow-500', text: 'Reconnecting' },
    error: { color: 'bg-red-500', text: 'Error' }
  };

  const config = statusConfig[status] || statusConfig.disconnected;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-xs text-gray-600">{config.text}</span>
    </div>
  );
}

// Simple Arrow Icons (if you don't have @heroicons/react installed)
function ArrowUpIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowDownIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}