"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, TrendingUp, TrendingDown, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

// Mock mathematical analysis data
const SEARCH_UNIVERSE = [
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 189.45, change: 2.31, score: 92, signal: "STRONG BUY" },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "Stock", price: 415.20, change: 0.87, score: 85, signal: "BUY" },
  { symbol: "NVDA", name: "NVIDIA Corp.", type: "Stock", price: 875.40, change: 4.12, score: 98, signal: "STRONG BUY" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 248.60, change: -3.10, score: 42, signal: "SELL" },
  { symbol: "BTC-USD", name: "Bitcoin", type: "Crypto", price: 64230.00, change: 5.4, score: 88, signal: "BUY" },
  { symbol: "ETH-USD", name: "Ethereum", type: "Crypto", price: 3450.20, change: 2.1, score: 76, signal: "ACCUMULATE" },
  { symbol: "EUR-USD", name: "Euro / US Dollar", type: "Forex", price: 1.082, change: -0.15, score: 55, signal: "NEUTRAL" },
];

export function GlobalSearch() {
  const { isGuest } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = query.length > 0
    ? SEARCH_UNIVERSE.filter(item => 
        item.symbol.toLowerCase().includes(query.toLowerCase()) || 
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  async function handleAdd(item: typeof SEARCH_UNIVERSE[0]) {
    if (isGuest) {
      alert("Guest mode: Watchlist is read-only. Sign up to save stocks.");
      return;
    }
    
    setAdding(item.symbol);
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: item.symbol, name: item.name, sector: item.type }),
      });
      // Optionally show a toast here
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(null);
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={ref} className="relative w-80 z-50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { if (query) setOpen(true); }}
          placeholder="Search global markets..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
        />
      </div>

      {open && query && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl glass border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 flex items-center justify-between">
            <span>Market Intelligence</span>
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          
          <div className="max-h-80 overflow-y-auto p-1">
            {results.length > 0 ? (
              <div className="space-y-1 mt-1">
                {results.map((item) => (
                  <div key={item.symbol} className="flex flex-col gap-2 p-3 rounded-lg hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-foreground">{item.symbol}</div>
                        <div className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">{item.type}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-mono">${item.price.toFixed(2)}</div>
                          <div className={cn("text-[10px] font-bold flex items-center justify-end gap-0.5", item.change >= 0 ? "text-accent" : "text-destructive")}>
                            {item.change >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                            {Math.abs(item.change)}%
                          </div>
                        </div>
                        <button
                          onClick={() => handleAdd(item)}
                          disabled={adding === item.symbol}
                          className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
                          title="Add to Watchlist"
                        >
                          {adding === item.symbol ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Math Analysis Row */}
                    <div className="flex items-center gap-3 bg-black/20 rounded pl-2 pr-3 py-1.5 overflow-hidden relative">
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        item.score >= 80 ? "bg-accent" : item.score >= 50 ? "bg-amber-500" : "bg-destructive"
                      )} />
                      <div className="text-[10px] text-muted-foreground w-12 truncate">{item.name}</div>
                      <div className="flex-1" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Quant Score:</span>
                        <span className={cn(
                          "text-[10px] font-bold",
                          item.score >= 80 ? "text-accent" : item.score >= 50 ? "text-amber-500" : "text-destructive"
                        )}>{item.score}/100</span>
                      </div>
                      <div className="h-3 w-px bg-white/10" />
                      <div className={cn(
                        "text-[9px] font-bold uppercase tracking-widest",
                        item.score >= 80 ? "text-accent" : item.score >= 50 ? "text-amber-500" : "text-destructive"
                      )}>
                        {item.signal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No market data found for "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
