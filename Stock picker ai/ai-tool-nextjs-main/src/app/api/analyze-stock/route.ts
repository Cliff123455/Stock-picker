import { NextRequest, NextResponse } from 'next/server';
import { alpacaService } from '@/libs/alpaca';
import { TechnicalIndicators } from '@/libs/indicators';
import { StockData, TradingSignal } from '@/types/trading';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    console.log(`Analyzing stock: ${symbol}`);

    // Check if Alpaca API keys are configured
    const hasAlpacaKeys = process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY;
    
    if (!hasAlpacaKeys) {
      return NextResponse.json({
        success: false,
        error: 'Alpaca API keys not configured',
        message: 'Please configure your Alpaca API keys to use stock analysis features'
      }, { status: 503 });
    }

    // Get historical data for technical analysis
    const bars = await alpacaService.getBars([symbol], '1Day', 200);
    const latestBars = await alpacaService.getLatestBars([symbol]);
    
    if (!bars[symbol] || bars[symbol].length === 0) {
      throw new Error('No historical data available for this symbol');
    }

    const stockBars = bars[symbol];
    const latestBar = latestBars[symbol];

    // Extract price data
    const closes = stockBars.map((bar: any) => bar.c);
    const highs = stockBars.map((bar: any) => bar.h);
    const lows = stockBars.map((bar: any) => bar.l);
    const volumes = stockBars.map((bar: any) => bar.v);

    // Generate technical analysis
    const analysis = TechnicalIndicators.generateSignals(
      symbol,
      closes,
      highs,
      lows,
      volumes
    );

    // Create stock data object
    const stockData: StockData = {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(), // You might want to fetch company name from another API
      price: latestBar.c,
      change: latestBar.c - latestBar.o,
      changePercent: ((latestBar.c - latestBar.o) / latestBar.o) * 100,
      volume: latestBar.v,
      timestamp: latestBar.t
    };

    return NextResponse.json({
      success: true,
      data: {
        stock: stockData,
        analysis: analysis
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing stock:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze stock',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
