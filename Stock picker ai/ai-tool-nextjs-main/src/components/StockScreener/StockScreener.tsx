'use client';

import { useState, useEffect } from 'react';
import { StockData, TradingSignal } from '@/types/trading';
import WatchList from './WatchList';
import StockSearch from './StockSearch';
import TechnicalAnalysis from './TechnicalAnalysis';
import CSVUpload from './CSVUpload';
import BulkAnalysis from './BulkAnalysis';
import BulkTextInput from './BulkTextInput';

interface StockScreenerProps {
  className?: string;
}

export default function StockScreener({ className = '' }: StockScreenerProps) {
  const [watchList, setWatchList] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [stockAnalysis, setStockAnalysis] = useState<TradingSignal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showBulkAnalysis, setShowBulkAnalysis] = useState(false);
  const [showBulkTextInput, setShowBulkTextInput] = useState(false);

  // Load watch list from localStorage on component mount
  useEffect(() => {
    const savedWatchList = localStorage.getItem('stockWatchList');
    if (savedWatchList) {
      setWatchList(JSON.parse(savedWatchList));
    }
  }, []);

  // Save watch list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stockWatchList', JSON.stringify(watchList));
  }, [watchList]);

  const addToWatchList = (symbol: string) => {
    if (!watchList.includes(symbol.toUpperCase())) {
      setWatchList(prev => [...prev, symbol.toUpperCase()]);
    }
  };

  const removeFromWatchList = (symbol: string) => {
    setWatchList(prev => prev.filter(s => s !== symbol));
  };

  const handleCSVImport = (stocks: string[]) => {
    const newStocks = stocks.filter(stock => !watchList.includes(stock));
    setWatchList(prev => [...prev, ...newStocks]);
    setShowCSVUpload(false);
  };

  const handleBulkTextImport = (stocks: string[]) => {
    const newStocks = stocks.filter(stock => !watchList.includes(stock));
    setWatchList(prev => [...prev, ...newStocks]);
    setShowBulkTextInput(false);
  };

  const clearWatchList = () => {
    setWatchList([]);
  };

  const analyzeStock = async (symbol: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call our server-side API endpoint instead of Alpaca directly
      const response = await fetch(`/api/analyze-stock?symbol=${symbol}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze stock');
      }

      setSelectedStock(result.data.stock);
      setStockAnalysis(result.data.analysis);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze stock');
      console.error('Error analyzing stock:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Screener</h1>
            <p className="text-gray-600">
              Search for stocks, analyze technical indicators, and build your watch list
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkTextInput(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              ✏️ Quick Add
            </button>
            <button
              onClick={() => setShowCSVUpload(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              📁 Import CSV
            </button>
            {watchList.length > 0 && (
              <>
                <button
                  onClick={() => setShowBulkAnalysis(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  📊 Bulk Analysis
                </button>
                <button
                  onClick={clearWatchList}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  🗑️ Clear All
                </button>
              </>
            )}
          </div>
        </div>
        
        {watchList.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Watch List Status</h3>
                <p className="text-sm text-blue-700">
                  {watchList.length} stocks in your watch list
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">
                  💡 <strong>Pro Tip:</strong> When all indicators turn green, it's a strong buy signal!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Search */}
      <StockSearch 
        onStockSelect={analyzeStock}
        onAddToWatchList={addToWatchList}
        loading={loading}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watch List */}
        <div className="lg:col-span-1">
          <WatchList 
            watchList={watchList}
            onRemoveStock={removeFromWatchList}
            onAnalyzeStock={analyzeStock}
          />
        </div>

        {/* Technical Analysis */}
        <div className="lg:col-span-2">
          <TechnicalAnalysis 
            stock={selectedStock}
            analysis={stockAnalysis}
            loading={loading}
          />
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showCSVUpload && (
        <CSVUpload
          onStocksImported={handleCSVImport}
          onClose={() => setShowCSVUpload(false)}
        />
      )}

      {/* Bulk Analysis Modal */}
      {showBulkAnalysis && (
        <BulkAnalysis
          watchList={watchList}
          onClose={() => setShowBulkAnalysis(false)}
        />
      )}

      {/* Bulk Text Input Modal */}
      {showBulkTextInput && (
        <BulkTextInput
          onStocksAdded={handleBulkTextImport}
          onClose={() => setShowBulkTextInput(false)}
        />
      )}
    </div>
  );
}
