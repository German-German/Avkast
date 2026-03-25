"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sparkles, ArrowRight, BarChart3, Brain, Shield } from "lucide-react";

export default function WelcomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return null;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px] animate-pulse [animation-delay:1s]" />
      </div>

      <div
        className="relative text-center max-w-lg space-y-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
      >
        {/* Icon */}
        <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>

        {/* Greeting */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">
            Welcome{user?.username ? `, ${user.username}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your Avkast Intelligence platform is ready. AI-powered portfolio management, real-time signals, and institutional-grade insights await.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: BarChart3, label: "Portfolio Analytics", desc: "Real-time P&L tracking" },
            { icon: Brain, label: "AI Advisor", desc: "Neural swarm intelligence" },
            { icon: Shield, label: "Risk Management", desc: "ESG-compliant screening" },
          ].map(f => (
            <div key={f.label} className="p-4 rounded-xl glass border border-white/5 space-y-2">
              <f.icon className="h-6 w-6 text-primary mx-auto" />
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground">{f.label}</div>
              <div className="text-[9px] text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          className="mx-auto flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all group"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Branding */}
        <div className="space-y-1">
          <div className="text-lg font-bold tracking-tighter text-foreground/30">AVKAST</div>
          <div className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.3em]">Intelligence Platform v4.2</div>
        </div>
      </div>
    </main>
  );
}
