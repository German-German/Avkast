/**
 * Market Data Service
 * Provides real-time and simulated market data for stocks and commodities.
 */

export interface MarketData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

const STOCK_LIST = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "META", "V", "JPM", "XOM", "WMT", "BRK", "ASML", "NEE"];
const COMMODITY_LIST = ["GLD", "SLV", "USO", "UNG", "CPER"];

const CACHED_PRICES: Record<string, MarketData> = {};

// Initial prices inspired by the ones in WatchlistPage
const INITIAL_PRICES: Record<string, number> = {
  AAPL: 189.45, MSFT: 415.2, NVDA: 875.4, GOOGL: 157.8, AMZN: 187.3,
  TSLA: 248.6, META: 502.3, V: 278.9, JPM: 198.4, XOM: 108.2,
  WMT: 168.7, BRK: 381.6, GLD: 185.6, SLV: 23.45, USO: 76.12,
  UNG: 16.34, CPER: 25.67, ASML: 892.3, NEE: 62.4
};

export async function getMarketData(tickers: string[]): Promise<MarketData[]> {
  // In a real app, this would fetch from an API like Alpha Vantage or Finnhub.
  // For this project, we'll simulate real-time updates by fluctuating base prices.
  
  const now = new Date().toISOString();
  
  return tickers.map(ticker => {
    const tickerUpper = ticker.toUpperCase();
    const basePrice = INITIAL_PRICES[tickerUpper] || 100;
    
    // If not cached, initialize
    if (!CACHED_PRICES[tickerUpper]) {
      CACHED_PRICES[tickerUpper] = {
        ticker: tickerUpper,
        price: basePrice,
        change: 0,
        changePercent: 0,
        lastUpdated: now
      };
    }
    
    const current = CACHED_PRICES[tickerUpper];
    
    // Simulate a small market movement (-0.5% to +0.5%)
    const movement = (Math.random() - 0.5) * 0.01; 
    const newPrice = current.price * (1 + movement);
    const dayChange = newPrice - basePrice;
    const dayChangePercent = (dayChange / basePrice) * 100;
    
    const updated: MarketData = {
      ticker: tickerUpper,
      price: Number(newPrice.toFixed(2)),
      change: Number(dayChange.toFixed(2)),
      changePercent: Number(dayChangePercent.toFixed(2)),
      lastUpdated: now
    };
    
    CACHED_PRICES[tickerUpper] = updated;
    return updated;
  });
}

export async function searchTicker(query: string) {
  // Simple search over our known list
  const all = [...STOCK_LIST, ...COMMODITY_LIST];
  return all.filter(t => t.includes(query.toUpperCase()));
}
