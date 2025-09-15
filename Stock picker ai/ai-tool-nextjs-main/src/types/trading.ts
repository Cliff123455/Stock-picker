export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: string;
}

export interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: string;
}

export interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'SHORT' | 'HOLD';
  confidence: number; // 0-100
  reason: string;
  indicators: {
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bollingerBands?: {
      upper: number;
      middle: number;
      lower: number;
    };
    movingAverages?: {
      sma20: number;
      sma50: number;
      sma200: number;
    };
    vwap?: number;
  };
  priceTarget?: number;
  stopLoss?: number;
  timestamp: string;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  description: string;
}

export interface MarketAnalysis {
  overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  marketTrend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: TradingSignal[];
  timestamp: string;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  positions: Position[];
  account?: {
    buyingPower: number;
    cash: number;
    equity: number;
    dayTradingBuyingPower: number;
    patternDayTrader: boolean;
    portfolioValue: number;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  side: 'LONG' | 'SHORT';
}
