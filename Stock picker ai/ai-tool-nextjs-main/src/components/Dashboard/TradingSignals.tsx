'use client';

import { StockData, CryptoData, TradingSignal } from '@/types/trading';
import { useState } from 'react';

interface TradingSignalsProps {
  stocks: StockData[];
  crypto: CryptoData[];
}

export default function TradingSignals({ stocks, crypto }: TradingSignalsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'buy' | 'sell' | 'short'>('all');

  // Combine all signals
  const allSignals: TradingSignal[] = [
    ...stocks.map(stock => stock.signal).filter(Boolean),
    ...crypto.map(crypto => crypto.signal).filter(Boolean)
  ].filter(Boolean) as TradingSignal[];

  // Filter signals based on active tab
  const filteredSignals = allSignals.filter(signal => {
    if (activeTab === 'all') return true;
    return signal.action === activeTab.toUpperCase();
  });

  // Sort by confidence
  const sortedSignals = filteredSignals.sort((a, b) => b.confidence - a.confidence);

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      case 'SHORT': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const tabs = [
    { id: 'all', label: 'All Signals', count: allSignals.length },
    { id: 'buy', label: 'Buy', count: allSignals.filter(s => s.action === 'BUY').length },
    { id: 'sell', label: 'Sell', count: allSignals.filter(s => s.action === 'SELL').length },
    { id: 'short', label: 'Short', count: allSignals.filter(s => s.action === 'SHORT').length },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Trading Signals</h2>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Signals Grid */}
      {sortedSignals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No signals found</h3>
          <p className="text-gray-600">
            {activeTab === 'all' 
              ? 'No trading signals available at the moment.'
              : `No ${activeTab} signals available at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSignals.map((signal, index) => (
            <div key={`${signal.symbol}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{signal.symbol}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(signal.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSignalColor(signal.action)}`}>
                  {signal.action}
                </span>
              </div>

              {/* Confidence */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Confidence:</span>
                  <span className="font-medium">{signal.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getConfidenceColor(signal.confidence)}`}
                    style={{ width: `${signal.confidence}%` }}
                  ></div>
                </div>
              </div>

              {/* Key Indicators */}
              <div className="mb-3 space-y-1">
                {signal.indicators.rsi && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>RSI:</span>
                    <span className="font-medium">{signal.indicators.rsi.toFixed(2)}</span>
                  </div>
                )}
                
                {signal.indicators.vwap && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>VWAP:</span>
                    <span className="font-medium">${signal.indicators.vwap.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Reason */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {signal.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {signal.action === 'BUY' && (
                  <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                    Execute Buy
                  </button>
                )}
                {signal.action === 'SELL' && (
                  <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors">
                    Execute Sell
                  </button>
                )}
                {signal.action === 'SHORT' && (
                  <button className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors">
                    Execute Short
                  </button>
                )}
                <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {allSignals.filter(s => s.action === 'BUY').length}
            </div>
            <div className="text-sm text-gray-600">Buy Signals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {allSignals.filter(s => s.action === 'SELL').length}
            </div>
            <div className="text-sm text-gray-600">Sell Signals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {allSignals.filter(s => s.action === 'SHORT').length}
            </div>
            <div className="text-sm text-gray-600">Short Signals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {allSignals.length}
            </div>
            <div className="text-sm text-gray-600">Total Signals</div>
          </div>
        </div>
      </div>
    </div>
  );
}
