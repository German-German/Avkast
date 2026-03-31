"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Newspaper, Clock, TrendingUp, TrendingDown, Zap, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: "MARKET" | "CRYPTO" | "PORTFOLIO" | "ECONOMY";
  impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (error) {
      console.error("Failed to fetch news", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const filteredNews = filter === "ALL" ? news : news.filter(n => n.category === filter);

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          leftContent={
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Global Intelligence Feed</h1>
            </div>
          }
        />

        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["ALL", "MARKET", "ECONOMY", "CRYPTO", "PORTFOLIO"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                  filter === cat 
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(112,130,56,0.2)]" 
                    : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-32 w-full glass rounded-2xl animate-pulse" />
                ))
              ) : filteredNews.map((item) => (
                <div key={item.id} className="group p-6 rounded-2xl glass border border-white/5 hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest",
                      item.impact === "POSITIVE" ? "bg-accent/10 text-accent" : 
                      item.impact === "NEGATIVE" ? "bg-destructive/10 text-destructive" : 
                      "bg-white/10 text-muted-foreground"
                    )}>
                      {item.category} • {item.impact}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.time}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.source}</span>
                    <button className="text-[10px] font-bold text-primary group-hover:translate-x-1 transition-transform uppercase tracking-widest">
                      Read Full Analysis →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar for News Page */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Market Sentiment
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Institutional Bias</span>
                    <span className="text-sm font-bold text-accent uppercase">Bullish</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: "72%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Neural swarm analysis indicates a 72% probability of continued upside momentum in tech and renewables over the next 48 hours.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass border border-white/5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Trending Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {["#RatePause", "#AIInfrastructure", "#GreenEnergy", "#BTC", "#EarningSeason"].map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/5 text-muted-foreground border border-white/10 hover:border-primary/30 transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
