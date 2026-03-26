"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Send, User, Bot, Sparkles, Loader2, Info, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Topbar } from "@/components/dashboard/topbar";
import { ExplainableAI } from "@/components/shared/explainable-ai";
import { useAuth } from "@/contexts/auth-context";
import { MemoryService } from "@/services/memory.service";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  rationale?: string;
}

export default function AdvisorPage() {
  const { user, isGuest } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [marketDrawdown, setMarketDrawdown] = useState(0);
  const [savingsBoost, setSavingsBoost] = useState(0);
  const [inflationRate, setInflationRate] = useState(2.1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        role: "assistant",
        content: `Good morning. I'm synchronized with the Avkast Swarm. I see your ${isGuest ? "Trial" : "Institutional"} account is active. How can I assist your wealth strategy today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [isGuest]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const wealth = user?.initialWealth || 100000;
      const markets = user?.preferredMarkets ? (typeof user.preferredMarkets === 'string' ? JSON.parse(user.preferredMarkets) : user.preferredMarkets) : [];
      const brainContext = MemoryService.getAgentContext();

      // Ensure stable history construction
      // We start from the first 'user' message to satisfy Gemini requirements
      const messageHistory = [...messages, userMessage];
      const firstUserIndex = messageHistory.findIndex(m => m.role === "user");
      
      const history = (firstUserIndex !== -1 ? messageHistory.slice(firstUserIndex, -1) : [])
        .map(msg => ({
          role: msg.role === "assistant" ? "model" as const : "user" as const,
          parts: [{ text: msg.content }]
        }));

      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history,
          context: {
            portfolio: { wealth },
            riskProfile: "Moderate",
            marketFocus: markets,
            clientBrainContext: brainContext,
            scenarios: {
              marketDrawdown,
              savingsBoost,
              inflationRate
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || "Neural link unstable.");
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content,
        timestamp: data.timestamp,
        rationale: data.rationale
      }]);
    } catch (error: any) {
      console.error("Advisor Fetch Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `I’m temporarily unable to access live advisory intelligence. Please try again shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left: What-If Strategy Engine (Refined) */}
        <div className="w-85 border-r border-white/5 bg-white/[0.01] flex flex-col shrink-0 overflow-y-auto hidden xl:flex">
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-[10px] uppercase">
                <Zap className="h-3 w-3 fill-primary" /> Strategy Simulation
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Parametric Controls</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">Modify macro-economic assumptions to stress-test your wealth strategy in real-time.</p>
            </div>

            <div className="space-y-10 pt-4">
              {/* Market Drawdown */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Severe Market Dip</label>
                  <span className="text-xs font-mono font-bold text-destructive">-{marketDrawdown}%</span>
                </div>
                <input 
                  type="range" min="0" max="50" step="5"
                  value={marketDrawdown}
                  onChange={(e) => setMarketDrawdown(Number(e.target.value))}
                  className="w-full accent-destructive h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Savings Boost */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Capital Injection</label>
                  <span className="text-xs font-mono font-bold text-accent">+{savingsBoost}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="10"
                  value={savingsBoost}
                  onChange={(e) => setSavingsBoost(Number(e.target.value))}
                  className="w-full accent-accent h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Inflation Rate */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Annualized Inflation</label>
                  <span className="text-xs font-mono font-bold text-primary">{inflationRate}%</span>
                </div>
                <input 
                  type="range" min="0" max="15" step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                handleSend(`Analyze my strategy with a ${marketDrawdown}% drop, ${savingsBoost}% savings boost, and ${inflationRate}% inflation.`);
              }}
              className="w-full group relative overflow-hidden py-4 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Run Neural Analysis
              <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-auto p-8 border-t border-white/5 pb-12">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground">Recursive Swarm v4.2</div>
                  <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Status: Synchronized</div>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Main Chat Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
          <Topbar
            leftContent={
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                 <h1 className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap">NEURAL ADVISOR <span className="text-muted-foreground font-medium ml-2 opacity-50">V4.2</span></h1>
              </div>
            }
            rightContent={
              <div className="flex items-center gap-4 pr-4 border-r border-white/5 shrink-0 hidden md:flex">
                <div className="text-right">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Global Latency</div>
                  <div className="text-[10px] font-mono font-bold text-accent">42ms</div>
                </div>
                <div className="h-6 w-px bg-white/5" />
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Active Link</div>
              </div>
            }
          />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 scrollbar-hide pb-32" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex gap-4 max-w-5xl items-start group animation-slide-up",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                  msg.role === "assistant" 
                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm" 
                    : "bg-muted border-border text-muted-foreground shadow-sm"
                )}>
                  {msg.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                
                <div className={cn("space-y-3", msg.role === "user" ? "items-end flex flex-col" : "")}>
                  <div className={cn(
                    "p-5 rounded-2xl text-[13px] leading-relaxed shadow-lg max-w-2xl",
                    msg.role === "assistant" 
                      ? "glass border-white/5 bg-white/[0.03] text-foreground font-medium" 
                      : "bg-primary text-primary-foreground font-bold"
                  )}>
                    {msg.content}
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-4 px-1 opacity-60 group-hover:opacity-100 transition-opacity",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}>
                     <span className="text-[9px] text-muted-foreground font-mono font-bold tracking-widest">{msg.timestamp}</span>
                     {msg.rationale && (
                       <ExplainableAI 
                         rationale={msg.rationale} 
                         auditLink="audit://neural-logic-v4.2" 
                         confidenceScore={0.92} 
                       />
                     )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 animation-pulse">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <div className="p-5 rounded-2xl glass border-white/5 bg-white/[0.03] flex gap-1.5 items-center">
                  <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Input Area (Polished) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pt-4 bg-background/50 backdrop-blur-xl border-t border-white/5 z-20">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask the Swarm about Alpha strategies, yield inversion, or rebalancing..." 
                  className="relative w-full bg-black/40 border border-white/10 rounded-2xl py-4.5 pl-6 pr-16 text-[13px] focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-muted-foreground/30"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100"
                >
                  <Send className={cn("h-4.5 w-4.5", isTyping ? "animate-pulse" : "")} />
                </button>
              </div>

              <div className="flex flex-col items-center gap-3">
                 <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "WHAT IF INFLATION HITS 4%?", 
                    "OPTIMIZE TAX EFFICIENCY", 
                    "S&P 500 REBALANCING PLAN"
                  ].map(hint => (
                    <button 
                      key={hint} 
                      onClick={() => setInput(hint)}
                      className="text-[9px] font-bold text-muted-foreground/60 hover:text-primary hover:border-primary/30 transition-all uppercase tracking-widest px-4 py-2 border border-white/5 rounded-full bg-white/[0.01]"
                    >
                      {hint}
                    </button>
                  ))}
                 </div>
                 <p className="text-[9px] text-muted-foreground/40 flex items-center gap-1 uppercase tracking-[0.1em] font-bold">
                    <Info className="h-2.5 w-2.5" />
                    Generative Intelligence is advisory only. Not verified financial advice.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
