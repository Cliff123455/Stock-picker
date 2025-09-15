import { NextRequest, NextResponse } from 'next/server';
import { alpacaService } from '@/libs/alpaca';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing bars endpoint...');
    
    // Test different endpoint variations
    const tests = [
      { name: 'getBars with limit 1', method: () => alpacaService.getBars(['AAPL'], '1Day', 1) },
      { name: 'getLatestBars', method: () => alpacaService.getLatestBars(['AAPL']) },
      { name: 'getLatestQuotes', method: () => alpacaService.getLatestQuotes(['AAPL']) }
    ];
    
    const results = {};
    
    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}`);
        const result = await test.method();
        results[test.name] = { success: true, data: result };
        console.log(`${test.name} succeeded:`, result);
      } catch (error) {
        results[test.name] = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        console.error(`${test.name} failed:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      results: results
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
