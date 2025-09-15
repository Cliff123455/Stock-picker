'use client';

import { CryptoData } from '@/types/trading';
import { useState } from 'react';

interface CryptoCardProps {
  crypto: CryptoData;
}

export default function CryptoCard({ crypto }: CryptoCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      case 'SHORT': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{crypto.name}</h3>
          <p className="text-sm text-gray-600">{crypto.symbol}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(crypto.signal?.action || 'HOLD')}`}>
          {crypto.signal?.action || 'HOLD'}
        </span>
      </div>

      {/* Price Information */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${crypto.price.toFixed(2)}
          </span>
          <div className="text-right">
            <div className={`text-sm font-medium ${getChangeColor(crypto.change24h)}`}>
              {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}
            </div>
            <div className={`text-sm ${getChangeColor(crypto.change24h)}`}>
              {crypto.change24h >= 0 ? '+' : ''}{crypto.changePercent24h.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Volume */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>24h Volume:</span>
          <span>${crypto.volume24h.toLocaleString()}</span>
        </div>
      </div>

      {/* Market Cap */}
      {crypto.marketCap > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Market Cap:</span>
            <span>${crypto.marketCap.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Signal Information */}
      {crypto.signal && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Confidence:</span>
            <span className="font-medium">{crypto.signal.confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${crypto.signal.confidence}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
        {crypto.signal?.action === 'BUY' && (
          <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            Buy
          </button>
        )}
        {crypto.signal?.action === 'SELL' && (
          <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors">
            Sell
          </button>
        )}
        {crypto.signal?.action === 'SHORT' && (
          <button className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors">
            Short
          </button>
        )}
      </div>

      {/* Detailed Information */}
      {showDetails && crypto.signal && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Technical Analysis</h4>
          
          {/* RSI */}
          {crypto.signal.indicators.rsi && (
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>RSI:</span>
              <span className="font-medium">{crypto.signal.indicators.rsi.toFixed(2)}</span>
            </div>
          )}

          {/* Moving Averages */}
          {crypto.signal.indicators.movingAverages && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>SMA 20:</span>
                <span className="font-medium">${crypto.signal.indicators.movingAverages.sma20.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>SMA 50:</span>
                <span className="font-medium">${crypto.signal.indicators.movingAverages.sma50.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>SMA 200:</span>
                <span className="font-medium">${crypto.signal.indicators.movingAverages.sma200.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Bollinger Bands */}
          {crypto.signal.indicators.bollingerBands && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>BB Upper:</span>
                <span className="font-medium">${crypto.signal.indicators.bollingerBands.upper.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>BB Lower:</span>
                <span className="font-medium">${crypto.signal.indicators.bollingerBands.lower.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* VWAP */}
          {crypto.signal.indicators.vwap && (
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>VWAP:</span>
                <span className="font-medium">${crypto.signal.indicators.vwap.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="mt-3">
            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              {crypto.signal.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
