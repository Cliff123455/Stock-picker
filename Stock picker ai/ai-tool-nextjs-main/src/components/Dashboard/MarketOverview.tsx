'use client';

import { StockData, CryptoData } from '@/types/trading';

interface MarketOverviewProps {
  stocks: StockData[];
  crypto: CryptoData[];
}

export default function MarketOverview({ stocks, crypto }: MarketOverviewProps) {
  // Calculate market statistics
  const stockGainers = stocks.filter(stock => stock.change > 0).length;
  const stockLosers = stocks.filter(stock => stock.change < 0).length;
  const cryptoGainers = crypto.filter(crypto => crypto.change24h > 0).length;
  const cryptoLosers = crypto.filter(crypto => crypto.change24h < 0).length;

  const totalStockVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0);
  const totalCryptoVolume = crypto.reduce((sum, crypto) => sum + crypto.volume24h, 0);

  const avgStockChange = stocks.length > 0 
    ? stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length 
    : 0;
  
  const avgCryptoChange = crypto.length > 0 
    ? crypto.reduce((sum, crypto) => sum + crypto.changePercent24h, 0) / crypto.length 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Overview</h2>
      
      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stocks Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-900">Stocks</h3>
            <div className="text-blue-600 text-2xl">📈</div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Gainers:</span>
              <span className="font-medium text-green-600">{stockGainers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Losers:</span>
              <span className="font-medium text-red-600">{stockLosers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Avg Change:</span>
              <span className={`font-medium ${avgStockChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgStockChange >= 0 ? '+' : ''}{avgStockChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Crypto Summary */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-orange-900">Crypto</h3>
            <div className="text-orange-600 text-2xl">₿</div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-orange-700">Gainers:</span>
              <span className="font-medium text-green-600">{cryptoGainers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-700">Losers:</span>
              <span className="font-medium text-red-600">{cryptoLosers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-700">Avg Change:</span>
              <span className={`font-medium ${avgCryptoChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgCryptoChange >= 0 ? '+' : ''}{avgCryptoChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Volume Summary */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-green-900">Volume</h3>
            <div className="text-green-600 text-2xl">📊</div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Stock Volume:</span>
              <span className="font-medium text-gray-900">
                {totalStockVolume > 1000000 
                  ? `${(totalStockVolume / 1000000).toFixed(1)}M`
                  : `${(totalStockVolume / 1000).toFixed(1)}K`
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Crypto Volume:</span>
              <span className="font-medium text-gray-900">
                ${totalCryptoVolume > 1000000 
                  ? `${(totalCryptoVolume / 1000000).toFixed(1)}M`
                  : `${(totalCryptoVolume / 1000).toFixed(1)}K`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-purple-900">Sentiment</h3>
            <div className="text-purple-600 text-2xl">🎯</div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Overall:</span>
              <span className={`font-medium ${
                (avgStockChange + avgCryptoChange) / 2 >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(avgStockChange + avgCryptoChange) / 2 >= 0 ? 'Bullish' : 'Bearish'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Stocks:</span>
              <span className={`font-medium ${avgStockChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgStockChange >= 0 ? 'Bullish' : 'Bearish'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Crypto:</span>
              <span className={`font-medium ${avgCryptoChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgCryptoChange >= 0 ? 'Bullish' : 'Bearish'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stock Movers */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Stock Movers</h3>
          <div className="space-y-2">
            {stocks
              .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
              .slice(0, 5)
              .map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">${stock.price.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Crypto Movers */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Crypto Movers</h3>
          <div className="space-y-2">
            {crypto
              .sort((a, b) => Math.abs(b.changePercent24h) - Math.abs(a.changePercent24h))
              .slice(0, 5)
              .map((cryptoItem) => (
                <div key={cryptoItem.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{cryptoItem.name}</div>
                    <div className="text-sm text-gray-600">${cryptoItem.price.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${cryptoItem.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {cryptoItem.change24h >= 0 ? '+' : ''}{cryptoItem.changePercent24h.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {cryptoItem.change24h >= 0 ? '+' : ''}{cryptoItem.change24h.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
