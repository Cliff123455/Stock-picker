import { NextRequest, NextResponse } from 'next/server';
import { alpacaService } from '@/libs/alpaca';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    
    if (!symbolsParam) {
      return NextResponse.json(
        { success: false, error: 'Symbols parameter is required' },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(',');
    console.log(`Fetching watchlist data for: ${symbols.join(', ')}`);

    const latestBars = await alpacaService.getLatestBars(symbols);
    const stockData = [];

    for (const symbol of symbols) {
      if (latestBars[symbol]) {
        const bar = latestBars[symbol];
        const change = bar.c - bar.o;
        const changePercent = (change / bar.o) * 100;
        
        // Determine signal based on price change
        let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        if (changePercent > 2) signal = 'BULLISH';
        else if (changePercent < -2) signal = 'BEARISH';

        stockData.push({
          symbol: symbol,
          name: symbol,
          price: bar.c,
          change: change,
          changePercent: changePercent,
          volume: bar.v,
          timestamp: bar.t,
          signal: signal
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: stockData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching watchlist data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch watchlist data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
