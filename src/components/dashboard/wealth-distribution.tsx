"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { generateUserPortfolio } from "@/lib/portfolio-engine";

export const WealthDistribution: React.FC<{ className?: string }> = ({ className }) => {
  const { user, isGuest } = useAuth();

  const startingWealth = user?.initialWealth || 100000;
  const preferredMarkets = user?.preferredMarkets 
    ? (typeof user.preferredMarkets === 'string' ? JSON.parse(user.preferredMarkets) : user.preferredMarkets) 
    : [];

  const portfolio = React.useMemo(() => {
    if (isGuest) return [];
    return generateUserPortfolio(startingWealth, preferredMarkets);
  }, [startingWealth, preferredMarkets, isGuest]);

  const totalValue = portfolio.reduce((sum, h) => sum + (h.price * h.shares), 0) || startingWealth;
  const dayChangePct = portfolio.reduce((sum, h) => sum + (h.change * (h.weight / 100)), 0) || 1.2;
  const dayChangeUsd = totalValue * (dayChangePct / 100);

  // Derive mini-allocation
  const sectors = Array.from(new Set(portfolio.map(h => h.sector)));
  const allocation = sectors.map((s, i) => ({
    label: s,
    pct: portfolio.filter(h => h.sector === s).reduce((sum, h) => sum + h.weight, 0),
    color: [`#708238`, `#A4C639`, `#556B2F`, `#8FBC8F`, `#2E8B57`][i % 5]
  })).sort((a, b) => b.pct - a.pct);

  return (
    <div className={cn("p-4 rounded-xl glass border border-white/5 space-y-4 shadow-xl bg-white/[0.02]", className)}>
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Global Wealth</span>
        <div className="flex items-baseline justify-between">
          <h4 className="text-lg font-bold tracking-tighter text-foreground">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h4>
          <div className={cn("flex items-center gap-0.5 text-[10px] font-bold", dayChangeUsd >= 0 ? "text-accent" : "text-destructive")}>
            {dayChangeUsd >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
            {dayChangeUsd >= 0 ? "+" : ""}{dayChangePct.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
          {allocation.length > 0 ? (
            allocation.map((a, i) => (
              <div 
                key={a.label} 
                style={{ width: `${a.pct}%`, backgroundColor: a.color }} 
                className="h-full first:rounded-l-full last:rounded-r-full"
                title={`${a.label}: ${a.pct}%`}
              />
            ))
          ) : (
            <div className="w-[70%] h-full bg-primary rounded-full" />
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {(allocation.length > 0 ? allocation.slice(0, 3) : [{label: "Equities", pct: 70}, {label: "Fixed", pct: 30}]).map((a, i) => (
            <div key={a.label} className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: (a as any).color || (i === 0 ? '#708238' : '#556B2F') }} />
              <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
