import { NextRequest, NextResponse } from 'next/server';
import { alpacaService } from '@/libs/alpaca';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Alpaca API connection...');
    
    // Test 1: Get account info (most basic endpoint)
    console.log('Testing account endpoint...');
    const account = await alpacaService.getAccount();
    console.log('Account test successful:', account);
    
    // Test 2: Get latest bars for a single stock
    console.log('Testing latest bars endpoint...');
    const bars = await alpacaService.getLatestBars(['AAPL']);
    console.log('Bars test successful:', bars);
    
    // Test 3: Get historical bars
    console.log('Testing historical bars endpoint...');
    const historicalBars = await alpacaService.getBars(['AAPL'], '1Day', 5);
    console.log('Historical bars test successful:', historicalBars);
    
    return NextResponse.json({
      success: true,
      message: 'All Alpaca API tests passed!',
      data: {
        account: {
          id: account.id,
          status: account.status,
          buying_power: account.buying_power
        },
        latestBars: bars,
        historicalBars: historicalBars
      }
    });

  } catch (error) {
    console.error('Alpaca API test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Alpaca API test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
