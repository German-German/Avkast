/**
 * News Service
 * Provides financial news updates.
 */

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: "MARKET" | "CRYPTO" | "PORTFOLIO" | "ECONOMY";
  impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
}

const NEWS_DATABASE: NewsItem[] = [
  {
    id: "1",
    category: "MARKET",
    title: "S&P 500 Surging",
    summary: "Index up 2.4% following rate decision. Institutional liquidity increasing across all major sectors as inflation fears subside.",
    source: "Neural Feed",
    time: "2m ago",
    impact: "POSITIVE"
  },
  {
    id: "2",
    category: "CRYPTO",
    title: "Bitcoin Volatility",
    summary: "BTC testing $72k resistance levels. Neural swarm signals 'Hold' as institutional accumulation continues.",
    source: "Alpha Swarm",
    time: "15m ago",
    impact: "NEUTRAL"
  },
  {
    id: "3",
    category: "ECONOMY",
    title: "Fed Signals Pause",
    summary: "The Federal Reserve indicates no further rate hikes for 2026, citing stabilizing labor markets and cooling core inflation.",
    source: "Bloomberg Term",
    time: "45m ago",
    impact: "POSITIVE"
  },
  {
    id: "4",
    category: "MARKET",
    title: "Tech Giants Rally",
    summary: "NVDA and MSFT see record inflows after breakthroughs in decentralized AI computing architectures.",
    source: "Reuters Fin",
    time: "1h ago",
    impact: "POSITIVE"
  },
  {
    id: "5",
    category: "ECONOMY",
    title: "Oil Prices Dip",
    summary: "Crude oil futures drop 3% as global supply chains optimize and renewable energy adoption accelerates.",
    source: "Energy Desk",
    time: "2h ago",
    impact: "NEGATIVE"
  }
];

export async function getLatestNews(): Promise<NewsItem[]> {
  // In a real app, this would fetch from NewsAPI or GNews.
  // We'll return the database with randomized order/times for simulation.
  return [...NEWS_DATABASE].sort(() => Math.random() - 0.5);
}
