import { NextResponse } from 'next/server';

export async function GET() {
  const alpacaApiKey = process.env.ALPACA_API_KEY;
  const alpacaSecretKey = process.env.ALPACA_SECRET_KEY;
  const finnhubApiKey = process.env.FINNHUB_API_KEY;
  const finnhubPublicApiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

  const hasAlpacaKeys = !!(alpacaApiKey && alpacaSecretKey);
  const hasFinnhubKeys = !!(finnhubApiKey && finnhubPublicApiKey);

  return NextResponse.json({
    alpaca: {
      configured: hasAlpacaKeys,
      hasApiKey: !!alpacaApiKey,
      hasSecretKey: !!alpacaSecretKey,
      apiKeyLength: alpacaApiKey ? alpacaApiKey.length : 0
    },
    finnhub: {
      configured: hasFinnhubKeys,
      hasApiKey: !!finnhubApiKey,
      hasPublicApiKey: !!finnhubPublicApiKey,
      apiKeyLength: finnhubApiKey ? finnhubApiKey.length : 0
    },
    overall: {
      hasAnyKeys: hasAlpacaKeys || hasFinnhubKeys,
      hasAllKeys: hasAlpacaKeys && hasFinnhubKeys
    }
  });
}
