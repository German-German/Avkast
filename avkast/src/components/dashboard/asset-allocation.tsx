import React from "react";

export const AssetAllocation: React.FC = () => {
  return (
    <div className="p-6 rounded-xl glass gold-glow space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Asset Allocation</h3>
        <div className="flex gap-2">
          {["CLASS", "SECTOR", "REGION"].map((t) => (
            <button key={t} className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/10 uppercase">
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative h-64 flex items-center justify-center">
        {/* Simple Ring Chart Representation with SVG */}
        <svg className="w-48 h-48 -rotate-90">
          <circle cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" />
          <circle cx="96" cy="96" r="80" fill="transparent" stroke="var(--primary)" strokeWidth="12" strokeDasharray="502" strokeDashoffset="150" strokeLinecap="round" className="gold-glow" />
          <circle cx="96" cy="96" r="60" fill="transparent" stroke="var(--accent)" strokeWidth="12" strokeDasharray="376" strokeDashoffset="100" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Equity</span>
          <span className="text-3xl font-bold">68.2%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Equities", value: "$1,932,634", color: "bg-primary" },
          { label: "Fixed Income", value: "$568,421", color: "bg-accent" },
          { label: "Commodities", value: "$341,054", color: "bg-muted" },
        ].map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", item.color)} />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">{item.label}</span>
            </div>
            <div className="text-xs font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { cn } from "@/lib/utils";
