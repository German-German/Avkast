"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ExplainableAI } from "@/components/shared/explainable-ai";
import { useMemory } from "@/hooks/use-memory";
import { ShieldAlert, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Topbar } from "@/components/dashboard/topbar";

interface Task {
  id: string;
  ticker: string;
  action: string;
  confidence_score: number;
  urgency: string;
  reasoning: string;
  source_agents: string[];
  timestamp: string;
  status: "pending_approval" | "viewed" | "completed" | "rejected";
}

type LocalStatus = Record<string, "approved" | "rejected" | null>;

export default function TasksPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<LocalStatus>({});
  const { recordDecision } = useMemory();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Failed to synchronize with Swarm memory.");
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  function handleDecision(task: Task, outcome: "approved" | "rejected") {
    setLocalStatus(prev => ({ ...prev, [task.id]: outcome }));
    recordDecision(
      {
        ticker: task.ticker,
        action: task.action,
        confidenceScore: task.confidence_score,
        reasoning: task.reasoning,
        outcome,
      },
      outcome
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_approval": return <ShieldAlert className="h-4 w-4 text-primary" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case "viewed": return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          leftContent={
            <h1 className="text-xl font-bold tracking-tight text-foreground">SWARM COMMAND: TASKS & SIGNALS</h1>
          }
          rightContent={
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Sync Status:</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> Live Connected
              </span>
            </div>
          }
        />

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Summary Row */}
          {!loading && data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard label="Portfolio Value" value={`$${data.portfolio_summary.total_value_usd.toLocaleString()}`} />
              <MetricCard label="ESG Alignment" value={`${data.portfolio_summary.esg_alignment_score}/100`} />
              <MetricCard label="Active Signals" value={data.active_signals.length.toString()} />
              <MetricCard label="Risk Profile" value={data.portfolio_summary.risk_profile} />
            </div>
          )}

          {/* Task List */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Decision Queue</h2>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 glass rounded-xl">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium animate-pulse">Syncing with Swarm Memory...</p>
              </div>
            ) : error ? (
              <div className="p-8 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data?.active_signals.map((task: Task) => {
                  const decided = localStatus[task.id];
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "p-6 rounded-xl glass border transition-all group",
                        decided === "approved" ? "border-accent/30 bg-accent/5" :
                        decided === "rejected" ? "border-destructive/30 bg-destructive/5 opacity-60" :
                        "border-white/5 hover:border-primary/20"
                      )}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight",
                              task.action === "BUY" ? "bg-accent/10 text-accent" :
                              task.action === "REBALANCE" ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground"
                            )}>
                              {task.action}
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-foreground">{task.ticker}</h3>
                            <div className="h-4 w-[1px] bg-white/10 mx-1" />
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {decided === "approved"
                                ? <CheckCircle2 className="h-4 w-4 text-accent" />
                                : decided === "rejected"
                                  ? <AlertCircle className="h-4 w-4 text-destructive" />
                                  : getStatusIcon(task.status)}
                              <span className="capitalize">
                                {decided ?? task.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">{task.reasoning}</p>
                          <div className="flex items-center gap-4 pt-1">
                            <ExplainableAI
                              rationale={task.reasoning}
                              auditLink={`audit://${task.id}`}
                              confidenceScore={task.confidence_score}
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Agents:</span>
                              <div className="flex -space-x-2">
                                {task.source_agents.map((agent: string) => (
                                  <div key={agent} className="h-5 w-5 rounded-full bg-primary/20 border border-background flex items-center justify-center text-[8px] font-bold text-primary ring-1 ring-primary/20">
                                    {agent[0]}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {decided ? (
                            <span className={cn(
                              "px-5 py-2 rounded-md text-xs font-bold uppercase tracking-tight",
                              decided === "approved" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                            )}>
                              {decided}
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleDecision(task, "approved")}
                                className="px-5 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold uppercase tracking-tight hover:opacity-90 transition-opacity"
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => handleDecision(task, "rejected")}
                                className="px-5 py-2 rounded-md bg-white/5 border border-white/10 text-foreground text-xs font-bold uppercase tracking-tight hover:bg-white/10 transition-all"
                              >
                                REJECT
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
