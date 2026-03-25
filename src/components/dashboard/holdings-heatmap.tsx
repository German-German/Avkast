import Link from "next/link";
import { cn } from "@/lib/utils";

const MockHeatMapData = [
  { symbol: "AAPL", change: "+4.2%", intensity: "bg-accent/80" },
  { symbol: "MSFT", change: "+1.8%", intensity: "bg-accent/40" },
  { symbol: "TSLA", change: "-3.1%", intensity: "bg-destructive/60" },
  { symbol: "GOOGL", change: "+0.9%", intensity: "bg-accent/20" },
  { symbol: "AMZN", change: "0.0%", intensity: "bg-white/10" },
  { symbol: "NVDA", change: "+8.4%", intensity: "bg-accent/100" },
  { symbol: "META", change: "-0.4%", intensity: "bg-destructive/20" },
  { symbol: "V", change: "+0.2%", intensity: "bg-accent/10" },
  { symbol: "JPM", change: "+2.2%", intensity: "bg-accent/50" },
  { symbol: "XOM", change: "-1.2%", intensity: "bg-destructive/30" },
  { symbol: "WMT", change: "+1.1%", intensity: "bg-accent/30" },
  { symbol: "ASML", change: "+5.1%", intensity: "bg-accent/90" },
];

export const HoldingsHeatMap: React.FC = () => {
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
        {MockHeatMapData.map((item) => (
          <Link 
            key={item.symbol} 
            href={`/asset/${item.symbol}`}
            className={cn(
              "aspect-video rounded p-2 flex flex-col justify-between transition-transform hover:scale-105 cursor-pointer",
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
