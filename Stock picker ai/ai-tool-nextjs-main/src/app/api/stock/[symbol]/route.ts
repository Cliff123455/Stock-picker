import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Get real-time quote
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    
    return NextResponse.json({
      symbol,
      c: data.c, // Current price
      d: data.d, // Change
      dp: data.dp, // Percent change
      h: data.h, // High price of the day
      l: data.l, // Low price of the day
      o: data.o, // Open price of the day
      pc: data.pc, // Previous close price
      t: data.t, // Timestamp
    });

  } catch (error) {
    console.error('Stock API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
