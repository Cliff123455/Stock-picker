import { NextRequest, NextResponse } from 'next/server';
import { alpacaService } from '@/libs/alpaca';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing simple endpoints...');
    
    // Test account endpoint (we know this works)
    const account = await alpacaService.getAccount();
    console.log('Account test successful');
    
    // Test assets endpoint
    let assets = null;
    try {
      assets = await alpacaService.getAssets();
      console.log('Assets test successful');
    } catch (error) {
      console.log('Assets test failed:', error);
    }
    
    // Test a direct fetch to see what's happening
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const baseUrl = 'https://paper-api.alpaca.markets';
    
    let directTest = null;
    try {
      const response = await fetch(`${baseUrl}/v2/stocks/bars?symbols=AAPL&timeframe=1Day&limit=1`, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
          'Content-Type': 'application/json'
        }
      });
      
      directTest = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      };
      
      if (!response.ok) {
        const errorText = await response.text();
        directTest.error = errorText;
      } else {
        const data = await response.json();
        directTest.data = data;
      }
    } catch (error) {
      directTest = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        status: account.status
      },
      assets: assets ? { count: assets.length } : 'Failed',
      directTest: directTest
    });

  } catch (error) {
    console.error('Test failed:', error);
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
