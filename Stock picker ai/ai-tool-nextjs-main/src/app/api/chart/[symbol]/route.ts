import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const { searchParams } = new URL(request.url);
  const interval = searchParams.get('interval') || '1d';
  const range = searchParams.get('range') || '1d';

  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    );
  }

  try {
    // For Finnhub, we'll use candle data
    const now = Math.floor(Date.now() / 1000);
    let from = now;
    
    // Calculate 'from' timestamp based on range
    switch(range) {
      case '1d':
        from = now - 86400;
        break;
      case '5d':
        from = now - (5 * 86400);
        break;
      case '1mo':
        from = now - (30 * 86400);
        break;
      case '3mo':
        from = now - (90 * 86400);
        break;
      case '1y':
        from = now - (365 * 86400);
        break;
      default:
        from = now - 86400;
    }

    // Convert interval format for Finnhub
    let resolution = 'D'; // Default to daily
    switch(interval) {
      case '5m':
        resolution = '5';
        break;
      case '30m':
        resolution = '30';
        break;
      case '1d':
        resolution = 'D';
        break;
      case '1wk':
        resolution = 'W';
        break;
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chart data');
    }

    const data = await response.json();

    if (data.s === 'no_data') {
      throw new Error('No data available for this symbol');
    }

    // Format data for candlestick chart with OHLC data
    const chartData = data.t.map((timestamp: number, index: number) => ({
      timestamp: timestamp * 1000, // Convert to milliseconds
      open: data.o[index], // opening price
      high: data.h[index], // high price
      low: data.l[index],  // low price
      close: data.c[index], // closing price
      volume: data.v ? data.v[index] : 0 // volume
    }));

    const currentPrice = data.c[data.c.length - 1];
    const previousPrice = data.c[0];
    const priceChange = currentPrice - previousPrice;

    return NextResponse.json({
      chartData,
      currentPrice,
      priceChange,
      previousClose: previousPrice,
      marketState: 'REGULAR'
    });

  } catch (error) {
    console.error('Chart API Error:', error);
    
    // Return mock data for development
    const mockData = generateMockData(range);
    return NextResponse.json(mockData);
  }
}

// Mock data generator for testing
function generateMockData(range: string) {
  const now = Date.now();
  const dataPoints = range === '1d' ? 78 : range === '5d' ? 195 : 30;
  const basePrice = 150;
  
  const chartData = Array.from({ length: dataPoints }, (_, i) => {
    const basePriceForPeriod = basePrice + (i * 0.1);
    const volatility = 2 + Math.random() * 3; // Random volatility between 2-5
    
    // Generate realistic OHLC data
    const open = basePriceForPeriod + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    return {
      timestamp: now - (dataPoints - i) * (range === '1d' ? 300000 : 86400000),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000
    };
  });

  return {
    chartData,
    currentPrice: chartData[chartData.length - 1].close,
    priceChange: 2.45,
    previousClose: 147.55,
    marketState: 'REGULAR'
  };
}
