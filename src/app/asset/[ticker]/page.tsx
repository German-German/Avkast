"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ArrowLeft, TrendingUp, Activity, BarChart3, Clock } from "lucide-react";

export default function AssetPage() {
  const { ticker } = useParams();
  const router = useRouter();
  
  const symbol = typeof ticker === "string" ? ticker.toUpperCase() : "ASSET";

  // Mock data for the asset profile
  const asset = {
    symbol,
    name: "Corporate Entity",
    price: 184.23,
    change: "+2.4%",
    volatility: "14.2%",
    cagr: "12.8%",
    esgScore: 88,
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          leftContent={
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{asset.symbol} ANALYSIS</h1>
            </div>
          }
          rightContent={
             <div className="flex items-center gap-2 pr-4 border-r border-white/10">
               <span className="flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase">
                 <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> Live Pricing
               </span>
             </div>
          }
        />

        <div className="flex-1 p-8 space-y-8 overflow-y-auto w-full max-w-7xl mx-auto">
          
          {/* Header Card */}
          <div className="p-8 rounded-2xl glass border border-white/5 flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                <TrendingUp className="h-3 w-3" /> Strong Buy Signal
              </div>
              <h1 className="text-5xl font-extrabold tracking-tighter text-foreground mb-2">{asset.symbol}</h1>
              <h2 className="text-lg text-muted-foreground">{asset.name}</h2>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold text-foreground mb-1">${asset.price.toFixed(2)}</div>
              <div className="text-sm font-bold text-accent">{asset.change} Today</div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Volatility (1Y)", value: asset.volatility, icon: Activity },
              { label: "10Y CAGR", value: asset.cagr, icon: BarChart3 },
              { label: "ESG Score", value: `${asset.esgScore}/100`, icon: Clock },
              { label: "Swarm Confidence", value: "92%", icon: TrendingUp },
            ].map(stat => (
              <div key={stat.label} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between h-28 hover:bg-white/[0.04] transition-colors">
                 <stat.icon className="h-5 w-5 text-primary mb-2" />
                 <div>
                   <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                   <div className="text-xl font-bold text-foreground mt-0.5">{stat.value}</div>
                 </div>
              </div>
            ))}
          </div>

          {/* Placeholder for Advanced Charts (SVG Mock) */}
          <div className="p-8 rounded-2xl glass border border-white/5 h-96 flex flex-col relative overflow-hidden group">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground z-10 mb-8">Performance Trajectory</h3>
            <div className="flex-1 rounded-xl border border-white/5 border-dashed flex items-center justify-center relative bg-black/20">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/30">Chart Neural Block</p>
              </div>
              
              {/* Aesthetic Mock Line */}
              <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                 <path d="M 0 250 Q 200 280 400 150 T 800 50 T 1000 20" fill="none" stroke="rgb(112,130,56)" strokeWidth="4" className="drop-shadow-[0_0_15px_rgba(112,130,56,0.8)]" />
                 <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(112,130,56)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="rgb(112,130,56)" stopOpacity="0" />
                 </linearGradient>
                 <path d="M 0 300 L 0 250 Q 200 280 400 150 T 800 50 T 1000 20 L 1000 300 Z" fill="url(#glow)" />
              </svg>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
