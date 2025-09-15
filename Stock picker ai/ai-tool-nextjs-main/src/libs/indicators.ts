import { TechnicalIndicator, TradingSignal } from '@/types/trading';

export class TechnicalIndicators {
  // Simple Moving Average
  static sma(prices: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  // Exponential Moving Average
  static ema(prices: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(firstSMA);
    
    for (let i = period; i < prices.length; i++) {
      const ema = (prices[i] * multiplier) + (result[result.length - 1] * (1 - multiplier));
      result.push(ema);
    }
    
    return result;
  }

  // Relative Strength Index
  static rsi(prices: number[], period: number = 14): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    // Calculate RSI
    for (let i = period; i < gains.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push(rsi);
    }
    
    return result;
  }

  // MACD (Moving Average Convergence Divergence)
  static macd(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const fastEMA = this.ema(prices, fastPeriod);
    const slowEMA = this.ema(prices, slowPeriod);
    
    // Calculate MACD line
    const macdLine: number[] = [];
    const startIndex = slowPeriod - fastPeriod;
    
    for (let i = 0; i < fastEMA.length - startIndex; i++) {
      macdLine.push(fastEMA[i + startIndex] - slowEMA[i]);
    }
    
    // Calculate signal line
    const signalLine = this.ema(macdLine, signalPeriod);
    
    // Calculate histogram
    const histogram: number[] = [];
    const signalStartIndex = signalPeriod - 1;
    
    for (let i = 0; i < macdLine.length - signalStartIndex; i++) {
      histogram.push(macdLine[i + signalStartIndex] - signalLine[i]);
    }
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }

  // Bollinger Bands
  static bollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.sma(prices, period);
    const result: { upper: number[]; middle: number[]; lower: number[] } = {
      upper: [],
      middle: [],
      lower: []
    };
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      result.upper.push(mean + (stdDev * standardDeviation));
      result.middle.push(mean);
      result.lower.push(mean - (stdDev * standardDeviation));
    }
    
    return result;
  }

  // Stochastic Oscillator
  static stochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3) {
    const kValues: number[] = [];
    
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highSlice = highs.slice(i - kPeriod + 1, i + 1);
      const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
      const currentClose = closes[i];
      
      const highestHigh = Math.max(...highSlice);
      const lowestLow = Math.min(...lowSlice);
      
      const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
    }
    
    const dValues = this.sma(kValues, dPeriod);
    
    return {
      k: kValues,
      d: dValues
    };
  }

  // VWAP (Volume Weighted Average Price)
  static vwap(highs: number[], lows: number[], closes: number[], volumes: number[]): number[] {
    const result: number[] = [];
    let cumulativeVolumePrice = 0;
    let cumulativeVolume = 0;
    
    for (let i = 0; i < closes.length; i++) {
      const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
      const volumePrice = typicalPrice * volumes[i];
      
      cumulativeVolumePrice += volumePrice;
      cumulativeVolume += volumes[i];
      
      if (cumulativeVolume > 0) {
        result.push(cumulativeVolumePrice / cumulativeVolume);
      } else {
        result.push(typicalPrice);
      }
    }
    
    return result;
  }

  // Generate trading signals based on indicators
  static generateSignals(
    symbol: string,
    prices: number[],
    highs: number[],
    lows: number[],
    volumes: number[]
  ): TradingSignal {
    const rsi = this.rsi(prices);
    const macd = this.macd(prices, 12, 26, 9); // Standard MACD: 12, 26, 9
    const bollinger = this.bollingerBands(prices);
    const sma20 = this.sma(prices, 20);
    const sma50 = this.sma(prices, 50);
    const sma200 = this.sma(prices, 200);
    const vwap = this.vwap(highs, lows, prices, volumes);
    
    const currentPrice = prices[prices.length - 1];
    const currentRSI = rsi[rsi.length - 1];
    const currentMACD = macd.macd[macd.macd.length - 1];
    const currentSignal = macd.signal[macd.signal.length - 1];
    const currentHistogram = macd.histogram[macd.histogram.length - 1];
    
    const upperBand = bollinger.upper[bollinger.upper.length - 1];
    const lowerBand = bollinger.lower[bollinger.lower.length - 1];
    const middleBand = bollinger.middle[bollinger.middle.length - 1];
    
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    const currentSMA200 = sma200[sma200.length - 1];
    const currentVWAP = vwap[vwap.length - 1];
    
    let action: 'BUY' | 'SELL' | 'SHORT' | 'HOLD' = 'HOLD';
    let confidence = 0;
    let reason = '';
    
    // RSI Analysis (30-70 range as requested)
    if (currentRSI < 30) {
      confidence += 25;
      reason += 'RSI oversold (<30). ';
    } else if (currentRSI > 70) {
      confidence += 25;
      reason += 'RSI overbought (>70). ';
    } else if (currentRSI < 40) {
      confidence += 10;
      reason += 'RSI approaching oversold. ';
    } else if (currentRSI > 60) {
      confidence += 10;
      reason += 'RSI approaching overbought. ';
    }
    
    // MACD Analysis (12, 26, 9 as requested)
    if (currentMACD > currentSignal && currentHistogram > 0) {
      confidence += 20;
      reason += 'MACD bullish crossover (12,26,9). ';
    } else if (currentMACD < currentSignal && currentHistogram < 0) {
      confidence += 20;
      reason += 'MACD bearish crossover (12,26,9). ';
    }
    
    // Bollinger Bands Analysis
    if (currentPrice < lowerBand) {
      confidence += 20;
      reason += 'Price below lower Bollinger Band. ';
    } else if (currentPrice > upperBand) {
      confidence += 20;
      reason += 'Price above upper Bollinger Band. ';
    } else if (currentPrice < middleBand) {
      confidence += 5;
      reason += 'Price below Bollinger middle. ';
    } else if (currentPrice > middleBand) {
      confidence += 5;
      reason += 'Price above Bollinger middle. ';
    }
    
    // VWAP Analysis (NEW - as requested)
    if (currentPrice > currentVWAP) {
      confidence += 15;
      reason += 'Price above VWAP (bullish). ';
    } else if (currentPrice < currentVWAP) {
      confidence += 15;
      reason += 'Price below VWAP (bearish). ';
    }
    
    // Moving Average Analysis
    if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50 && currentSMA50 > currentSMA200) {
      confidence += 20;
      reason += 'Strong uptrend with moving averages aligned. ';
    } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50 && currentSMA50 < currentSMA200) {
      confidence += 20;
      reason += 'Strong downtrend with moving averages aligned. ';
    } else if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
      confidence += 10;
      reason += 'Price above key moving averages. ';
    } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
      confidence += 10;
      reason += 'Price below key moving averages. ';
    }
    
    // Volume Analysis
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volumes[volumes.length - 1];
    if (currentVolume > avgVolume * 1.5) {
      confidence += 10;
      reason += 'High volume confirmation. ';
    } else if (currentVolume > avgVolume * 1.2) {
      confidence += 5;
      reason += 'Above average volume. ';
    }
    
    // Determine action based on confidence and indicators
    if (confidence >= 70) {
      // Strong buy signal
      if (currentRSI < 30 && currentPrice < lowerBand && currentMACD > currentSignal && currentPrice > currentVWAP) {
        action = 'BUY';
      }
      // Strong sell signal
      else if (currentRSI > 70 && currentPrice > upperBand && currentMACD < currentSignal && currentPrice < currentVWAP) {
        action = 'SELL';
      }
      // Strong short signal
      else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50 && currentPrice < currentVWAP && currentRSI > 50) {
        action = 'SHORT';
      }
    } else if (confidence >= 50) {
      // Moderate signals
      if (currentRSI < 35 && currentPrice < currentVWAP && currentMACD > currentSignal) {
        action = 'BUY';
      } else if (currentRSI > 65 && currentPrice > currentVWAP && currentMACD < currentSignal) {
        action = 'SELL';
      }
    }
    
    return {
      symbol,
      action,
      confidence: Math.min(confidence, 100),
      reason: reason || 'No clear signal detected.',
      indicators: {
        rsi: currentRSI,
        macd: {
          macd: currentMACD,
          signal: currentSignal,
          histogram: currentHistogram
        },
        bollingerBands: {
          upper: upperBand,
          middle: middleBand,
          lower: lowerBand
        },
        movingAverages: {
          sma20: currentSMA20,
          sma50: currentSMA50,
          sma200: currentSMA200
        },
        vwap: currentVWAP
      },
      timestamp: new Date().toISOString()
    };
  }
}
