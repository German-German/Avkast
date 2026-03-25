"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import { AssetAllocation } from "@/components/dashboard/asset-allocation";
import { HoldingsHeatMap } from "@/components/dashboard/holdings-heatmap";
import { Search, Bell, Settings, UserCircle, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  const summary = data?.portfolio_summary || {
    total_value_usd: 2842109.42,
    unrealized_gain_loss_pct: 12.4,
    risk_profile: "Moderate 64/100",
    esg_alignment_score: 88
  };

  const topSignal = data?.active_signals?.[0] || {
    ticker: "Global Tech",
    action: "BUY",
    confidence_score: 0.74,
    reasoning: "Increase exposure to Tech Infrastructure by 4.2% while reducing stagnant retail holdings.",
    id: "v4.2-b4c9e2"
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-40">
           <div className="relative w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <input 
               type="text" 
               placeholder="Search assets, symbols, news..." 
               className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
             />
           </div>
           
           <div className="flex items-center gap-4">
             <button className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/5 text-muted-foreground">
               <Bell className="h-5 w-5" />
             </button>
             <button className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/5 text-muted-foreground">
               <Settings className="h-5 w-5" />
             </button>
             <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-foreground leading-none">Alexander Vance</div>
                  <div className="text-[10px] text-primary font-bold tracking-tighter uppercase mt-1">Premium Tier</div>
                </div>
                <UserCircle className="h-8 w-8 text-muted-foreground" />
             </div>
           </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Main Hero Stats */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Total Portfolio Value</span>
              <h1 className="text-5xl font-bold tracking-tighter text-foreground flex items-baseline gap-1">
                ${summary.total_value_usd.toLocaleString()}<span className="text-2xl text-muted-foreground">.00</span>
                <span className={cn(
                  "ml-4 text-lg font-medium flex items-center gap-1",
                  summary.unrealized_gain_loss_pct >= 0 ? "text-accent" : "text-destructive"
                )}>
                  <span className="text-xs">{summary.unrealized_gain_loss_pct >= 0 ? "↗" : "↘"}</span> 
                  {summary.unrealized_gain_loss_pct >= 0 ? "+" : ""}{summary.unrealized_gain_loss_pct}%
                </span>
              </h1>
            </div>
            
            <div className="flex gap-4">
               <div className="text-right pr-6 border-r border-white/10">
                 <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Day Change</div>
                 <div className="text-lg font-bold text-accent">+$14,203</div>
               </div>
               <div className="text-right">
                 <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Buying Power</div>
                 <div className="text-lg font-bold text-foreground">$420,100</div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Advisor Hero */}
            <div className="lg:col-span-2">
              <AIInsightCard 
                title="AI Strategic Consultant"
                insight={topSignal.reasoning}
                rationale="Recursive swarm analysis indicates high probability of alpha generation based on current macro-liquidity trends."
                confidenceScore={topSignal.confidence_score}
                auditLink={`audit://${topSignal.id}`}
                className="h-full"
              />
            </div>
            
            {/* Risk Profile & Metrics */}
            <AssetAllocation />
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              label="CASH POSITION" 
              value="$312,040.00" 
              subValue="7.2% of Portfolio" 
              change={{ value: "+1.2%", isPositive: true }}
            />
            <MetricCard 
              label="RISK SCORE" 
              value={summary.risk_profile} 
              subValue="Target: Moderate" 
            />
             <MetricCard 
              label="ESG ALIGNMENT" 
              value={`${summary.esg_alignment_score}/100`} 
              subValue="Benchmark: 70" 
              change={{ value: "Compliant", isPositive: true }}
            />
             <MetricCard 
              label="VOLATILITY (VIX)" 
              value="14.2" 
              subValue="-12% vs 30d Avg" 
              change={{ value: "-4.2%", isPositive: true }}
            />
          </div>

          <HoldingsHeatMap />
        </div>
      </div>
    </main>
  );
}

import { cn } from "@/lib/utils";
