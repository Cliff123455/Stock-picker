'use client';

import { Portfolio, Position } from '../../types/trading';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

export default function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const getGainLossColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Add null checks
  if (!portfolio) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Summary</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Summary</h2>
      
      {/* Main Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            ${(portfolio.totalValue || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
        
        <div className="text-center">
          <div className={`text-3xl font-bold ${getGainLossColor(portfolio.totalGainLoss || 0)}`}>
            {(portfolio.totalGainLoss || 0) >= 0 ? '+' : ''}${(portfolio.totalGainLoss || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total P&L</div>
        </div>
        
        <div className="text-center">
          <div className={`text-3xl font-bold ${getGainLossColor(portfolio.totalGainLossPercent || 0)}`}>
            {(portfolio.totalGainLossPercent || 0) >= 0 ? '+' : ''}{(portfolio.totalGainLossPercent || 0).toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600">Total P&L %</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {(portfolio.positions || []).length}
          </div>
          <div className="text-sm text-gray-600">Positions</div>
        </div>
      </div>

      {/* Account Information */}
      {portfolio.account && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Buying Power</div>
            <div className="text-xl font-semibold text-gray-900">
              ${(portfolio.account.buyingPower || 0).toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Cash</div>
            <div className="text-xl font-semibold text-gray-900">
              ${(portfolio.account.cash || 0).toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Equity</div>
            <div className="text-xl font-semibold text-gray-900">
              ${(portfolio.account.equity || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Positions Summary */}
      {(portfolio.positions || []).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Positions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Side
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(portfolio.positions || []).map((position: Position) => (
                  <tr key={position.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {position.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        position.side === 'LONG' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {position.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(position.averagePrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(position.currentPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(position.marketValue || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className={`${getGainLossColor(position.gainLoss || 0)}`}>
                        {(position.gainLoss || 0) >= 0 ? '+' : ''}${(position.gainLoss || 0).toFixed(2)}
                      </div>
                      <div className={`text-xs ${getGainLossColor(position.gainLossPercent || 0)}`}>
                        {(position.gainLossPercent || 0) >= 0 ? '+' : ''}{(position.gainLossPercent || 0).toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
