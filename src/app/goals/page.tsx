"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Target, Plus, Home, Rocket, Wallet, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: 1, title: "Early Retirement", target: 2500000, current: 1240000, icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
  { id: 2, title: "Alpine Residence", target: 850000, current: 210000, icon: Home, color: "text-accent", bg: "bg-accent/10" },
  { id: 3, title: "Junior Trust Fund", target: 150000, current: 45000, icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
];

export default function GoalsPage() {
  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          leftContent={
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">FINANCIAL GOALS</h1>
            </div>
          }
          rightContent={
            <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-tight hover:opacity-90 transition-all">
              <Plus className="h-3.5 w-3.5" /> Define New Goal
            </button>
          }
        />

        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GOALS.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={goal.id} className="p-6 rounded-2xl glass border border-white/5 space-y-6 hover:border-white/10 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-3 rounded-xl", goal.bg)}>
                      <goal.icon className={cn("h-6 w-6", goal.color)} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{Math.round(progress)}% Complete</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">{goal.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tighter text-foreground">${goal.current.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">of ${goal.target.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", goal.color.replace('text', 'bg'))}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                      <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +12% YoY</div>
                      <div>Est. Arrive 2034</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-8 rounded-3xl glass border border-primary/20 bg-primary/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">AI Goal Projection</h2>
                <p className="text-sm text-muted-foreground">Recursive analysis of current savings rate vs. target benchmarks.</p>
              </div>
              <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-muted-foreground">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Based on your current portfolio CAGR of 12.4% and monthly contribution of $2,500, you are <strong>on track</strong> to hit your &quot;Early Retirement&quot; goal 2.4 years ahead of schedule.
                </div>
                <div className="flex gap-4">
                  <div className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
                    Optimization Recommended
                  </div>
                </div>
              </div>
              <div className="h-32 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center italic text-muted-foreground/50 text-xs">
                Interactive Multi-Goal Timeline Visualization
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
