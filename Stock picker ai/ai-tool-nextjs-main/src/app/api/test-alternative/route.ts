import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const baseUrl = 'https://paper-api.alpaca.markets';
    
    // Test different possible endpoints
    const endpoints = [
      '/v2/stocks/bars',
      '/v2/stocks/quotes',
      '/v2/stocks/trades',
      '/v2/market-data/stocks/bars',
      '/v2/market-data/stocks/quotes',
      '/v1/stocks/bars',
      '/v1/stocks/quotes'
    ];
    
    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        const url = `${baseUrl}${endpoint}?symbols=AAPL&timeframe=1Day&limit=1`;
        const response = await fetch(url, {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
            'Content-Type': 'application/json'
          }
        });
        
        results[endpoint] = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        };
        
        if (!response.ok) {
          const errorText = await response.text();
          results[endpoint].error = errorText;
        }
        
      } catch (error) {
        results[endpoint] = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      results: results
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
