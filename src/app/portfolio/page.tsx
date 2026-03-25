"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, Eye, EyeOff } from "lucide-react";

const HOLDINGS = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", shares: 340, price: 189.45, costBasis: 142.3, weight: 12.4, change: +2.31 },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", shares: 210, price: 415.2, costBasis: 290.0, weight: 11.8, change: +0.87 },
  { ticker: "BRK.B", name: "Berkshire Hathaway", sector: "Financials", shares: 580, price: 381.6, costBasis: 312.4, weight: 10.2, change: -0.33 },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology", shares: 120, price: 875.4, costBasis: 490.0, weight: 9.8, change: +4.12 },
  { ticker: "V", name: "Visa Inc.", sector: "Financials", shares: 430, price: 278.9, costBasis: 240.0, weight: 8.4, change: +0.61 },
  { ticker: "BND", name: "Vanguard Total Bond", sector: "Fixed Income", shares: 1200, price: 72.3, costBasis: 75.1, weight: 7.1, change: -0.12 },
  { ticker: "AGG", name: "iShares Core US Bond", sector: "Fixed Income", shares: 980, price: 95.4, costBasis: 98.2, weight: 6.8, change: -0.08 },
  { ticker: "GLD", name: "SPDR Gold Shares", sector: "Commodities", shares: 280, price: 185.6, costBasis: 167.3, weight: 5.9, change: +1.04 },
  { ticker: "VNQ", name: "Vanguard Real Estate", sector: "Real Estate", shares: 640, price: 84.2, costBasis: 92.4, weight: 5.2, change: -0.55 },
  { ticker: "NEE", name: "NextEra Energy", sector: "Utilities", shares: 510, price: 62.4, costBasis: 78.5, weight: 4.8, change: -0.71 },
];

const ALLOCATION = [
  { label: "Technology", pct: 34, color: "#708238" },
  { label: "Fixed Income", pct: 14, color: "#10B981" },
  { label: "Financials", pct: 18, color: "#3B82F6" },
  { label: "Commodities", pct: 12, color: "#F59E0B" },
  { label: "Real Estate", pct: 10, color: "#8B5CF6" },
  { label: "Utilities", pct: 12, color: "#EC4899" },
];

export default function PortfolioPage() {
  const [hideValues, setHideValues] = useState(false);
  const [tab, setTab] = useState<"holdings" | "allocation" | "performance">("holdings");
  const [sort, setSort] = useState<"weight" | "change" | "gain">("weight");

  const sorted = [...HOLDINGS].sort((a, b) => {
    if (sort === "weight") return b.weight - a.weight;
    if (sort === "change") return b.change - a.change;
    const gainA = (a.price - a.costBasis) / a.costBasis;
    const gainB = (b.price - b.costBasis) / b.costBasis;
    return gainB - gainA;
  });

  const totalValue = 2842109.42;
  const dayChange = 14203;
  const ytdReturn = 12.4;

  const mask = (val: string) => (hideValues ? "••••••" : val);

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">PORTFOLIO</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHideValues(v => !v)}
              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-muted-foreground transition-all"
              title="Toggle value visibility"
            >
              {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-tight hover:bg-primary/20 transition-all">
              <RefreshCw className="h-3.5 w-3.5" /> Rebalance
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Value", value: mask(`$${totalValue.toLocaleString()}`), sub: "As of today", positive: true },
              { label: "Day Change", value: mask(`+$${dayChange.toLocaleString()}`), sub: "+0.50% today", positive: true },
              { label: "YTD Return", value: mask(`+${ytdReturn}%`), sub: "vs Benchmark +8.2%", positive: true },
              { label: "Buying Power", value: mask("$420,100"), sub: "Cash available", positive: true },
            ].map(kpi => (
              <div key={kpi.label} className="p-5 rounded-xl glass space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</div>
                <div className={cn("text-2xl font-bold tracking-tighter", kpi.positive ? "text-foreground" : "text-destructive")}>{kpi.value}</div>
                <div className="text-[10px] text-muted-foreground">{kpi.sub}</div>
              </div>
            ))}
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
                  {HOLDINGS.length} Positions
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
                {[
                  { label: "Equities", pct: 68, value: "$1,932,634" },
                  { label: "Fixed Income", pct: 20, value: "$568,421" },
                  { label: "Commodities", pct: 12, value: "$341,054" },
                ].map(a => (
                  <div key={a.label} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-foreground">{a.label}</div>
                      <div className="text-[10px] text-muted-foreground">{mask(a.value)}</div>
                    </div>
                    <div className="text-2xl font-bold tracking-tighter text-primary">{a.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {tab === "performance" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { period: "1 Day", return: "+0.50%", value: "+$14,203", positive: true },
                { period: "1 Week", return: "+1.82%", value: "+$50,811", positive: true },
                { period: "1 Month", return: "+3.14%", value: "+$86,400", positive: true },
                { period: "3 Months", return: "+7.21%", value: "+$191,100", positive: true },
                { period: "YTD", return: "+12.40%", value: "+$314,000", positive: true },
                { period: "1 Year", return: "+18.30%", value: "+$438,200", positive: true },
              ].map(p => (
                <div key={p.period} className="p-5 rounded-xl glass space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.period}</div>
                  <div className={cn("text-3xl font-bold tracking-tighter", p.positive ? "text-accent" : "text-destructive")}>
                    {mask(p.return)}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{mask(p.value)} net</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
