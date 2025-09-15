import { NextRequest, NextResponse } from 'next/server';
import { alpacaService } from '@/libs/alpaca';
import { TechnicalIndicators } from '@/libs/indicators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || ['BTC/USD', 'ETH/USD', 'ADA/USD', 'SOL/USD', 'DOT/USD'];

    // Get crypto quotes from Alpaca
    const quotesData = await alpacaService.getCryptoQuotes(symbols);
    
    // Process the data
    const processedData = [];
    
    for (const symbol of symbols) {
      if (quotesData[symbol] && quotesData[symbol].quotes && quotesData[symbol].quotes.length > 0) {
        const quote = quotesData[symbol].quotes[0];
        
        // Create a simple signal for crypto
        const signal = {
          symbol,
          action: 'HOLD' as const,
          confidence: 50,
          reason: 'Real-time crypto data available',
          indicators: {
            rsi: 50,
            vwap: quote.ap
          },
          timestamp: new Date().toISOString()
        };
        
        const cryptoData = {
          symbol,
          name: symbol.replace('/USD', ''),
          price: quote.ap, // Ask price
          change24h: 0, // We don't have historical data
          changePercent24h: 0,
          volume24h: 0,
          marketCap: 0,
          timestamp: quote.t,
          signal
        };
        
        processedData.push(cryptoData);
      }
    }

    return NextResponse.json({
      success: true,
      data: processedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch crypto data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
