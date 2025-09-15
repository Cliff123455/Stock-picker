import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const baseUrl = process.env.ALPACA_BASE_URL;
    
    // Check if environment variables are loaded
    const envCheck = {
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
      secretKey: secretKey ? `${secretKey.substring(0, 10)}...` : 'NOT SET',
      baseUrl: baseUrl || 'NOT SET',
      apiKeyPrefix: apiKey ? apiKey.substring(0, 7) : 'N/A'
    };
    
    // Test a simple API call
    let apiTest = null;
    if (apiKey && secretKey && baseUrl) {
      try {
        const response = await fetch(`${baseUrl}/v2/account`, {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
            'Content-Type': 'application/json'
          }
        });
        
        apiTest = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        };
        
        if (response.ok) {
          const data = await response.json();
          apiTest.data = {
            id: data.id,
            status: data.status,
            account_type: data.account_type
          };
        } else {
          const errorText = await response.text();
          apiTest.error = errorText;
        }
      } catch (error) {
        apiTest = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      apiTest: apiTest,
      recommendations: [
        apiKey && !apiKey.startsWith('PKTEST_') && !apiKey.startsWith('PKLIVE_') 
          ? '⚠️ API key format might be incorrect (should start with PKTEST_ or PKLIVE_)'
          : null,
        !apiKey ? '❌ ALPACA_API_KEY is not set' : null,
        !secretKey ? '❌ ALPACA_SECRET_KEY is not set' : null,
        !baseUrl ? '❌ ALPACA_BASE_URL is not set' : null,
        apiTest && apiTest.status === 401 ? '❌ 401 Unauthorized - Check API key permissions in Alpaca dashboard' : null,
        apiTest && apiTest.status === 403 ? '❌ 403 Forbidden - API key might not have market data access' : null
      ].filter(Boolean)
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
