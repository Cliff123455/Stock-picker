'use client';

import React, { useState, useEffect } from 'react';
import { StockData, CryptoData, Portfolio } from '@/types/trading';
import MarketOverview from '@/components/Dashboard/MarketOverview';
import TradingSignals from '@/components/Dashboard/TradingSignals';
import PortfolioSummary from '@/components/Dashboard/PortfolioSummary';
import { StockScreener } from '@/components/StockScreener';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [crypto, setCrypto] = useState<CryptoData[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    checkApiKeysAndLoadData();
  }, []);

  const checkApiKeysAndLoadData = async () => {
    try {
      // Check if API keys are configured by trying to fetch data
      const [stocksResponse, cryptoResponse, portfolioResponse] = await Promise.allSettled([
        fetch('/api/stocks'),
        fetch('/api/crypto'),
        fetch('/api/portfolio')
      ]);

      const hasValidApiKeys = 
        stocksResponse.status === 'fulfilled' && 
        cryptoResponse.status === 'fulfilled' && 
        portfolioResponse.status === 'fulfilled';

      if (hasValidApiKeys) {
        setHasApiKeys(true);
        
        // Load the actual data
        if (stocksResponse.status === 'fulfilled') {
          const stocksData = await stocksResponse.value.json();
          if (stocksData.success) {
            setStocks(stocksData.data);
          }
        }
        
        if (cryptoResponse.status === 'fulfilled') {
          const cryptoData = await cryptoResponse.value.json();
          if (cryptoData.success) {
            setCrypto(cryptoData.data);
          }
        }
        
        if (portfolioResponse.status === 'fulfilled') {
          const portfolioData = await portfolioResponse.value.json();
          if (portfolioData.success) {
            setPortfolio(portfolioData.data);
          }
        }
      } else {
        setHasApiKeys(false);
      }
    } catch (error) {
      console.error('Error checking API keys:', error);
      setHasApiKeys(false);
      setError('Failed to connect to trading APIs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Stock Picker Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add top padding to account for fixed header */}
      <div className="pt-24 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Stock Picker Pro</h1>
            <p className="text-gray-600 mt-1">Professional Trading Dashboard</p>
            <div className={`text-sm mt-2 ${hasApiKeys ? 'text-green-600' : 'text-gray-500'}`}>
              {hasApiKeys ? '✅ Connected to Alpaca API' : 'Ready for Alpaca API setup'}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {hasApiKeys ? (
            /* Real Dashboard with API Data */
            <div className="space-y-8">
              {/* Portfolio Summary */}
              {portfolio && <PortfolioSummary portfolio={portfolio} />}
              
              {/* Stock Screener */}
              <StockScreener />
              
              {/* Market Overview */}
              <MarketOverview stocks={stocks} crypto={crypto} />
              
              {/* Trading Signals */}
              <TradingSignals stocks={stocks} crypto={crypto} />
            </div>
          ) : (
            /* Setup Instructions */
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Welcome to Stock Picker Pro!</h2>
                <p className="text-gray-600 mb-4">
                  Your professional trading dashboard is ready! To start using it, you need to set up your Alpaca API keys.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside text-blue-800 space-y-2">
                    <li>Copy the environment template: <code className="bg-blue-100 px-2 py-1 rounded">copy "Files for review\env-local-template.txt" ".env.local"</code></li>
                    <li>Edit <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> and add your Alpaca API keys</li>
                    <li>Get your API keys from <a href="https://alpaca.markets" target="_blank" className="text-blue-600 underline">Alpaca Markets</a></li>
                    <li>Refresh this page to see your trading dashboard</li>
                  </ol>
                </div>

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

              {/* Placeholder for when API is connected */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔑</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">API Keys Required</h3>
                <p className="text-gray-600">
                  Once you add your Alpaca API keys, you'll see:
                </p>
                <ul className="text-gray-600 mt-4 space-y-1">
                  <li>• Real-time stock and crypto data</li>
                  <li>• Professional trading signals</li>
                  <li>• Portfolio management</li>
                  <li>• Market analysis dashboard</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
