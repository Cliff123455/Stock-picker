import { NextRequest, NextResponse } from 'next/server';
import { alpacaService } from '@/libs/alpaca';
import { TechnicalIndicators } from '@/libs/indicators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

    // Get stock quotes from Alpaca (more reliable than bars)
    const quotesData = await alpacaService.getLatestQuotes(symbols);
    
    // Process the data
    const processedData = [];
    
    for (const symbol of symbols) {
      if (quotesData[symbol] && quotesData[symbol].quotes && quotesData[symbol].quotes.length > 0) {
        const quote = quotesData[symbol].quotes[0];
        
        // For now, create a simple signal (you can enhance this later)
        const signal = {
          symbol,
          action: 'HOLD' as const,
          confidence: 50,
          reason: 'Real-time data available',
          indicators: {
            rsi: 50,
            vwap: quote.ap
          },
          timestamp: new Date().toISOString()
        };
        
        const stockData = {
          symbol,
          name: symbol,
          price: quote.ap, // Ask price
          change: 0, // We don't have historical data for change calculation
          changePercent: 0,
          volume: 0,
          timestamp: quote.t,
          signal
        };
        
        processedData.push(stockData);
      }
    }

    return NextResponse.json({
      success: true,
      data: processedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch stock data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, qty, side, type, limit_price, stop_price } = body;

    // Validate required fields
    if (!symbol || !qty || !side || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Place order through Alpaca
    const orderData = {
      symbol,
      qty: parseInt(qty),
      side,
      type,
      time_in_force: 'day' as const,
      ...(limit_price && { limit_price: parseFloat(limit_price) }),
      ...(stop_price && { stop_price: parseFloat(stop_price) })
    };

    const order = await alpacaService.placeOrder(orderData);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to place order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
