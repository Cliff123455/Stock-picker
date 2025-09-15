'use client';

import { StockData, TradingSignal } from '@/types/trading';

interface TechnicalAnalysisProps {
  stock: StockData | null;
  analysis: TradingSignal | null;
  loading: boolean;
}

export default function TechnicalAnalysis({ stock, analysis, loading }: TechnicalAnalysisProps) {
  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-100';
      case 'SELL': return 'text-red-600 bg-red-100';
      case 'SHORT': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRSIColor = (rsi: number) => {
    if (rsi < 30) return 'text-green-600 bg-green-100';
    if (rsi > 70) return 'text-red-600 bg-red-100';
    if (rsi < 40) return 'text-yellow-600 bg-yellow-100';
    if (rsi > 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getRSISignal = (rsi: number) => {
    if (rsi < 30) return 'OVERSOLD';
    if (rsi > 70) return 'OVERBOUGHT';
    if (rsi < 40) return 'APPROACHING OVERSOLD';
    if (rsi > 60) return 'APPROACHING OVERBOUGHT';
    return 'NEUTRAL';
  };

  const getMACDSignal = (macd: number, signal: number, histogram: number) => {
    if (macd > signal && histogram > 0) return 'BULLISH CROSSOVER';
    if (macd < signal && histogram < 0) return 'BEARISH CROSSOVER';
    if (macd > signal) return 'BULLISH';
    if (macd < signal) return 'BEARISH';
    return 'NEUTRAL';
  };

  const getMACDColor = (macd: number, signal: number, histogram: number) => {
    if (macd > signal && histogram > 0) return 'text-green-600 bg-green-100';
    if (macd < signal && histogram < 0) return 'text-red-600 bg-red-100';
    if (macd > signal) return 'text-blue-600 bg-blue-100';
    if (macd < signal) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getBollingerSignal = (price: number, upper: number, lower: number, middle: number) => {
    if (price < lower) return 'OVERSOLD - BELOW LOWER BAND';
    if (price > upper) return 'OVERBOUGHT - ABOVE UPPER BAND';
    if (price < middle) return 'BEARISH - BELOW MIDDLE';
    if (price > middle) return 'BULLISH - ABOVE MIDDLE';
    return 'NEUTRAL';
  };

  const getBollingerColor = (price: number, upper: number, lower: number, middle: number) => {
    if (price < lower) return 'text-green-600 bg-green-100';
    if (price > upper) return 'text-red-600 bg-red-100';
    if (price < middle) return 'text-orange-600 bg-orange-100';
    if (price > middle) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getVWAPSignal = (price: number, vwap: number) => {
    if (price > vwap) return 'BULLISH - ABOVE VWAP';
    if (price < vwap) return 'BEARISH - BELOW VWAP';
    return 'NEUTRAL';
  };

  const getVWAPColor = (price: number, vwap: number) => {
    if (price > vwap) return 'text-green-600 bg-green-100';
    if (price < vwap) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Analysis</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing stock data...</p>
        </div>
      </div>
    );
  }

  if (!stock || !analysis) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Analysis</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">Select a stock to view technical analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Technical Analysis - {stock.symbol}</h2>
      
      {/* Stock Overview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{stock.symbol}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSignalColor(analysis.action)}`}>
            {analysis.action}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">${stock.price.toFixed(2)}</div>
          <div className="text-right">
            <div className={`text-lg font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
            </div>
            <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Volume: {stock.volume.toLocaleString()}
        </div>
      </div>

      {/* Trading Signal */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Trading Signal</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Action:</span>
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getSignalColor(analysis.action)}`}>
            {analysis.action}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Confidence:</span>
          <span className="font-medium">{analysis.confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${analysis.confidence}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          {analysis.reason}
        </p>
      </div>

      {/* Technical Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RSI Indicator */}
        {analysis.indicators.rsi && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">RSI (Relative Strength Index)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current RSI:</span>
                <span className="font-medium">{analysis.indicators.rsi.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Signal:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRSIColor(analysis.indicators.rsi)}`}>
                  {getRSISignal(analysis.indicators.rsi)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                RSI below 30 = Oversold (Bullish)<br/>
                RSI above 70 = Overbought (Bearish)
              </div>
            </div>
          </div>
        )}

        {/* MACD Indicator */}
        {analysis.indicators.macd && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">MACD (12, 26, 9)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MACD Line:</span>
                <span className="font-medium">{analysis.indicators.macd.macd.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Signal Line:</span>
                <span className="font-medium">{analysis.indicators.macd.signal.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Histogram:</span>
                <span className="font-medium">{analysis.indicators.macd.histogram.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Signal:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMACDColor(analysis.indicators.macd.macd, analysis.indicators.macd.signal, analysis.indicators.macd.histogram)}`}>
                  {getMACDSignal(analysis.indicators.macd.macd, analysis.indicators.macd.signal, analysis.indicators.macd.histogram)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bollinger Bands */}
        {analysis.indicators.bollingerBands && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bollinger Bands (20, 2)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Upper Band:</span>
                <span className="font-medium">${analysis.indicators.bollingerBands.upper.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Middle Band:</span>
                <span className="font-medium">${analysis.indicators.bollingerBands.middle.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lower Band:</span>
                <span className="font-medium">${analysis.indicators.bollingerBands.lower.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Signal:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBollingerColor(stock.price, analysis.indicators.bollingerBands.upper, analysis.indicators.bollingerBands.lower, analysis.indicators.bollingerBands.middle)}`}>
                  {getBollingerSignal(stock.price, analysis.indicators.bollingerBands.upper, analysis.indicators.bollingerBands.lower, analysis.indicators.bollingerBands.middle)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VWAP Indicator */}
        {analysis.indicators.vwap && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">VWAP (Volume Weighted Average Price)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Price:</span>
                <span className="font-medium">${stock.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">VWAP:</span>
                <span className="font-medium">${analysis.indicators.vwap.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Difference:</span>
                <span className={`font-medium ${stock.price > analysis.indicators.vwap ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.price > analysis.indicators.vwap ? '+' : ''}{(stock.price - analysis.indicators.vwap).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Signal:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVWAPColor(stock.price, analysis.indicators.vwap)}`}>
                  {getVWAPSignal(stock.price, analysis.indicators.vwap)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Moving Averages */}
        {analysis.indicators.movingAverages && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Moving Averages</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SMA 20:</span>
                <span className="font-medium">${analysis.indicators.movingAverages.sma20.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SMA 50:</span>
                <span className="font-medium">${analysis.indicators.movingAverages.sma50.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SMA 200:</span>
                <span className="font-medium">${analysis.indicators.movingAverages.sma200.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Timestamp */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        Analysis generated: {new Date(analysis.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
