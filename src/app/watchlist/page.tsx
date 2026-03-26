"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Eye, Plus, Trash2, Search, TrendingUp, TrendingDown, Loader2, Star } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";

interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  added_at: string;
}

const MARKET_DATA: Record<string, { price: number; change: number; name: string; sector: string }> = {
  AAPL: { price: 189.45, change: 2.31, name: "Apple Inc.", sector: "Technology" },
  MSFT: { price: 415.2, change: 0.87, name: "Microsoft Corp.", sector: "Technology" },
  NVDA: { price: 875.4, change: 4.12, name: "NVIDIA Corp.", sector: "Technology" },
  GOOGL: { price: 157.8, change: 0.9, name: "Alphabet Inc.", sector: "Technology" },
  AMZN: { price: 187.3, change: 0.0, name: "Amazon.com", sector: "Consumer" },
  TSLA: { price: 248.6, change: -3.1, name: "Tesla Inc.", sector: "Automotive" },
  META: { price: 502.3, change: -0.4, name: "Meta Platforms", sector: "Technology" },
  V: { price: 278.9, change: 0.61, name: "Visa Inc.", sector: "Financials" },
  JPM: { price: 198.4, change: 2.2, name: "JPMorgan Chase", sector: "Financials" },
  XOM: { price: 108.2, change: -1.2, name: "Exxon Mobil", sector: "Energy" },
  WMT: { price: 168.7, change: 1.1, name: "Walmart Inc.", sector: "Consumer" },
  BRK: { price: 381.6, change: -0.33, name: "Berkshire Hathaway", sector: "Financials" },
  GLD: { price: 185.6, change: 1.04, name: "SPDR Gold Shares", sector: "Commodities" },
  SLV: { price: 23.45, change: 0.82, name: "iShares Silver Trust", sector: "Commodities" },
  USO: { price: 76.12, change: -1.45, name: "United States Oil Fund", sector: "Commodities" },
  UNG: { price: 16.34, change: 2.11, name: "US Natural Gas Fund", sector: "Commodities" },
  CPER: { price: 25.67, change: 0.54, name: "US Copper Index Fund", sector: "Commodities" },
  ASML: { price: 892.3, change: 5.1, name: "ASML Holding", sector: "Technology" },
  NEE: { price: 62.4, change: -0.71, name: "NextEra Energy", sector: "Utilities" },
};

export default function WatchlistPage() {
  const { isGuest } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  async function addToWatchlist(ticker: string) {
    if (isGuest) return;
    setAdding(ticker);
    const md = MARKET_DATA[ticker];
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, name: md?.name || ticker, sector: md?.sector || "" }),
      });
      if (res.ok) {
        await fetchWatchlist();
        setSearchQuery("");
        setShowSearch(false);
      }
    } catch {
    } finally {
      setAdding(null);
    }
  }

  async function removeFromWatchlist(ticker: string) {
    try {
      await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      setItems(prev => prev.filter(i => i.ticker !== ticker));
    } catch {
    }
  }

  const watchedTickers = new Set(items.map(i => i.ticker));
  const searchResults = Object.entries(MARKET_DATA)
    .filter(([ticker, data]) =>
      !watchedTickers.has(ticker) &&
      (ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
       data.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .slice(0, 8);

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          leftContent={
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">WATCHLIST</h1>
              <span className="text-[10px] font-mono text-muted-foreground ml-2">{items.length} symbols</span>
            </div>
          }
          rightContent={
            <div className="flex items-center pr-4 border-r border-white/10">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-tight hover:bg-primary/20 transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Add Symbol
              </button>
            </div>
          }
        />

        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Guest banner */}
          {(mounted && isGuest) && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/80">
              <strong>Guest mode:</strong> Watchlist is read-only. Sign up to save your watchlist across sessions.
            </div>
          )}

          {/* Search / Add Panel */}
          {showSearch && (
            <div className="p-5 rounded-xl glass border border-primary/10 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by ticker or company name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>

              {searchQuery && searchResults.length > 0 && (
                <div className="space-y-1">
                  {searchResults.map(([ticker, data]) => (
                    <div key={ticker} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-primary w-12">{ticker}</span>
                        <div>
                          <div className="text-xs font-medium text-foreground">{data.name}</div>
                          <div className="text-[10px] text-muted-foreground">{data.sector}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono">${data.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToWatchlist(ticker)}
                          disabled={adding === ticker}
                          className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
                        >
                          {adding === ticker ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No matching symbols found.</p>
              )}
            </div>
          )}

          {/* Watchlist Table */}
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 glass rounded-xl">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Loading watchlist...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 glass rounded-xl">
              <Star className="h-10 w-10 text-muted-foreground/30" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">Your watchlist is empty</p>
                <p className="text-xs text-muted-foreground">Click &quot;Add Symbol&quot; above or use the heatmap on the Dashboard to add stocks.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-white/[0.02]">
                    {["Symbol", "Name", "Sector", "Price", "Change", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const md = MARKET_DATA[item.ticker];
                    const price = md?.price ?? 0;
                    const change = md?.change ?? 0;
                    return (
                      <tr key={item.id} className={cn("border-b border-border/50 hover:bg-white/[0.02] transition-colors", i % 2 === 0 ? "" : "bg-white/[0.01]")}>
                        <td className="px-5 py-4">
                          <span className="font-bold text-primary text-xs">{item.ticker}</span>
                        </td>
                        <td className="px-5 py-4 text-xs text-foreground font-medium">{item.name || md?.name || "—"}</td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10">{item.sector || md?.sector || "—"}</span>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono font-semibold">${price.toFixed(2)}</td>
                        <td className={cn("px-5 py-4 text-xs font-bold flex items-center gap-1", change >= 0 ? "text-accent" : "text-destructive")}>
                          {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {change >= 0 ? "+" : ""}{change}%
                        </td>
                        <td className="px-5 py-4">
                          {!isGuest && (
                            <button
                              onClick={() => removeFromWatchlist(item.ticker)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
