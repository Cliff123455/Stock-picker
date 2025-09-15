'use client';

import { useState, useEffect } from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line } from 'recharts';
import { format } from 'date-fns';

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('1D');
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState('none');

  const timeRanges = [
    { label: '1D', value: '1D', interval: '5m', range: '1d' },
    { label: '5D', value: '5D', interval: '30m', range: '5d' },
    { label: '1M', value: '1M', interval: '1d', range: '1mo' },
    { label: '3M', value: '3M', interval: '1d', range: '3mo' },
    { label: '1Y', value: '1Y', interval: '1wk', range: '1y' },
  ];

  const technicalStudies = [
    { label: 'None', value: 'none' },
    { label: 'RSI (14)', value: 'rsi' },
    { label: 'MACD', value: 'macd' },
    { label: 'SMA (20)', value: 'sma20' },
    { label: 'EMA (12)', value: 'ema12' },
    { label: 'Bollinger Bands', value: 'bollinger' },
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

  const formatTooltip = (value, name) => {
    if (name === 'volume') {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
  };

  const isPositive = priceChange >= 0;

  // Technical Indicator Calculations
  const calculateSMA = (data, period) => {
    return data.map((_, index) => {
      if (index < period - 1) return null;
      const slice = data.slice(index - period + 1, index + 1);
      const sum = slice.reduce((acc, item) => acc + item.close, 0);
      return sum / period;
    });
  };

  const calculateEMA = (data, period) => {
    const multiplier = 2 / (period + 1);
    return data.map((item, index) => {
      if (index === 0) return item.close;
      if (index === 1) return (item.close + data[0].close) / 2;
      return (item.close * multiplier) + (data[index - 1].ema * (1 - multiplier));
    });
  };

  const calculateRSI = (data, period = 14) => {
    return data.map((_, index) => {
      if (index < period) return null;
      
      const slice = data.slice(index - period + 1, index + 1);
      let gains = 0;
      let losses = 0;
      
      for (let i = 1; i < slice.length; i++) {
        const change = slice[i].close - slice[i - 1].close;
        if (change > 0) gains += change;
        else losses += Math.abs(change);
      }
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    });
  };

  const calculateMACD = (data) => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    
    return data.map((_, index) => {
      if (ema12[index] === null || ema26[index] === null) return null;
      return ema12[index] - ema26[index];
    });
  };

  const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
    const sma = calculateSMA(data, period);
    
    return data.map((_, index) => {
      if (index < period - 1) return { upper: null, middle: null, lower: null };
      
      const slice = data.slice(index - period + 1, index + 1);
      const mean = sma[index];
      const variance = slice.reduce((acc, item) => acc + Math.pow(item.close - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      return {
        upper: mean + (stdDev * standardDeviation),
        middle: mean,
        lower: mean - (stdDev * standardDeviation)
      };
    });
  };

  // Calculate technical indicators
  const enhancedChartData = chartData.map((item, index) => {
    const sma20 = calculateSMA(chartData, 20)[index];
    const ema12 = calculateEMA(chartData, 12)[index];
    const rsi = calculateRSI(chartData, 14)[index];
    const macd = calculateMACD(chartData)[index];
    const bollinger = calculateBollingerBands(chartData, 20, 2)[index];
    
    return {
      ...item,
      sma20,
      ema12,
      rsi,
      macd,
      bollingerUpper: bollinger?.upper,
      bollingerMiddle: bollinger?.middle,
      bollingerLower: bollinger?.lower
    };
  });

  // Custom Candlestick Component
  const Candlestick = (props) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const { open, high, low, close } = payload;
    const isGreen = close >= open;
    const color = isGreen ? '#10b981' : '#ef4444';
    
    // Calculate positions relative to the chart's Y scale
    const yScale = (value) => y + height - ((value - Math.min(...chartData.map(d => d.low))) / (Math.max(...chartData.map(d => d.high)) - Math.min(...chartData.map(d => d.low)))) * height;
    
    const highY = yScale(high);
    const lowY = yScale(low);
    const openY = yScale(open);
    const closeY = yScale(close);
    
    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
    
    return (
      <g>
        {/* Wick (high-low line) */}
        <line
          x1={x + width / 2}
          y1={highY}
          x2={x + width / 2}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body (open-close rectangle) */}
        <rect
          x={x + width * 0.2}
          y={bodyTop}
          width={width * 0.6}
          height={bodyHeight}
          fill={isGreen ? color : 'transparent'}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  // Custom Volume Bar Component with colors
  const VolumeBar = (props) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const { volume, close, open } = payload;
    const isGreen = close >= open;
    const color = isGreen ? '#10b981' : '#ef4444';
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        opacity={0.6}
      />
    );
  };

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

      {/* Time Range Selector and Technical Studies */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
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
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Studies:</label>
          <select
            value={selectedStudy}
            onChange={(e) => setSelectedStudy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {technicalStudies.map((study) => (
              <option key={study.value} value={study.value}>
                {study.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Candlestick Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={enhancedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold">{format(new Date(label), 'MMM dd, yyyy HH:mm')}</p>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Open:</span> ${data.open.toFixed(2)}</p>
                            <p><span className="font-medium">High:</span> ${data.high.toFixed(2)}</p>
                            <p><span className="font-medium">Low:</span> ${data.low.toFixed(2)}</p>
                            <p><span className="font-medium">Close:</span> ${data.close.toFixed(2)}</p>
                            <p><span className="font-medium">Volume:</span> {(data.volume / 1000000).toFixed(2)}M</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="close" 
                  shape={<Candlestick />}
                  fill="#8884d8"
                />
                
                {/* Technical Indicators */}
                {selectedStudy === 'sma20' && (
                  <Line 
                    type="monotone" 
                    dataKey="sma20" 
                    stroke="#ff6b6b" 
                    strokeWidth={2}
                    dot={false}
                    name="SMA 20"
                  />
                )}
                {selectedStudy === 'ema12' && (
                  <Line 
                    type="monotone" 
                    dataKey="ema12" 
                    stroke="#4ecdc4" 
                    strokeWidth={2}
                    dot={false}
                    name="EMA 12"
                  />
                )}
                {selectedStudy === 'bollinger' && (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="bollingerUpper" 
                      stroke="#8b5cf6" 
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="5 5"
                      name="BB Upper"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bollingerMiddle" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                      name="BB Middle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bollingerLower" 
                      stroke="#8b5cf6" 
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="5 5"
                      name="BB Lower"
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Technical Studies Chart (RSI/MACD) */}
          {(selectedStudy === 'rsi' || selectedStudy === 'macd') && (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={enhancedChartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxis}
                    stroke="#6b7280"
                    hide
                  />
                  <YAxis 
                    domain={selectedStudy === 'rsi' ? [0, 100] : ['dataMin', 'dataMax']}
                    tickFormatter={(value) => selectedStudy === 'rsi' ? `${value}` : `${value.toFixed(2)}`}
                    stroke="#6b7280"
                  />
                  {selectedStudy === 'rsi' && (
                    <>
                      <Line 
                        type="monotone" 
                        dataKey="rsi" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={false}
                        name="RSI"
                      />
                      <Line 
                        type="monotone" 
                        dataKey={() => 70} 
                        stroke="#ef4444" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Overbought"
                      />
                      <Line 
                        type="monotone" 
                        dataKey={() => 30} 
                        stroke="#10b981" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Oversold"
                      />
                    </>
                  )}
                  {selectedStudy === 'macd' && (
                    <Line 
                      type="monotone" 
                      dataKey="macd" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                      name="MACD"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Volume Chart */}
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={enhancedChartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  stroke="#6b7280"
                  hide
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  stroke="#6b7280"
                />
                <Bar 
                  dataKey="volume" 
                  shape={<VolumeBar />}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockChart;