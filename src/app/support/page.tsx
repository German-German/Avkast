"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { HelpCircle, Mail, MessageSquare, Phone, Globe, Shield, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  { q: "How does the AI Swarm allocate risk?", a: "The swarm uses recursive neural analysis to simulate 10,000 market paths, selecting the most stable trajectory based on your memory preferences." },
  { q: "What are 'Hard Constraints'?", a: "These are absolute mathematical filters that prevent the AI from ever suggesting specific sectors or tickers, regardless of their performance." },
  { q: "Can I export my analytical data?", a: "Yes, use the 'Export' feature in Settings to download your full Unified Client Brain in JSON format." },
];

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          leftContent={
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">INSTITUTIONAL SUPPORT</h1>
            </div>
          }
          rightContent={null}
        />

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Channels */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-2xl glass border border-white/5 space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Direct Priority Access</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 transition-colors hover:text-primary group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">priority@avkast.ai</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Response in < 2h</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 transition-colors hover:text-primary group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">+1 (800) AVKAST-AI</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Institutional Desk</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 transition-colors hover:text-primary group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Secure Global Chat</div>
                      <div className="text-[10px] text-muted-foreground uppercase">24/7 Active Neural Link</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <Shield className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">System Health</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">AI Swarm Status</span>
                    <span className="text-accent font-bold">OPERATIONAL</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Neural Persistence</span>
                    <span className="text-accent font-bold">STABLE</span>
                 </div>
              </div>
            </div>

            {/* Support Form & FAQ */}
            <div className="lg:col-span-2 space-y-8">
               <div className="p-8 rounded-2xl glass border border-white/5 space-y-6">
                 <h2 className="text-xl font-bold tracking-tight text-foreground">Submit Priority Ticket</h2>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50">
                          <option>Portfolio Realignment Query</option>
                          <option>AI Model Anomaly</option>
                          <option>Account Sync Issue</option>
                          <option>Custom Modification Request</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority Level</label>
                        <div className="flex gap-2">
                           <span className="px-3 py-2 bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-bold rounded uppercase">Immediate</span>
                           <span className="px-3 py-2 bg-white/5 text-muted-foreground border border-white/10 text-[10px] font-bold rounded uppercase">Standard</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                      <textarea 
                        rows={4}
                        placeholder="Detail your inquiry..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/30"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={submitted}
                      className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      {submitted ? (
                        <><CheckCircle2 className="h-4 w-4" /> Message Transmitted</>
                      ) : (
                        <><Send className="h-4 w-4" /> Initiate Priority Send</>
                      )}
                    </button>
                 </form>
               </div>

               <div className="space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Knowledge Matrix</h2>
                  <div className="grid gap-3">
                     {FAQ_ITEMS.map((item, i) => (
                       <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                         <div className="text-sm font-bold text-foreground">{item.q}</div>
                         <div className="text-xs text-muted-foreground leading-relaxed">{item.a}</div>
                       </div>
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
