'use client';

import React, { useState, useEffect } from 'react';
import { StockData, CryptoData, Portfolio } from '@/types/trading';
import MarketOverview from '@/components/Dashboard/MarketOverview';
import TradingSignals from '@/components/Dashboard/TradingSignals';
import PortfolioSummary from '@/components/Dashboard/PortfolioSummary';
import { StockScreener } from '@/components/StockScreener';
import RealTimeStockPrice from '@/components/RealTimeStockPrice';
import StockChart from '@/components/StockChart';
import { useStockWebSocket } from '@/hooks/useStockWebSocket';
import SetupInstructions from '@/components/SetupInstructions';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [crypto, setCrypto] = useState<CryptoData[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  
  // Real-time WebSocket functionality
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']);
  const [newSymbol, setNewSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  
  // Subscribe to all watchlist symbols at once
  const { prices, connectionStatus } = useStockWebSocket(watchlist);

  useEffect(() => {
    checkApiKeysAndLoadData();
  }, []);

  // Watchlist management functions
  const addToWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol && !watchlist.includes(newSymbol.toUpperCase())) {
      setWatchlist([...watchlist, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
    if (selectedStock === symbol) {
      setSelectedStock(watchlist[0] || '');
    }
  };

  const checkApiKeysAndLoadData = async () => {
    try {
      // First check API status
      const statusResponse = await fetch('/api/status');
      const status = await statusResponse.json();
      setApiStatus(status);

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
              
              {/* Real-time Watchlist Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Real-Time Watchlist</h2>
                  <ConnectionBadge status={connectionStatus} />
                </div>
                
                {/* Add Stock Form */}
                <form onSubmit={addToWatchlist} className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                      placeholder="Enter stock symbol (e.g., AAPL)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add to Watchlist
                    </button>
                  </div>
                </form>

                {/* Main Chart */}
                {selectedStock && (
                  <div className="mb-6">
                    <StockChart symbol={selectedStock} />
                  </div>
                )}

                {/* Stock Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {watchlist.map(symbol => (
                    <div 
                      key={symbol} 
                      className={`relative group cursor-pointer ${selectedStock === symbol ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedStock(symbol)}
                    >
                      <RealTimeStockPrice symbol={symbol} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(symbol);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-5 h-5 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Price Summary Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Live Price Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symbol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Update
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {watchlist.map(symbol => {
                          const data = (prices as Record<string, any>)[symbol];
                          return (
                            <tr 
                              key={symbol}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedStock(symbol)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {symbol}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${data?.price?.toFixed(2) || '---'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                data?.change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {data?.change?.toFixed(2) || '---'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {data?.timestamp 
                                  ? new Date(data.timestamp).toLocaleTimeString() 
                                  : '---'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
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
              {apiStatus && (
                <SetupInstructions 
                  hasAlpacaKeys={apiStatus.alpaca.configured}
                  hasFinnhubKeys={apiStatus.finnhub.configured}
                />
              )}

              {/* Real-time Watchlist (works without API keys) */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Real-Time Watchlist</h2>
                  <div className="flex items-center gap-2">
                    <ConnectionBadge status={connectionStatus} />
                    {apiStatus && !apiStatus.finnhub.configured && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Limited functionality - Add Finnhub API key for full features
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Add Stock Form */}
                <form onSubmit={addToWatchlist} className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                      placeholder="Enter stock symbol (e.g., AAPL)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add to Watchlist
                    </button>
                  </div>
                </form>

                {/* Main Chart */}
                {selectedStock && (
                  <div className="mb-6">
                    <StockChart symbol={selectedStock} />
                  </div>
                )}

                {/* Stock Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {watchlist.map(symbol => (
                    <div 
                      key={symbol} 
                      className={`relative group cursor-pointer ${selectedStock === symbol ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedStock(symbol)}
                    >
                      <RealTimeStockPrice symbol={symbol} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(symbol);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-5 h-5 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Price Summary Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Live Price Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symbol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Update
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {watchlist.map(symbol => {
                          const data = (prices as Record<string, any>)[symbol];
                          return (
                            <tr 
                              key={symbol}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedStock(symbol)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {symbol}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${data?.price?.toFixed(2) || '---'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                data?.change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {data?.change?.toFixed(2) || '---'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {data?.timestamp 
                                  ? new Date(data.timestamp).toLocaleTimeString() 
                                  : '---'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Additional Features Info */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔑</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Additional Features Available</h3>
                <p className="text-gray-600 mb-4">
                  Configure your API keys to unlock these professional features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">With Alpaca API:</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Portfolio management and tracking</li>
                      <li>• Professional trading signals</li>
                      <li>• Market analysis dashboard</li>
                      <li>• Advanced stock screener</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">With Finnhub API:</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Real-time stock quotes</li>
                      <li>• Interactive charts</li>
                      <li>• Live price updates</li>
                      <li>• Historical data analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConnectionBadge({ status }: { status: string }) {
  const badges = {
    connected: 'bg-green-100 text-green-800',
    disconnected: 'bg-gray-100 text-gray-800',
    reconnecting: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${badges[status as keyof typeof badges] || badges.disconnected}`}>
      {status}
    </span>
  );
}
