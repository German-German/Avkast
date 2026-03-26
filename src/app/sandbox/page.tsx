"use client";

import React, { useState, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Activity, Plus, FileBarChart, PieChart, Info, Play, Trash2, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

// Mock database of assets with mathematical parameters
const AVAILABLE_ASSETS = [
  { ticker: "AAPL", name: "Apple Inc.", cagr: 0.18, vol: 0.22, sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft Corp.", cagr: 0.20, vol: 0.20, sector: "Technology" },
  { ticker: "TSLA", name: "Tesla Inc.", cagr: 0.35, vol: 0.60, sector: "Consumer Cyclical" },
  { ticker: "JPM", name: "JPMorgan Chase", cagr: 0.10, vol: 0.18, sector: "Financials" },
  { ticker: "V", name: "Visa Inc.", cagr: 0.14, vol: 0.19, sector: "Financials" },
  { ticker: "XOM", name: "Exxon Mobil", cagr: 0.08, vol: 0.25, sector: "Energy" },
  { ticker: "SPY", name: "S&P 500 ETF", cagr: 0.10, vol: 0.15, sector: "Index" },
  { ticker: "GLD", name: "Gold Trust", cagr: 0.05, vol: 0.12, sector: "Commodity" },
  { ticker: "BND", name: "Total Bond ETF", cagr: 0.03, vol: 0.05, sector: "Fixed Income" },
];

export default function SandboxPage() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<typeof AVAILABLE_ASSETS>([]);
  const [initialInvestment, setInitialInvestment] = useState(user?.initialWealth || 100000);
  const [years, setYears] = useState(10);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const router = useRouter();

  const handleExportToAI = () => {
    if (!simulation) return;
    const exportData = {
      type: "SANDBOX_SIMULATION",
      portfolio: portfolio.map(p => p.ticker),
      cagr: simulation.aggCagr,
      volatility: simulation.aggVol,
      initialInvestment,
      years,
      projectedReturn: simulation.paths.median[simulation.paths.median.length - 1]
    };
    
    // Save to local storage for the AI Advisor to pick up
    localStorage.setItem("avkast_ai_handoff", JSON.stringify(exportData));
    router.push("/advisor");
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, ticker: string) => {
    e.dataTransfer.setData("ticker", ticker);
    setDraggedItem(ticker);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const ticker = e.dataTransfer.getData("ticker");
    setDraggedItem(null);
    
    if (portfolio.find(p => p.ticker === ticker)) return; // prevent dups
    const asset = AVAILABLE_ASSETS.find(a => a.ticker === ticker);
    if (asset) setPortfolio([...portfolio, asset]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // necessary to allow dropping
  };

  const removeAsset = (ticker: string) => {
    setPortfolio(portfolio.filter(p => p.ticker !== ticker));
  };

  // Mathematical Monte Carlo Simulation Logic
  // Assuming equal weights for simplicity in the sandbox
  const simulation = useMemo(() => {
    if (portfolio.length === 0) return null;
    
    // Calculate aggregate portfolio CAGR and Volatility (simplified weighted sum)
    const weight = 1 / portfolio.length;
    const aggCagr = portfolio.reduce((sum, a) => sum + (a.cagr * weight), 0);
    // Rough approximation of portfolio volatility (doesn't account for correlation matrix for simplicity)
    const aggVol = portfolio.reduce((sum, a) => sum + (a.vol * weight), 0) * 0.8; // 0.8 assumes some diversification benefit
    
    // Generate Monte Carlo paths (3 paths: 95th Percentile, 50th, 5th)
    const dataPoints = 50; // Points on the chart
    const paths = { high: [] as number[], median: [] as number[], low: [] as number[] };
    
    let currentHigh = initialInvestment;
    let currentMedian = initialInvestment;
    let currentLow = initialInvestment;

    for (let i = 0; i <= dataPoints; i++) {
        const timeFraction = i / dataPoints;
        const currentYear = timeFraction * years;
        
        // Mathematical geometric brownian motion simplified for percentiles
        // Median = P * e^((mu - (sigma^2)/2) * t)
        const medYield = Math.exp((aggCagr - (Math.pow(aggVol, 2) / 2)) * currentYear);
        paths.median.push(initialInvestment * medYield);
        
        // High (approx +1.645 sigma)
        const highYield = Math.exp((aggCagr - (Math.pow(aggVol, 2) / 2)) * currentYear + (1.645 * aggVol * Math.sqrt(currentYear)));
        paths.high.push(initialInvestment * highYield);
        
        // Low (approx -1.645 sigma)
        const lowYield = Math.exp((aggCagr - (Math.pow(aggVol, 2) / 2)) * currentYear - (1.645 * aggVol * Math.sqrt(currentYear)));
        paths.low.push(initialInvestment * lowYield);
    }

    return { paths, aggCagr, aggVol };
  }, [portfolio, initialInvestment, years]);

  // SVG Chart Config
  const chartHeight = 300;
  const chartWidth = 800; // coordinate system width
  const maxVal = simulation ? Math.max(...simulation.paths.high) * 1.1 : 1; 
  
  const createPath = (data: number[]) => {
    if (!data.length) return "";
    const stepX = chartWidth / (data.length - 1);
    return data.map((val, i) => {
      const x = i * stepX;
      const y = chartHeight - (val / maxVal * chartHeight);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar
          leftContent={
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">QUANTITATIVE SANDBOX</h1>
            </div>
          }
          rightContent={null}
        />

        <div className="flex-1 overflow-y-auto p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full max-w-[1600px] mx-auto">
            
            {/* Left Column: Asset Pool */}
            <div className="col-span-1 space-y-6">
              <div className="space-y-2">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Global Asset Pool</h2>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Drag parameters into the sandbox boundary to construct a mathematical projection framework.
                 </p>
              </div>

              <div className="space-y-3">
                {AVAILABLE_ASSETS.map(asset => (
                  <div 
                    key={asset.ticker}
                    draggable
                    onDragStart={(e) => handleDragStart(e, asset.ticker)}
                    onDragEnd={() => setDraggedItem(null)}
                    className={cn(
                      "p-4 rounded-xl border flex items-center justify-between cursor-grab active:cursor-grabbing transition-all",
                      draggedItem === asset.ticker ? "border-primary bg-primary/10 opacity-50 shadow-[0_0_15px_rgba(112,130,56,0.3)]" : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <div>
                      <div className="font-bold text-sm text-foreground">{asset.ticker}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{asset.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-accent">{(asset.cagr * 100).toFixed(1)}% CAGR</div>
                      <div className="text-[10px] text-muted-foreground">Vol: {(asset.vol * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Sandbox & Chart */}
            <div className="col-span-2 space-y-10 flex flex-col">
              
              {/* Construction Box */}
              <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={cn(
                  "p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col",
                  portfolio.length === 0 ? "border-white/10 items-center justify-center min-h-[250px]" : "border-primary/30 bg-primary/5 min-h-[180px]"
                )}
              >
                {portfolio.length === 0 ? (
                  <div className="text-center space-y-3 opacity-50">
                     <FileBarChart className="h-10 w-10 mx-auto text-muted-foreground" />
                     <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Drop Assets Here</p>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <PieChart className="h-4 w-4" /> Active Constitution
                      </h3>
                      <button onClick={() => setPortfolio([])} className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:opacity-80">
                        Clear Sandbox
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {portfolio.map(p => (
                        <div key={p.ticker} className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg">
                          <span className="text-xs font-bold text-foreground">{p.ticker}</span>
                          <span className="text-[10px] text-muted-foreground border-l border-border pl-2">{(100 / portfolio.length).toFixed(1)}%</span>
                          <button onClick={() => removeAsset(p.ticker)} className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Engine Box */}
              <div className="flex-1 rounded-2xl glass border border-white/5 relative overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10">
                  <div className="flex items-center gap-3">
                    <Play className="h-5 w-5 text-accent" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Monte Carlo Simulation</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">10,000 Iteration Matrix</p>
                    </div>
                  </div>

                  {simulation && (
                    <div className="flex gap-6 text-right">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Est. CAGR</div>
                        <div className="text-sm font-bold text-accent">{(simulation.aggCagr * 100).toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Est. Volatility</div>
                        <div className="text-sm font-bold text-destructive">{(simulation.aggVol * 100).toFixed(2)}%</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-10 relative flex items-center justify-center min-h-[450px]">
                  {!simulation ? (
                    <div className="text-center opacity-30 flex flex-col items-center gap-3">
                      <Activity className="h-10 w-10" />
                      <span className="text-xs font-bold tracking-widest uppercase">Awaiting Parameters</span>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      {/* Chart Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="w-full border-t border-dashed border-white/20" />
                        ))}
                      </div>

                      {/* SVG Simulation Graphic */}
                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full preserve-3d overflow-visible">
                        <defs>
                          <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(112,130,56)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(112,130,56)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {/* 95th Percentile Area & Path */}
                        <path d={`M 0 ${chartHeight} ${createPath(simulation.paths.high)} L ${chartWidth} ${chartHeight} Z`} fill="url(#highGrad)" />
                        <path d={createPath(simulation.paths.high)} fill="none" stroke="rgba(112,130,56,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                        
                        {/* 5th Percentile Area & Path */}
                        <path d={createPath(simulation.paths.low)} fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                        
                        {/* Median Path */}
                        <path d={createPath(simulation.paths.median)} fill="none" stroke="rgb(112,130,56)" strokeWidth="4" className="drop-shadow-[0_0_8px_rgba(112,130,56,0.8)]" />

                        {/* End nodes */}
                        <circle cx={chartWidth} cy={chartHeight - (simulation.paths.median[simulation.paths.median.length-1] / maxVal * chartHeight)} r="6" fill="rgb(112,130,56)" />
                        
                      </svg>
                      
                      {/* Tooltips/Labels on right side */}
                      <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between translate-x-[calc(100%+1.5rem)] py-4 w-40 border-l border-white/10 pointer-events-none">
                        <div className="space-y-1">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">95th %ile</div>
                          <div className="text-sm font-bold text-foreground">
                            ${Math.floor(simulation.paths.high[simulation.paths.high.length-1]).toLocaleString()}
                          </div>
                          <div className="text-[10px] font-mono text-accent">
                            +${Math.floor(simulation.paths.high[simulation.paths.high.length-1] - initialInvestment).toLocaleString()} / +{(((simulation.paths.high[simulation.paths.high.length-1] - initialInvestment)/initialInvestment)*100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-primary uppercase font-bold tracking-widest">Median (50th)</div>
                          <div className="text-base font-bold text-primary drop-shadow-[0_0_8px_rgba(112,130,56,0.5)]">
                            ${Math.floor(simulation.paths.median[simulation.paths.median.length-1]).toLocaleString()}
                          </div>
                          <div className="text-[10px] font-mono text-primary">
                            +${Math.floor(simulation.paths.median[simulation.paths.median.length-1] - initialInvestment).toLocaleString()} / +{(((simulation.paths.median[simulation.paths.median.length-1] - initialInvestment)/initialInvestment)*100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-destructive uppercase font-bold tracking-widest">5th %ile</div>
                          <div className="text-sm font-bold text-destructive">
                            ${Math.floor(simulation.paths.low[simulation.paths.low.length-1]).toLocaleString()}
                          </div>
                          {(() => {
                             const gain = simulation.paths.low[simulation.paths.low.length-1] - initialInvestment;
                             const roi = (gain / initialInvestment) * 100;
                             return (
                               <div className={cn("text-[10px] font-mono", gain >= 0 ? "text-accent" : "text-destructive")}>
                                 {gain >= 0 ? "+" : ""}${Math.floor(gain).toLocaleString()} / {roi >= 0 ? "+" : ""}{roi.toFixed(0)}%
                               </div>
                             );
                          })()}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
                
                {/* Configuration Footer */}
                {simulation && (
                  <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-wrap items-end justify-between gap-8">
                    <div className="flex gap-8 flex-wrap">
                      <div className="space-y-2">
                         <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Initial Capital</label>
                         <div className="flex items-center gap-2">
                           <span className="text-sm text-muted-foreground">$</span>
                           <input 
                             type="number" 
                             value={initialInvestment} 
                             onChange={e => setInitialInvestment(Number(e.target.value))}
                             className="bg-transparent text-sm font-bold text-foreground border-b border-border focus:outline-none focus:border-primary w-24"
                           />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Time Horizon (Years)</label>
                         <input 
                           type="range" min="1" max="30" 
                           value={years} 
                           onChange={e => setYears(Number(e.target.value))}
                           className="w-48 accent-primary h-1 bg-white/10 rounded-full appearance-none mt-2"
                         />
                         <div className="text-xs font-bold text-primary">{years} Years</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleExportToAI}
                      className="px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shrink-0"
                    >
                      <Bot className="h-4 w-4" /> Save to AI Advisor
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
