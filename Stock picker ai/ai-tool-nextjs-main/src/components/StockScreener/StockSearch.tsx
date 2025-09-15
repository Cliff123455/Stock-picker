'use client';

import { useState } from 'react';

interface StockSearchProps {
  onStockSelect: (symbol: string) => void;
  onAddToWatchList: (symbol: string) => void;
  loading: boolean;
}

export default function StockSearch({ onStockSelect, onAddToWatchList, loading }: StockSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular stock symbols for suggestions
  const popularStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'AMD', 'INTC', 'CRM', 'ADBE', 'PYPL', 'UBER', 'SPOT', 'SQ',
    'ROKU', 'ZM', 'DOCU', 'SNOW', 'PLTR', 'CRWD', 'OKTA', 'NET'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onStockSelect(searchTerm.trim().toUpperCase());
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = popularStocks.filter(stock => 
        stock.includes(value)
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (symbol: string) => {
    setSearchTerm(symbol);
    setShowSuggestions(false);
    onStockSelect(symbol);
  };

  const handleAddToWatchList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onAddToWatchList(searchTerm.trim().toUpperCase());
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Stocks</h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Enter stock symbol (e.g., AAPL, MSFT, TSLA)"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
              {suggestions.map((symbol) => (
                <div
                  key={symbol}
                  onClick={() => handleSuggestionClick(symbol)}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-blue-900"
                >
                  <span className="font-medium">{symbol}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </div>
            ) : (
              'Analyze Stock'
            )}
          </button>
          
          <button
            type="button"
            onClick={handleAddToWatchList}
            disabled={loading || !searchTerm.trim()}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add to Watch List
          </button>
        </div>
      </form>

      {/* Popular Stocks */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Stocks</h3>
        <div className="flex flex-wrap gap-2">
          {popularStocks.slice(0, 12).map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleSuggestionClick(symbol)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
