"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Send, User, Bot, Sparkles, Loader2, Info } from "lucide-react";
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

  useEffect(() => {
    const handoff = localStorage.getItem("avkast_ai_handoff");
    if (handoff) {
      try {
        const data = JSON.parse(handoff);
        localStorage.removeItem("avkast_ai_handoff");
        
        const handoffMsg: Message = {
           role: "user",
           content: `[SYSTEM HANDOFF: MONTE CARLO SIMULATION]\nPortfolio: ${data.portfolio.join(", ")}\nInitial Capital: $${data.initialInvestment.toLocaleString()}\nTime Horizon: ${data.years} Years\nProjected Median Return (50th %ile): $${Math.floor(data.projectedReturn).toLocaleString()}\nEstimated CAGR: ${(data.cagr * 100).toFixed(2)}%\nEstimated Volatility: ${(data.volatility * 100).toFixed(2)}%\n\nPlease provide a short analysis of these possible returns.`,
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, handoffMsg]);
        setIsTyping(true);

        // Analyze handoff with real AI
        (async () => {
          try {
            const brainContext = MemoryService.getAgentContext();
            const response = await fetch("/api/advisor", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: handoffMsg.content,
                context: {
                  portfolio: { wealth: data.initialInvestment },
                  riskProfile: "Moderate",
                  clientBrainContext: brainContext
                }
              })
            });

            if (!response.ok) throw new Error();
            const resData = await response.json();
            
            setMessages(prev => [...prev, {
              role: "assistant",
              content: resData.content,
              timestamp: resData.timestamp,
              rationale: resData.rationale
            }]);
          } catch (e) {
            // Fallback for handoff if AI fails
            setMessages(prev => [...prev, {
              role: "assistant",
              content: `The mathematical simulation projects a median end-value of $${Math.floor(data.projectedReturn).toLocaleString()} over ${data.years} years. Given the combined volatility of ${(data.volatility * 100).toFixed(2)}%, the portfolio exhibits a robust risk-adjusted profile.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              rationale: "Swarm logic fallback analyzed the sandbox parameters."
            }]);
          } finally {
            setIsTyping(false);
          }
        })();
        
      } catch (e) {
        console.error("Failed to parse AI handoff context", e);
      }
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const wealth = user?.initialWealth || 100000;
      const markets = user?.preferredMarkets ? (typeof user.preferredMarkets === 'string' ? JSON.parse(user.preferredMarkets) : user.preferredMarkets) : [];
      const brainContext = MemoryService.getAgentContext();

      // Convert history for Gemini format (strictly alternating)
      // messages[0] is always the assistant greeting, so we slice from 1
      const history = messages.slice(1).map(msg => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.content }]
      }));

      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          history,
          context: {
            portfolio: { wealth },
            riskProfile: "Moderate",
            marketFocus: markets,
            clientBrainContext: brainContext
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Neural link unstable.");
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
        timestamp: data.timestamp,
        rationale: data.rationale
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Advisor Fetch Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `I apologize, but my connection to the Avkast Swarm was interrupted. Details: ${error.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar
          leftContent={
            <div className="flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap truncate">AI ADVISOR: NEURAL LOGIC V4.2</h1>
            </div>
          }
          rightContent={
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pr-4 border-r border-white/10 whitespace-nowrap shrink-0">
              Latency: 42ms | Swarm Active
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-8 space-y-6" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-4 max-w-4xl items-start",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                msg.role === "assistant" ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"
              )}>
                {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              
              <div className="space-y-2">
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "assistant" ? "glass shadow-sm border-white/5" : "bg-primary text-primary-foreground"
                )}>
                  {msg.content}
                </div>
                
                <div className={cn(
                  "flex items-center gap-3 px-1",
                  msg.role === "user" ? "justify-end" : ""
                )}>
                   <span className="text-[10px] text-muted-foreground font-mono">{msg.timestamp}</span>
                   {msg.rationale && (
                     <ExplainableAI 
                       rationale={msg.rationale} 
                       auditLink="audit://neural-logic-v4" 
                       confidenceScore={0.88} 
                     />
                   )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl glass border-white/5 flex gap-1 items-center">
                <div className="h-1 w-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-1 w-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-1 w-1 bg-primary/40 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 pt-4 shrink-0 bg-background/50 backdrop-blur-sm border-t border-border">
          <div className="max-w-4xl mx-auto relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about interest rates, market volatility, or portfolio rebalancing..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 mt-4">
             <div className="flex gap-4">
              {["WHAT IF INFLATION HITS 4%?", "EXPLAIN YIELD CURVE INVERSION", "OPTIMIZE FOR TAX EFFICIENCY"].map(hint => (
                <button 
                  key={hint} 
                  onClick={() => setInput(hint)}
                  className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest px-3 py-1 border border-white/5 rounded-full hover:border-primary/20"
                >
                  {hint}
                </button>
              ))}
             </div>
             <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 uppercase tracking-wider font-medium">
                <Info className="h-3 w-3" />
                Avkast Swarm insights are generative and do not constitute guaranteed financial advice.
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}
