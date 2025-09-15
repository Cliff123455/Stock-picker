'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('1D');
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);

  const timeRanges = [
    { label: '1D', value: '1D', interval: '5m', range: '1d' },
    { label: '5D', value: '5D', interval: '30m', range: '5d' },
    { label: '1M', value: '1M', interval: '1d', range: '1mo' },
    { label: '3M', value: '3M', interval: '1d', range: '3mo' },
    { label: '1Y', value: '1Y', interval: '1wk', range: '1y' },
  ];

  useEffect(() => {
    if (symbol) {
      fetchStockData();
    }
  }, [symbol, timeRange]);

  const fetchStockData = async () => {
    setLoading(true);
    const selectedRange = timeRanges.find(r => r.value === timeRange);
    
    try {
      const response = await fetch(`/api/chart/${symbol}?interval=${selectedRange.interval}&range=${selectedRange.range}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('Chart data error:', data.error);
        return;
      }
      
      setChartData(data.chartData);
      setCurrentPrice(data.currentPrice);
      setPriceChange(data.priceChange);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatXAxis = (tickItem) => {
    if (timeRange === '1D') {
      return format(new Date(tickItem), 'HH:mm');
    } else if (timeRange === '5D') {
      return format(new Date(tickItem), 'MMM dd');
    } else {
      return format(new Date(tickItem), 'MMM dd');
    }
  };

  const formatTooltip = (value) => `$${value.toFixed(2)}`;

  const isPositive = priceChange >= 0;

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* Header with Price Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{symbol}</h2>
        {currentPrice && (
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-semibold">${currentPrice.toFixed(2)}</span>
            <span className={`text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{priceChange?.toFixed(2)} ({isPositive ? '+' : ''}{((priceChange / currentPrice) * 100).toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              timeRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              stroke="#6b7280"
            />
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              stroke="#6b7280"
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy HH:mm')}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StockChart;