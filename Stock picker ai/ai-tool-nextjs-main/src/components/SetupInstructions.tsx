'use client';

import React from 'react';

interface SetupInstructionsProps {
  hasAlpacaKeys: boolean;
  hasFinnhubKeys: boolean;
}

export default function SetupInstructions({ hasAlpacaKeys, hasFinnhubKeys }: SetupInstructionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Welcome to Stock Picker Pro!</h2>
      <p className="text-gray-600 mb-4">
        Your professional trading dashboard is ready! Configure your API keys to unlock all features.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Alpaca API Status */}
        <div className={`border rounded-lg p-4 ${hasAlpacaKeys ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className="flex items-center mb-2">
            <span className={`text-2xl mr-2 ${hasAlpacaKeys ? 'text-green-600' : 'text-yellow-600'}`}>
              {hasAlpacaKeys ? '✅' : '⚠️'}
            </span>
            <h3 className="font-semibold text-gray-900">Alpaca API</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {hasAlpacaKeys 
              ? 'Connected - Portfolio & trading features enabled'
              : 'Not configured - Portfolio & trading features disabled'
            }
          </p>
          {!hasAlpacaKeys && (
            <div className="text-xs text-gray-500">
              <p>• Portfolio management</p>
              <p>• Trading signals</p>
              <p>• Market analysis</p>
            </div>
          )}
        </div>

        {/* Finnhub API Status */}
        <div className={`border rounded-lg p-4 ${hasFinnhubKeys ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className="flex items-center mb-2">
            <span className={`text-2xl mr-2 ${hasFinnhubKeys ? 'text-green-600' : 'text-yellow-600'}`}>
              {hasFinnhubKeys ? '✅' : '⚠️'}
            </span>
            <h3 className="font-semibold text-gray-900">Finnhub API</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {hasFinnhubKeys 
              ? 'Connected - Real-time data & charts enabled'
              : 'Not configured - Real-time features disabled'
            }
          </p>
          {!hasFinnhubKeys && (
            <div className="text-xs text-gray-500">
              <p>• Real-time stock quotes</p>
              <p>• Interactive charts</p>
              <p>• Live price updates</p>
            </div>
          )}
        </div>
      </div>

      {(!hasAlpacaKeys || !hasFinnhubKeys) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li>Copy the environment template: <code className="bg-blue-100 px-2 py-1 rounded text-sm">copy "env-template.txt" ".env.local"</code></li>
            <li>Edit <code className="bg-blue-100 px-2 py-1 rounded text-sm">.env.local</code> and add your API keys</li>
            <li>
              Get API keys from:
              <ul className="ml-4 mt-1 space-y-1">
                {!hasAlpacaKeys && <li>• <a href="https://alpaca.markets" target="_blank" className="text-blue-600 underline">Alpaca Markets</a> (Paper Trading)</li>}
                {!hasFinnhubKeys && <li>• <a href="https://finnhub.io" target="_blank" className="text-blue-600 underline">Finnhub</a> (Free tier available)</li>}
              </ul>
            </li>
            <li>Restart your development server: <code className="bg-blue-100 px-2 py-1 rounded text-sm">npm run dev</code></li>
            <li>Refresh this page to see your trading dashboard</li>
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-green-600 text-2xl mb-2">📊</div>
          <h3 className="font-semibold text-green-900">RSI Analysis</h3>
          <p className="text-sm text-green-700">30-70 range signals</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-blue-600 text-2xl mb-2">📈</div>
          <h3 className="font-semibold text-blue-900">MACD Signals</h3>
          <p className="text-sm text-blue-700">12,26,9 settings</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-purple-600 text-2xl mb-2">🎯</div>
          <h3 className="font-semibold text-purple-900">Bollinger Bands</h3>
          <p className="text-sm text-purple-700">Volatility analysis</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-orange-600 text-2xl mb-2">⚡</div>
          <h3 className="font-semibold text-orange-900">VWAP</h3>
          <p className="text-sm text-orange-700">Volume weighted price</p>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Stock Screener & Watch List</h3>
        <p className="text-gray-600 mb-4">
          Search for any stock symbol and get comprehensive technical analysis with all four indicators:
        </p>
        <ul className="text-gray-600 space-y-1">
          <li>• <strong>RSI (Relative Strength Index)</strong> - Identify overbought/oversold conditions</li>
          <li>• <strong>MACD (12,26,9)</strong> - Spot trend changes and momentum shifts</li>
          <li>• <strong>Bollinger Bands (20,2)</strong> - Measure volatility and price extremes</li>
          <li>• <strong>VWAP</strong> - Volume-weighted average price for institutional reference</li>
        </ul>
        <p className="text-sm text-gray-500 mt-3">
          Build your watch list and get real-time analysis for all your favorite stocks!
        </p>
      </div>
    </div>
  );
}
