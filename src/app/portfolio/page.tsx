"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, TrendingDown, PieChart, BarChart3, Clock, ArrowUpRight, Lock } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { useAuth } from "@/contexts/auth-context";
import { generateUserPortfolio } from "@/lib/portfolio-engine";
import Link from "next/link";

export default function PortfolioPage() {
  const { user, isGuest } = useAuth();
  const [hideValues, setHideValues] = useState(false);
  const [tab, setTab] = useState<"holdings" | "allocation" | "performance">("holdings");
  const [sort, setSort] = useState<"weight" | "change" | "gain">("weight");
  
  const startingWealth = user?.initialWealth || 100000;
  const preferredMarkets = user?.preferredMarkets ? (typeof user.preferredMarkets === 'string' ? JSON.parse(user.preferredMarkets) : user.preferredMarkets) : [];

  const holdings = useMemo(() => {
    if (isGuest) return [];
    return generateUserPortfolio(startingWealth, preferredMarkets);
  }, [startingWealth, preferredMarkets, isGuest]);

  // Live price simulation loop (only for logged-in users)
  useEffect(() => {
    if (isGuest) return;
    const interval = setInterval(() => {
      // This effect is now disabled as holdings are generated once.
      // If live price simulation is desired, it needs to be integrated with generateUserPortfolio or a separate state.
    }, 15000); // 15 seconds
    
    return () => clearInterval(interval);
  }, [isGuest]);

  const sorted = [...holdings].sort((a, b) => {
    if (sort === "weight") return b.weight - a.weight;
    if (sort === "change") return b.change - a.change;
    const gainA = (a.price - a.costBasis) / a.costBasis;
    const gainB = (b.price - b.costBasis) / b.costBasis;
    return gainB - gainA;
  });

  const totalValue = holdings.reduce((sum, h) => sum + (h.price * h.shares), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.costBasis * h.shares), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = (totalGain / totalCost) * 100;

  // Derive allocation from actual holdings
  const sectorMap: Record<string, number> = {};
  holdings.forEach(h => {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + (h.weight);
  });

  const ALLOCATION = Object.entries(sectorMap).map(([label, pct], i) => ({
    label,
    pct,
    color: [`#708238`, `#A4C639`, `#556B2F`, `#8FBC8F`, `#2E8B57`][i % 5]
  }));

  const mask = (val: string | number) => hideValues ? "••••••" : val;

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Topbar 
          leftContent={
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap truncate">PORTFOLIO</h1>
            </div>
          }
          rightContent={
            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <button
                onClick={() => setHideValues(v => !v)}
                className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-muted-foreground transition-all"
                title="Toggle value visibility"
              >
                {hideValues ? <Lock className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </button>
              <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-tight hover:bg-primary/20 transition-all">
                <Activity className="h-3.5 w-3.5" /> Rebalance
              </button>
            </div>
          }
        />

        <div className="p-8 space-y-8 overflow-y-auto w-full">
          {isGuest ? (
            <div className="p-8 mt-20 rounded-3xl glass border border-white/5 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
               <div className="mx-auto h-20 w-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
                 <Lock className="h-10 w-10 text-destructive" />
               </div>
               <h2 className="text-2xl font-bold tracking-[-0.04em] text-foreground">GUEST MODE LOCKED</h2>
               <p className="text-muted-foreground text-sm px-4">Create a permanent account and define your initial wealth to unlock live institutional portfolio tracking.</p>
               <div className="pt-6">
                 <Link href="/profile" className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-xl inline-flex items-center gap-2 hover:opacity-90 transition-all">
                   Secure Account Now
                 </Link>
               </div>
            </div>
          ) : (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl glass border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Equity</div>
                  <div className="text-xl font-bold text-foreground">${mask(totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 }))}</div>
                </div>
                <div className="p-4 rounded-xl glass border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Gain/Loss</div>
                  <div className={cn("text-xl font-bold", totalGain >= 0 ? "text-accent" : "text-destructive")}>
                    {mask(`${totalGain >= 0 ? "+" : "-"}$${Math.abs(totalGain).toLocaleString(undefined, { maximumFractionDigits: 0 })}`)}
                  </div>
                </div>
                <div className="p-4 rounded-xl glass border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Return Percentage</div>
                  <div className={cn("text-xl font-bold", totalGainPct >= 0 ? "text-accent" : "text-destructive")}>
                    {mask(`${totalGainPct >= 0 ? "+" : ""}${totalGainPct.toFixed(2)}%`)}
                  </div>
                </div>
                <div className="p-4 rounded-xl glass border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risk Rating</div>
                  <div className="text-xl font-bold text-primary">B+ MODERATE</div>
                </div>
              </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 border-b border-border pb-0">
            {(["holdings", "allocation", "performance"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-5 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all -mb-px",
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Holdings Tab */}
          {tab === "holdings" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {holdings.length} Positions
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Sort:</span>
                  {(["weight", "change", "gain"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={cn(
                        "text-[10px] px-3 py-1 rounded-full uppercase font-bold border transition-all",
                        sort === s
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "border-white/10 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-white/[0.02]">
                      {["Ticker", "Name", "Sector", "Price", "Cost Basis", "Gain/Loss", "Weight", "Day Chg"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((h, i) => {
                      const gain = ((h.price - h.costBasis) / h.costBasis) * 100;
                      return (
                        <tr key={h.ticker} className={cn("border-b border-border/50 hover:bg-white/[0.02] transition-colors", i % 2 === 0 ? "" : "bg-white/[0.01]")}>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-primary text-xs">{h.ticker}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-foreground font-medium">{h.name}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10">{h.sector}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-mono font-semibold">{mask(`$${h.price.toFixed(2)}`)}</td>
                          <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">{mask(`$${h.costBasis.toFixed(2)}`)}</td>
                          <td className={cn("px-4 py-3.5 text-xs font-bold", gain >= 0 ? "text-accent" : "text-destructive")}>
                            {mask(`${gain >= 0 ? "+" : ""}${gain.toFixed(1)}%`)}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1 rounded-full bg-white/5 flex-1 max-w-16">
                                <div className="h-1 rounded-full bg-primary" style={{ width: `${h.weight * 4}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">{h.weight}%</span>
                            </div>
                          </td>
                          <td className={cn("px-4 py-3.5 text-xs font-bold flex items-center gap-1", h.change >= 0 ? "text-accent" : "text-destructive")}>
                            {h.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {h.change >= 0 ? "+" : ""}{h.change}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Allocation Tab */}
          {tab === "allocation" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl glass space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sector Breakdown</h3>
                <div className="space-y-3">
                  {ALLOCATION.map(a => (
                    <div key={a.label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-foreground">{a.label}</span>
                        <span className="text-xs font-bold font-mono">{a.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl glass space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Asset Class</h3>
                  {ALLOCATION.map(a => (
                    <div key={a.label} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/5">
                      <div>
                        <div className="text-xs font-bold text-foreground">{a.label}</div>
                        <div className="text-[10px] text-muted-foreground">Dynamic Allocation</div>
                      </div>
                      <div className="text-2xl font-bold tracking-tighter text-primary">{Math.round(a.pct)}%</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {tab === "performance" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { period: "1 Day", pct: 0.50, positive: true },
                { period: "1 Week", pct: 1.82, positive: true },
                { period: "1 Month", pct: 3.14, positive: true },
                { period: "3 Months", pct: 7.21, positive: true },
                { period: "YTD", pct: 12.40, positive: true },
                { period: "1 Year", pct: 18.30, positive: true },
              ].map(p => {
                const dollarVal = totalValue * (p.pct / 100);
                return (
                  <div key={p.period} className="p-5 rounded-xl glass space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.period}</div>
                    <div className={cn("text-3xl font-bold tracking-tighter", p.positive ? "text-accent" : "text-destructive")}>
                      {mask(`+${p.pct.toFixed(2)}%`)}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{mask(`+$${dollarVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)} net</div>
                  </div>
                );
              })}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
