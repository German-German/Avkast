"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Send, User, Bot, Sparkles, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplainableAI } from "@/components/shared/explainable-ai";

const RANDOM_RESPONSES = [
  "Based on current macro-liquidity shifts, I recommend increasing exposure to tech-heavy ETFs. The risk-adjusted return profile looks optimal for the next quarter.",
  "I've analyzed your current portfolio against the overnight volatility in Asian markets. Consider a 50bps hedging strategy using emerging market bonds.",
  "Fundamental analysis suggests that Apple's recent R&D cycle is undervalued. A modular BUY entry at current levels is advised by the swarm.",
  "Sentiment signals indicate 'Over-Exuberance' in the EV sector. This might be a strategic window to trim positions and lock in 15% gains.",
  "The Nordic Real Estate market shows signs of a liquidity crunch. I've initiated a stress-test simulation relative to your Nordic holdings.",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  rationale?: string;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Good morning. I'm synchronized with the Avkast Swarm. How can I assist your wealth strategy today?",
      timestamp: "08:32 AM",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Randomize Response (Future Dev Idea)
    setTimeout(() => {
      const randomContent = RANDOM_RESPONSES[Math.floor(Math.random() * RANDOM_RESPONSES.length)];
      const assistantMessage: Message = {
        role: "assistant",
        content: randomContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rationale: "Analysis of recursive swarm intelligence cross-referenced with your explicit preferences."
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <h1 className="text-xl font-bold tracking-tight text-foreground">AI ADVISOR: NEURAL LOGIC V4.2</h1>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Latency: 42ms | Swarm Active
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-4 max-w-4xl",
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
          <div className="flex justify-center gap-4 mt-4">
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
        </div>
      </div>
    </main>
  );
}
