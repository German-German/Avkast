import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { generateUserPortfolio } from "@/lib/portfolio-engine";
import { useMarketData } from "@/hooks/use-market-data";
import { useMemo } from "react";

const BASE_TICKERS = ["AAPL", "MSFT", "TSLA", "GOOGL", "AMZN", "NVDA", "META", "V", "JPM", "XOM", "WMT", "ASML", "GLD", "SLV", "USO"];

export const HoldingsHeatMap: React.FC = () => {
  const { user, isGuest } = useAuth();
  
  const tickers = useMemo(() => {
    if (isGuest) return BASE_TICKERS;
    const wealth = user?.initialWealth || 100000;
    const markets = user?.preferredMarkets ? (typeof user.preferredMarkets === 'string' ? JSON.parse(user.preferredMarkets) : user.preferredMarkets) : [];
    const holdings = generateUserPortfolio(wealth, markets);
    return holdings.map(h => h.ticker);
  }, [user, isGuest]);

  const { data: marketData, loading } = useMarketData(tickers);

  const heatmapData = useMemo(() => {
    return tickers.map(ticker => {
      const live = marketData[ticker.toUpperCase()];
      const change = live?.changePercent ?? 0;
      return {
        symbol: ticker,
        change: `${change >= 0 ? "+" : ""}${change}%`,
        intensity: change >= 0 
          ? (change > 2 ? "bg-accent/100" : (change > 1 ? "bg-accent/60" : "bg-accent/30"))
          : (change < -2 ? "bg-destructive/80" : "bg-destructive/40")
      };
    });
  }, [tickers, marketData]);

  return (
    <div className="p-6 rounded-xl glass space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Holdings Heat Map</h3>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
             <div className="h-1.5 w-1.5 rounded-full bg-destructive" /> -2%
             <div className="h-1.5 w-1.5 rounded-full bg-white/10" /> 0%
             <div className="h-1.5 w-1.5 rounded-full bg-accent" /> +2%
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {heatmapData.map((item) => (
          <Link 
            key={item.symbol} 
            href={`/asset/${item.symbol}`}
            className={cn(
              "aspect-video rounded p-2 flex flex-col justify-between transition-transform hover:scale-105 cursor-pointer border border-white/5",
              item.intensity
            )}
          >
            <span className="text-[10px] font-bold text-white tracking-widest leading-none">{item.symbol}</span>
            <span className="text-[10px] font-semibold text-white/90 leading-none">{item.change}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
