"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import { AssetAllocation } from "@/components/dashboard/asset-allocation";
import { HoldingsHeatMap } from "@/components/dashboard/holdings-heatmap";
import { Topbar } from "@/components/dashboard/topbar";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { generateUserPortfolio } from "@/lib/portfolio-engine";

export default function DashboardPage() {
  const { user, isGuest } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.ok ? r.json() : null)
      .then((result) => { setData(result); })
      .catch((e) => console.error("Dashboard fetch failed:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  const startingWealth = user?.initialWealth || 100000;
  const preferredMarkets = user?.preferredMarkets ? (typeof user.preferredMarkets === 'string' ? JSON.parse(user.preferredMarkets) : user.preferredMarkets) : [];

  const portfolio = useMemo(() => {
    if (isGuest) return [];
    return generateUserPortfolio(startingWealth, preferredMarkets);
  }, [startingWealth, preferredMarkets, isGuest]);

  const totalValue = portfolio.reduce((sum, h) => sum + (h.price * h.shares), 0);
  const dayChangePct = portfolio.reduce((sum, h) => sum + (h.change * (h.weight / 100)), 0);
  const dayChangeUsd = totalValue * (dayChangePct / 100);

  const summary = data?.portfolio_summary ?? {
    total_value_usd: totalValue || startingWealth,
    unrealized_gain_loss_pct: 12.4,
    risk_profile: "Moderate 64/100",
    esg_alignment_score: 88,
  };

  const topSignal = data?.active_signals?.[0] ?? {
    ticker: "Global Tech",
    action: "BUY",
    confidence_score: 0.74,
    reasoning: "Increase exposure to Tech Infrastructure by 4.2% while reducing stagnant retail holdings.",
    id: "v4.2-b4c9e2",
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Header ── */}
        <Topbar />

        {/* ── Dashboard Content ── */}
        <div className="p-8 space-y-8 overflow-y-auto">
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
              {/* Hero Stats */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 pb-2">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Total Portfolio Value
              </span>
              <h1 className="text-5xl font-bold tracking-tighter text-foreground flex items-baseline gap-1">
                ${summary.total_value_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className="text-2xl text-muted-foreground">.00</span>
                <span
                  className={cn(
                    "ml-4 text-lg font-medium flex items-center gap-1",
                    summary.unrealized_gain_loss_pct >= 0 ? "text-accent" : "text-destructive"
                  )}
                >
                  <span className="text-xs">
                    {summary.unrealized_gain_loss_pct >= 0 ? "↗" : "↘"}
                  </span>
                  {summary.unrealized_gain_loss_pct >= 0 ? "+" : ""}
                  {summary.unrealized_gain_loss_pct}%
                </span>
              </h1>
            </div>

            <div className="flex items-end gap-8">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Day Change</div>
                <div className={cn("text-lg font-bold", dayChangeUsd >= 0 ? "text-accent" : "text-destructive")}>
                  {dayChangeUsd >= 0 ? "+" : "-"}${Math.abs(dayChangeUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Buying Power</div>
                <div className="text-lg font-bold text-foreground">
                  ${(startingWealth * 0.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>

          {/* AI Card + Asset Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <AssetAllocation />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label="CASH POSITION"
              value={`$${(startingWealth * 0.072).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
