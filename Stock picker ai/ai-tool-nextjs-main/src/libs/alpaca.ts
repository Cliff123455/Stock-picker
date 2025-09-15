import { StockData, CryptoData } from '@/types/trading';

export class AlpacaService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ALPACA_API_KEY || '';
    this.secretKey = process.env.ALPACA_SECRET_KEY || '';
    // Remove trailing /v2 if it exists to avoid double /v2/v2 in URLs
    const baseUrl = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
    this.baseUrl = baseUrl.endsWith('/v2') ? baseUrl.slice(0, -3) : baseUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.secretKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(`Making request to: ${url}`);
    console.log(`API Key prefix: ${this.apiKey.substring(0, 10)}...`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Alpaca API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async getAccount() {
    return this.makeRequest('/v2/account');
  }

  async getPositions() {
    return this.makeRequest('/v2/positions');
  }

  async getOrders() {
    return this.makeRequest('/v2/orders');
  }

  async getBars(symbols: string[], timeframe: string = '1Day', limit: number = 100) {
    const symbolsParam = symbols.join(',');
    return this.makeRequest(`/v2/stocks/bars?symbols=${symbolsParam}&timeframe=${timeframe}&limit=${limit}`);
  }

  async getLatestBars(symbols: string[]) {
    const symbolsParam = symbols.join(',');
    return this.makeRequest(`/v2/stocks/bars?symbols=${symbolsParam}&timeframe=1Day&limit=1`);
  }

  async getLatestQuotes(symbols: string[]) {
    const symbolsParam = symbols.join(',');
    return this.makeRequest(`/v2/stocks/quotes/latest?symbols=${symbolsParam}`);
  }

  async getQuotes(symbols: string[]) {
    const symbolsParam = symbols.join(',');
    return this.makeRequest(`/v2/stocks/quotes/latest?symbols=${symbolsParam}`);
  }

  async getTrades(symbols: string[]) {
    const symbolsParam = symbols.join(',');
    return this.makeRequest(`/v2/stocks/trades/latest?symbols=${symbolsParam}`);
  }

  async getAssets(status: string = 'active') {
    return this.makeRequest(`/v2/assets?status=${status}`);
  }

  async getCryptoBars(symbols: string[], timeframe: string = '1Day', limit: number = 100) {
    const symbolsParam = symbols.join(',');
    return this.makeRequest(`/v1beta1/crypto/bars?symbols=${symbolsParam}&timeframe=${timeframe}&limit=${limit}`);
  }

  async getCryptoQuotes(symbols: string[]) {
    const symbolsParam = symbols.join(',');
    return this.makeRequest(`/v1beta1/crypto/quotes/latest?symbols=${symbolsParam}`);
  }

  async placeOrder(orderData: {
    symbol: string;
    qty: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
    limit_price?: number;
    stop_price?: number;
  }) {
    return this.makeRequest('/v2/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(orderId: string) {
    return this.makeRequest(`/v2/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async getOrder(orderId: string) {
    return this.makeRequest(`/v2/orders/${orderId}`);
  }

  // Helper method to format stock data
  formatStockData(alpacaData: any): StockData {
    return {
      symbol: alpacaData.symbol,
      name: alpacaData.symbol, // Alpaca doesn't provide company names in basic data
      price: alpacaData.close,
      change: alpacaData.close - alpacaData.open,
      changePercent: ((alpacaData.close - alpacaData.open) / alpacaData.open) * 100,
      volume: alpacaData.volume,
      timestamp: alpacaData.timestamp,
    };
  }

  // Helper method to format crypto data
  formatCryptoData(alpacaData: any): CryptoData {
    return {
      symbol: alpacaData.symbol,
      name: alpacaData.symbol,
      price: alpacaData.close,
      change24h: alpacaData.close - alpacaData.open,
      changePercent24h: ((alpacaData.close - alpacaData.open) / alpacaData.open) * 100,
      volume24h: alpacaData.volume,
      marketCap: 0, // Alpaca doesn't provide market cap
      timestamp: alpacaData.timestamp,
    };
  }
}

export const alpacaService = new AlpacaService();
