import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  const publicApiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

  return NextResponse.json({
    hasApiKey: !!apiKey,
    hasPublicApiKey: !!publicApiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    publicApiKeyLength: publicApiKey ? publicApiKey.length : 0,
    message: apiKey ? 'Finnhub API key is configured' : 'Finnhub API key is missing'
  });
}
