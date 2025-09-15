'use client';

import { useState } from 'react';

interface BulkTextInputProps {
  onStocksAdded: (stocks: string[]) => void;
  onClose: () => void;
}

export default function BulkTextInput({ onStocksAdded, onClose }: BulkTextInputProps) {
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Parse the input - support various formats
      const stocks = parseTextInput(textInput);
      
      if (stocks.length === 0) {
        throw new Error('No valid stock symbols found');
      }

      if (stocks.length > 50) {
        throw new Error('Maximum 50 stocks allowed per import');
      }

      onStocksAdded(stocks);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse stock symbols');
    }
  };

  const parseTextInput = (input: string): string[] => {
    // Remove extra whitespace and split by various delimiters
    const cleaned = input.trim().replace(/\s+/g, ' ');
    const stocks: string[] = [];
    
    // Split by common delimiters: comma, space, newline, semicolon, pipe
    const symbols = cleaned.split(/[,;\s\n|]+/).map(s => s.trim().toUpperCase());
    
    for (const symbol of symbols) {
      // Validate stock symbol (1-5 characters, letters only)
      if (symbol && /^[A-Z]{1,5}$/.test(symbol)) {
        stocks.push(symbol);
      }
    }
    
    return [...new Set(stocks)]; // Remove duplicates
  };

  const getPreview = () => {
    if (!textInput.trim()) return [];
    try {
      return parseTextInput(textInput);
    } catch {
      return [];
    }
  };

  const preview = getPreview();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Add Stocks</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Symbols
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter stock symbols separated by commas, spaces, or new lines:&#10;AAPL, MSFT, GOOGL&#10;TSLA AMZN META&#10;NVDA NFLX AMD"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
              />
            </div>

            {preview.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Preview ({preview.length} stocks):
                </h3>
                <div className="flex flex-wrap gap-1">
                  {preview.slice(0, 20).map((symbol) => (
                    <span
                      key={symbol}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {symbol}
                    </span>
                  ))}
                  {preview.length > 20 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{preview.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={preview.length === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {preview.length} Stocks
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-4 text-xs text-gray-500">
            <p><strong>Supported formats:</strong></p>
            <p>• Comma separated: AAPL, MSFT, GOOGL</p>
            <p>• Space separated: AAPL MSFT GOOGL</p>
            <p>• New lines: AAPL<br/>MSFT<br/>GOOGL</p>
            <p>• Mixed: AAPL, MSFT GOOGL; TSLA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
