'use client';

import { useState, useEffect } from 'react';
import { StockData, TradingSignal } from '@/types/trading';

interface BulkAnalysisProps {
  watchList: string[];
  onClose: () => void;
}

interface StockAnalysis extends StockData {
  analysis: TradingSignal;
  loading: boolean;
  error?: string;
}

export default function BulkAnalysis({ watchList, onClose }: BulkAnalysisProps) {
  const [stocks, setStocks] = useState<StockAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (watchList.length > 0) {
      analyzeAllStocks();
    }
  }, [watchList]);

  const analyzeAllStocks = async () => {
    setLoading(true);
    const stockAnalyses: StockAnalysis[] = [];

    // Initialize all stocks as loading
    for (const symbol of watchList) {
      stockAnalyses.push({
        symbol,
        name: symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        timestamp: '',
        analysis: {
          symbol,
          action: 'HOLD',
          confidence: 0,
          reason: 'Loading...',
          indicators: {},
          timestamp: new Date().toISOString()
        },
        loading: true
      });
    }

    setStocks(stockAnalyses);

    // Analyze each stock
    for (let i = 0; i < watchList.length; i++) {
      const symbol = watchList[i];
      try {
        const analysis = await analyzeStock(symbol);
        setStocks(prev => prev.map((stock, index) => 
          index === i ? { ...stock, ...analysis, loading: false } : stock
        ));
      } catch (error) {
        setStocks(prev => prev.map((stock, index) => 
          index === i ? { 
            ...stock, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Analysis failed'
          } : stock
        ));
      }
    }

    setLoading(false);
  };

  const analyzeStock = async (symbol: string): Promise<Partial<StockAnalysis>> => {
    try {
      // Call our server-side API endpoint
      const response = await fetch(`/api/analyze-stock?symbol=${symbol}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze stock');
      }

      return {
        symbol: result.data.stock.symbol,
        name: result.data.stock.name,
        price: result.data.stock.price,
        change: result.data.stock.change,
        changePercent: result.data.stock.changePercent,
        volume: result.data.stock.volume,
        timestamp: result.data.stock.timestamp,
        analysis: result.data.analysis
      };
    } catch (error) {
      throw error;
    }
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-100 text-green-800';
      case 'SELL': return 'bg-red-100 text-red-800';
      case 'SHORT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndicatorColor = (value: number, type: 'rsi' | 'macd' | 'bollinger' | 'vwap', price?: number, indicators?: any) => {
    if (!indicators) return 'bg-gray-100 text-gray-600';
    
    switch (type) {
      case 'rsi':
        if (value < 30) return 'bg-green-100 text-green-800';
        if (value > 70) return 'bg-red-100 text-red-800';
        if (value < 40) return 'bg-yellow-100 text-yellow-800';
        if (value > 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-600';
      
      case 'macd':
        if (indicators.macd && indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0) {
          return 'bg-green-100 text-green-800';
        }
        if (indicators.macd && indicators.macd.macd < indicators.macd.signal && indicators.macd.histogram < 0) {
          return 'bg-red-100 text-red-800';
        }
        return 'bg-gray-100 text-gray-600';
      
      case 'bollinger':
        if (price && indicators.bollingerBands) {
          if (price < indicators.bollingerBands.lower) return 'bg-green-100 text-green-800';
          if (price > indicators.bollingerBands.upper) return 'bg-red-100 text-red-800';
          if (price < indicators.bollingerBands.middle) return 'bg-orange-100 text-orange-800';
          if (price > indicators.bollingerBands.middle) return 'bg-blue-100 text-blue-800';
        }
        return 'bg-gray-100 text-gray-600';
      
      case 'vwap':
        if (price && indicators.vwap) {
          return price > indicators.vwap ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        }
        return 'bg-gray-100 text-gray-600';
      
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const exportToCSV = async () => {
    setExportLoading(true);
    
    try {
      const csvContent = [
        ['Symbol', 'Price', 'Change', 'Change%', 'Volume', 'Signal', 'Confidence', 'RSI', 'MACD Signal', 'Bollinger Signal', 'VWAP Signal', 'Reason'],
        ...stocks.map(stock => [
          stock.symbol,
          stock.price.toFixed(2),
          stock.change.toFixed(2),
          stock.changePercent.toFixed(2),
          stock.volume.toString(),
          stock.analysis.action,
          stock.analysis.confidence.toString(),
          stock.analysis.indicators.rsi?.toFixed(2) || 'N/A',
          stock.analysis.indicators.macd ? 
            (stock.analysis.indicators.macd.macd > stock.analysis.indicators.macd.signal ? 'BULLISH' : 'BEARISH') : 'N/A',
          stock.analysis.indicators.bollingerBands ? 
            (stock.price < stock.analysis.indicators.bollingerBands.lower ? 'OVERSOLD' : 
             stock.price > stock.analysis.indicators.bollingerBands.upper ? 'OVERBOUGHT' : 'NEUTRAL') : 'N/A',
          stock.analysis.indicators.vwap ? 
            (stock.price > stock.analysis.indicators.vwap ? 'ABOVE' : 'BELOW') : 'N/A',
          stock.analysis.reason.replace(/,/g, ';') // Replace commas to avoid CSV issues
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock_analysis_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const getStrongBuyCount = () => {
    return stocks.filter(stock => 
      stock.analysis.action === 'BUY' && 
      stock.analysis.confidence >= 70 &&
      stock.analysis.indicators.rsi && stock.analysis.indicators.rsi < 40 &&
      stock.analysis.indicators.macd && stock.analysis.indicators.macd.macd > stock.analysis.indicators.macd.signal &&
      stock.analysis.indicators.bollingerBands && stock.price < stock.analysis.indicators.bollingerBands.middle &&
      stock.analysis.indicators.vwap && stock.price > stock.analysis.indicators.vwap
    ).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Bulk Stock Analysis</h2>
              <p className="text-gray-600 mt-1">
                {stocks.length} stocks • {getStrongBuyCount()} strong buy signals
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                disabled={exportLoading || stocks.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? 'Exporting...' : '📊 Export CSV'}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MACD</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bollinger</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VWAP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.map((stock, index) => (
                <tr key={stock.symbol} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stock.symbol}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className={`${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </div>
                    <div className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {stock.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : stock.error ? (
                      <span className="text-red-600 text-xs">Error</span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(stock.analysis.action)}`}>
                        {stock.analysis.action}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stock.loading ? '-' : `${stock.analysis.confidence}%`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {stock.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : stock.error ? (
                      <span className="text-red-600 text-xs">-</span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIndicatorColor(stock.analysis.indicators.rsi || 0, 'rsi')}`}>
                        {stock.analysis.indicators.rsi?.toFixed(1) || 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {stock.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : stock.error ? (
                      <span className="text-red-600 text-xs">-</span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIndicatorColor(0, 'macd', stock.price, stock.analysis.indicators)}`}>
                        {stock.analysis.indicators.macd ? 
                          (stock.analysis.indicators.macd.macd > stock.analysis.indicators.macd.signal ? '↑' : '↓') : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {stock.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : stock.error ? (
                      <span className="text-red-600 text-xs">-</span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIndicatorColor(0, 'bollinger', stock.price, stock.analysis.indicators)}`}>
                        {stock.analysis.indicators.bollingerBands ? 
                          (stock.price < stock.analysis.indicators.bollingerBands.lower ? 'L' : 
                           stock.price > stock.analysis.indicators.bollingerBands.upper ? 'U' : 'M') : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {stock.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : stock.error ? (
                      <span className="text-red-600 text-xs">-</span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIndicatorColor(0, 'vwap', stock.price, stock.analysis.indicators)}`}>
                        {stock.analysis.indicators.vwap ? 
                          (stock.price > stock.analysis.indicators.vwap ? '↑' : '↓') : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stock.volume.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing stocks...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
