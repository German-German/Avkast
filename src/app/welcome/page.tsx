"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sparkles, ArrowRight, BarChart3, Brain, Shield, Crosshair, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WelcomePage() {
  const { user, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return null;

  const features = [
    { icon: Brain, title: "Neural Swarm Intelligence", desc: "Predictive modeling and scenario analysis driven by continuous market ingestion." },
    { icon: Crosshair, title: "Precision Rebalancing", desc: "Automated tax-loss harvesting and dynamic asset reallocation." },
    { icon: Shield, title: "Institutional Risk Guard", desc: "ESG-compliant boundaries with hard-constraint risk thresholds." }
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden selection:bg-primary/30">
      
      {/* Intense Cinematic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] animate-pulse mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] animate-pulse mix-blend-screen [animation-delay:2s]" />
        
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      {/* Top Banner */}
      <header className="relative z-10 w-full p-8 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-bold text-2xl tracking-tighter text-foreground">AVKAST</span>
          <span className="text-[10px] text-muted-foreground tracking-[0.4em] font-bold uppercase mt-1">
            Institutional
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Systems Online</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
        
        <div className={cn(
          "transition-all duration-1000 transform",
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        )}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest mb-8">
            <Sparkles className="h-3.5 w-3.5" /> Platform Initialization Complete
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-6 drop-shadow-sm">
            {isGuest ? "Welcome, Guest." : `Welcome back, ${user?.username}.`}
          </h1>
          
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-16">
            The mathematical engine is synchronized. Your portfolio is currently being analyzed across 12,000 synthetic market conditions to project optimal rebalancing pathways.
          </p>

          <button
            onClick={() => router.push("/")}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-bold uppercase tracking-widest overflow-hidden shadow-[0_0_40px_rgba(112,130,56,0.3)] hover:shadow-[0_0_60px_rgba(112,130,56,0.5)] transition-all hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
            Enter Workspace
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full transition-all duration-1000 delay-300 transform",
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        )}>
          {features.map((f, i) => (
            <div 
              key={f.title} 
              className="p-6 rounded-3xl glass border border-white/5 hover:border-primary/30 transition-all hover:bg-white/[0.04] group text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <f.icon className="h-8 w-8 text-primary mb-6" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-3">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <footer className={cn(
        "relative z-10 w-full p-8 flex justify-between items-end transition-all duration-1000 delay-500",
        mounted ? "opacity-100" : "opacity-0"
      )}>
        <div className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] max-w-[200px] leading-tight">
          Strictly Confidential. Mathematical models do not guarantee future performance.
        </div>
        <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2">
          Node_0x89A <ChevronRight className="h-3 w-3" /> Connect_OK
        </div>
      </footer>
    </main>
  );
}
