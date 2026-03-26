"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Sparkles, Play, RefreshCcw, Info, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WhatIfPage() {
  const [marketDrop, setMarketDrop] = useState(0);
  const [savingsIncrease, setSavingsIncrease] = useState(0);
  const [inflation, setInflation] = useState(2.1);

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          leftContent={
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">WHAT-IF SCENARIOS</h1>
            </div>
          }
        />

        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Scenario Controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-2xl glass border border-white/5 space-y-8">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <RefreshCcw className="h-3.5 w-3.5" /> Engine Parameters
                </h2>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">Market Drawdown</label>
                      <span className="text-xs font-mono text-destructive">{marketDrop}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="50" step="5"
                      value={marketDrop}
                      onChange={(e) => setMarketDrop(Number(e.target.value))}
                      className="w-full accent-destructive h-1.5 bg-white/5 rounded-full appearance-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">Savings Adjustment</label>
                      <span className="text-xs font-mono text-accent">+{savingsIncrease}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="10"
                      value={savingsIncrease}
                      onChange={(e) => setSavingsIncrease(Number(e.target.value))}
                      className="w-full accent-accent h-1.5 bg-white/5 rounded-full appearance-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">Inflation Reality</label>
                      <span className="text-xs font-mono text-primary">{inflation}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="15" step="0.1"
                      value={inflation}
                      onChange={(e) => setInflation(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-white/5 rounded-full appearance-none"
                    />
                  </div>
                </div>

                <button className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                  <Play className="h-3.5 w-3.5" /> Run Logic Matrix
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                 <div className="flex items-center gap-2 text-amber-400 font-bold text-[10px] uppercase tracking-widest">
                   <AlertTriangle className="h-3.5 w-3.5" /> System Warning
                 </div>
                 <p className="text-xs text-amber-200/70 leading-relaxed">
                   Scenarios exceeding 20% drawdown trigger automated liquidity preservation protocols.
                 </p>
              </div>
            </div>

            {/* Scenario Output */}
            <div className="lg:col-span-2 space-y-8">
              <div className="p-8 rounded-3xl glass border border-white/5 min-h-[400px] flex flex-col justify-between">
                <div className="space-y-2">
                   <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Simulation Analysis</div>
                   <h2 className="text-3xl font-bold tracking-tighter text-foreground">
                     {marketDrop > 0 ? `Surviving a -${marketDrop}% Correction` : "Optimizing Future Liquidity"}
                   </h2>
                </div>

                <div className="flex-1 flex items-center justify-center p-12">
                   <div className="w-full h-48 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-muted-foreground text-xs italic">
                     Dynamic Impact Charting Area
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Net Worth Impact</div>
                    <div className={cn("text-xl font-bold font-mono", marketDrop > 0 ? "text-destructive" : "text-foreground")}>
                      {marketDrop > 0 ? "-" : ""}${(marketDrop * 12500).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Time to Goal</div>
                    <div className="text-xl font-bold font-mono text-foreground">
                      {marketDrop > 20 ? "+2.5 Years" : "0.0 Years"}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Resilience Score</div>
                    <div className="text-xl font-bold font-mono text-accent">88/100</div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl glass border border-primary/20 bg-primary/5 space-y-4">
                <div className="flex items-center gap-2">
                   <Sparkles className="h-5 w-5 text-primary" />
                   <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">AI Strategic Insight</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Recursive swarm logic identifies that while a {marketDrop}% drop is significant, your current {savingsIncrease}% savings boost effectively cancels out the capital erosion over a 36-month recovery window. <strong>Recommendation:</strong> Do not panic sell; increase allocation to Commodities to hedge against the {inflation}% inflation spike.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
