/**
 * Market Data Service
 * Provides real-time and simulated market data for stocks and commodities.
 * Integrates with Alpha Vantage API.
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
  WMT: 168.7, BRK: 381.6, GLD: 2185.6, SLV: 24.45, USO: 76.12,
  UNG: 16.34, CPER: 25.67, ASML: 892.3, NEE: 62.4, DBA: 24.12, PPLT: 92.45
};

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

async function fetchFromAlphaVantage(ticker: string): Promise<Partial<MarketData> | null> {
  if (!API_KEY || API_KEY === "YOUR_ALPHA_VANTAGE_API_KEY_HERE") return null;

  try {
    const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`);
    const data = await res.json();
    const quote = data["Global Quote"];
    
    if (quote && quote["05. price"]) {
      return {
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace("%", ""))
      };
    }
  } catch (err) {
    console.error(`Alpha Vantage fetch error for ${ticker}:`, err);
  }
  return null;
}

export async function getMarketData(tickers: string[]): Promise<MarketData[]> {
  const now = new Date().toISOString();
  
  const results = await Promise.all(tickers.map(async (ticker) => {
    const tickerUpper = ticker.toUpperCase();
    const basePrice = INITIAL_PRICES[tickerUpper] || 100;
    
    // Try Alpha Vantage first
    const apiData = await fetchFromAlphaVantage(tickerUpper);
    
    if (apiData) {
      const updated: MarketData = {
        ticker: tickerUpper,
        price: apiData.price!,
        change: apiData.change!,
        changePercent: apiData.changePercent!,
        lastUpdated: now
      };
      CACHED_PRICES[tickerUpper] = updated;
      return updated;
    }

    // Fallback to simulation
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
    const movement = (Math.random() - 0.5) * 0.002; 
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
  }));

  return results;
}

export async function searchTicker(query: string) {
  const all = [...STOCK_LIST, ...COMMODITY_LIST];
  return all.filter(t => t.includes(query.toUpperCase()));
}
