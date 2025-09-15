'use client';

import { useState, useRef } from 'react';

interface CSVUploadProps {
  onStocksImported: (stocks: string[]) => void;
  onClose: () => void;
}

export default function CSVUpload({ onStocksImported, onClose }: CSVUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      // Read file content
      const text = await file.text();
      const stocks = parseCSV(text);
      
      if (stocks.length === 0) {
        throw new Error('No valid stock symbols found in CSV file');
      }

      onStocksImported(stocks);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvText: string): string[] => {
    const lines = csvText.split('\n');
    const stocks: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Split by comma and get first column (assuming stock symbol is in first column)
      const columns = trimmedLine.split(',').map(col => col.trim().replace(/['"]/g, ''));
      const symbol = columns[0].toUpperCase();
      
      // Validate stock symbol (basic validation - 1-5 characters, letters only)
      if (symbol && /^[A-Z]{1,5}$/.test(symbol)) {
        stocks.push(symbol);
      }
    }
    
    return [...new Set(stocks)]; // Remove duplicates
  };

  const downloadTemplate = () => {
    const csvContent = `Symbol,Company Name
AAPL,Apple Inc.
MSFT,Microsoft Corporation
GOOGL,Alphabet Inc.
AMZN,Amazon.com Inc.
TSLA,Tesla Inc.
META,Meta Platforms Inc.
NVDA,NVIDIA Corporation
NFLX,Netflix Inc.`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock_watchlist_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Import Stock List</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with stock symbols. The first column should contain the stock symbols (e.g., AAPL, MSFT, TSLA).
            </p>
            
            <button
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
            >
              📥 Download CSV Template
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file with stock symbols</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Choose File'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p><strong>CSV Format:</strong></p>
            <p>• First column: Stock symbols (AAPL, MSFT, etc.)</p>
            <p>• Additional columns are ignored</p>
            <p>• Maximum 100 stocks per upload</p>
          </div>
        </div>
      </div>
    </div>
  );
}
