"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useMemory } from "@/hooks/use-memory";
import { Topbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";
import {
  UserCircle, Shield, Brain, Clock, Trash2, Download,
  Plus, X, ChevronRight, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2,
} from "lucide-react";
import type { RiskTolerance, InvestmentStyle, LiquidityNeed, TimeHorizon } from "@/lib/memory";

const LABEL: Record<string, string> = {
  conservative: "Conservative", moderate: "Moderate", aggressive: "Aggressive",
  growth: "Growth", value: "Value", dividend: "Dividend", blended: "Blended", index: "Index",
  low: "Low", medium: "Medium", high: "High",
  short: "Short Term (<2yr)", long: "Long Term (>7yr)",
};

const COMMON_SECTORS = ["Tobacco", "Weapons & Defense", "Fossil Fuels", "Gambling", "Alcohol", "Cannabis"];

function InferredBadge({ reason }: { reason?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded" title={reason}>
      <Brain className="h-2.5 w-2.5" /> Inferred
    </span>
  );
}

function SourceBadge({ source, reason }: { source: "explicit" | "inferred"; reason?: string }) {
  return source === "inferred" ? <InferredBadge reason={reason} /> : null;
}

export default function SettingsPage() {
  const {
    memory, updatePreferences, updateConstraints,
    addExclusion, removeExclusion, resetMemory, exportMemory,
  } = useMemory();

  const [tab, setTab] = useState<"preferences" | "constraints" | "behaviour" | "timeline">("preferences");
  const [newSector, setNewSector] = useState("");
  const [newTicker, setNewTicker] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /** Hydration-safe date formatter — returns empty string on server to avoid mismatch */
  const formatDate = (iso: string) => {
    if (!mounted) return "—";
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  const formatDateTime = (iso: string) => {
    if (!mounted) return "—";
    return new Date(iso).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const p = memory.explicitPreferences;
  const b = memory.behaviouralProfile;
  const c = memory.hardConstraints;

  function handleDownload() {
    const blob = new Blob([exportMemory()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avkast-memory-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return; }
    resetMemory();
    setResetConfirm(false);
  }

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Topbar
          leftContent={
            <div className="flex items-center gap-3">
              <UserCircle className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">PLATFORM SETTINGS</h1>
            </div>
          }
          rightContent={
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button
                onClick={handleReset}
                className={cn(
                  "flex items-center gap-2 h-8 px-3 rounded-lg border text-xs font-bold uppercase transition-all",
                  resetConfirm
                    ? "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" /> {resetConfirm ? "Confirm Reset" : "Reset Memory"}
              </button>
              {resetConfirm && (
                <button onClick={() => setResetConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              )}
            </div>
          }
        />

        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Memory health banner */}
          <div className="p-4 rounded-xl glass flex items-center gap-4 border-l-2 border-primary">
            <Brain className="h-6 w-6 text-primary shrink-0" />
            <div>
              <div className="text-sm font-bold text-foreground">Client Brain Active</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground/80">{mounted ? memory.decisionHistory.length : "0"}</span> decisions tracked
                <span className="opacity-40">·</span>
                Last updated <span className="font-bold text-foreground/80">{formatDate(memory.lastUpdatedAt)}</span>
                <span className="opacity-40">·</span>
                <span className="font-bold text-foreground/80">
                  {mounted ? Object.values(memory.behaviouralProfile).filter((v: any) => v.source === "inferred").length : "0"}
                </span> inferred traits
              </div>
            </div>
            <div className="ml-auto text-[10px] font-mono text-muted-foreground">v{memory.version}</div>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 border-b border-border">
            {(["preferences", "constraints", "behaviour", "timeline"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-5 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all -mb-px",
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Preferences Tab ── */}
          {tab === "preferences" && (
            <div className="space-y-6">
              {/* Risk Tolerance */}
              <div className="p-6 rounded-xl glass space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Risk Tolerance</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Your overall appetite for portfolio risk</p>
                  </div>
                  <SourceBadge source={p.riskTolerance.source} reason={p.riskTolerance.reason} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(["conservative", "moderate", "aggressive"] as RiskTolerance[]).map(v => (
                    <button
                      key={v}
                      onClick={() => updatePreferences({ riskTolerance: { value: v, source: "explicit", updatedAt: new Date().toISOString() } })}
                      className={cn(
                        "px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all border",
                        p.riskTolerance.value === v
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {LABEL[v]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Style */}
              <div className="p-6 rounded-xl glass space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Investment Style</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">What you prioritise in security selection</p>
                  </div>
                  <SourceBadge source={p.investmentStyle.source} reason={p.investmentStyle.reason} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["growth", "value", "dividend", "blended", "index"] as InvestmentStyle[]).map(v => (
                    <button
                      key={v}
                      onClick={() => updatePreferences({ investmentStyle: { value: v, source: "explicit", updatedAt: new Date().toISOString() } })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all border",
                        p.investmentStyle.value === v
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {LABEL[v]}
                    </button>
                  ))}
                </div>
              </div>

              {/* ESG Min Score */}
              <div className="p-6 rounded-xl glass space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Minimum ESG Score</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Filter out any security scoring below this threshold</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{p.esgMinScore.value}</span>
                </div>
                <input
                  type="range" min={0} max={100} step={5}
                  value={p.esgMinScore.value}
                  onChange={e => updatePreferences({ esgMinScore: { value: Number(e.target.value), source: "explicit", updatedAt: new Date().toISOString() } })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0 — No filter</span><span>50 — Moderate</span><span>100 — Strict</span>
                </div>
              </div>

              {/* Time Horizon + Liquidity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-xl glass space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Time Horizon</h3>
                  <div className="flex flex-col gap-2">
                    {(["short", "medium", "long"] as TimeHorizon[]).map(v => (
                      <button
                        key={v}
                        onClick={() => updatePreferences({ timeHorizon: { value: v, source: "explicit", updatedAt: new Date().toISOString() } })}
                        className={cn(
                          "px-4 py-2.5 rounded-lg text-xs font-bold text-left flex items-center justify-between transition-all border",
                          p.timeHorizon.value === v
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {LABEL[v] ?? v}
                        {p.timeHorizon.value === v && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-xl glass space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Liquidity Need</h3>
                  <div className="flex flex-col gap-2">
                    {(["low", "medium", "high"] as LiquidityNeed[]).map(v => (
                      <button
                        key={v}
                        onClick={() => updatePreferences({ liquidityNeed: { value: v, source: "explicit", updatedAt: new Date().toISOString() } })}
                        className={cn(
                          "px-4 py-2.5 rounded-lg text-xs font-bold text-left flex items-center justify-between transition-all border",
                          p.liquidityNeed.value === v
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {LABEL[v]}
                        {p.liquidityNeed.value === v && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recurring Goals */}
              <div className="p-6 rounded-xl glass space-y-4">
                <h3 className="text-sm font-bold text-foreground">Recurring Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {p.recurringGoals.value.map((g) => (
                    <span key={g} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                      {g}
                      <button onClick={() => updatePreferences({ recurringGoals: { value: p.recurringGoals.value.filter(x => x !== g), source: "explicit", updatedAt: new Date().toISOString() } })}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {p.recurringGoals.value.length === 0 && <span className="text-xs text-muted-foreground">No goals set yet.</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="e.g. Retire at 60..."
                    value={newGoal}
                    onChange={e => setNewGoal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && newGoal.trim()) {
                        updatePreferences({ recurringGoals: { value: [...p.recurringGoals.value, newGoal.trim()], source: "explicit", updatedAt: new Date().toISOString() } });
                        setNewGoal("");
                      }
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <button
                    onClick={() => {
                      if (!newGoal.trim()) return;
                      updatePreferences({ recurringGoals: { value: [...p.recurringGoals.value, newGoal.trim()], source: "explicit", updatedAt: new Date().toISOString() } });
                      setNewGoal("");
                    }}
                    className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Constraints Tab ── */}
          {tab === "constraints" && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80">
                  Hard constraints are <strong>absolute rules</strong> — the AI will never recommend a security that violates them, regardless of confidence score.
                </p>
              </div>

              {/* Excluded Sectors */}
              <div className="p-6 rounded-xl glass space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Excluded Sectors</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SECTORS.map(s => {
                    const active = c.excludedSectors.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => active ? removeExclusion("sector", s) : addExclusion("sector", s)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold uppercase border transition-all",
                          active
                            ? "bg-destructive/10 border-destructive/30 text-destructive"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {active && <span className="mr-1">✗</span>}{s}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Add custom sector..."
                    value={newSector}
                    onChange={e => setNewSector(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newSector.trim()) { addExclusion("sector", newSector.trim()); setNewSector(""); } }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <button
                    onClick={() => { if (!newSector.trim()) return; addExclusion("sector", newSector.trim()); setNewSector(""); }}
                    className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Excluded Tickers */}
              <div className="p-6 rounded-xl glass space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-bold text-foreground">Excluded Tickers</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.excludedTickers.length === 0 && <span className="text-xs text-muted-foreground">No tickers excluded.</span>}
                  {c.excludedTickers.map(t => (
                    <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive">
                      {t}
                      <button onClick={() => removeExclusion("ticker", t)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="e.g. MO (Altria)..."
                    value={newTicker}
                    onChange={e => setNewTicker(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === "Enter" && newTicker.trim()) { addExclusion("ticker", newTicker.trim()); setNewTicker(""); } }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <button
                    onClick={() => { if (!newTicker.trim()) return; addExclusion("ticker", newTicker.trim()); setNewTicker(""); }}
                    className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Position limits */}
              <div className="p-6 rounded-xl glass space-y-4">
                <h3 className="text-sm font-bold text-foreground">Position Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Max Single Position</span>
                      <span className="font-bold text-foreground">{c.maxPositionPct}%</span>
                    </div>
                    <input
                      type="range" min={5} max={50} step={1}
                      value={c.maxPositionPct}
                      onChange={e => updateConstraints({ maxPositionPct: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Min Cash Buffer</span>
                      <span className="font-bold text-foreground">${c.minimumCashBuffer.toLocaleString()}</span>
                    </div>
                    <input
                      type="range" min={0} max={500000} step={10000}
                      value={c.minimumCashBuffer}
                      onChange={e => updateConstraints({ minimumCashBuffer: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Behaviour Tab ── */}
          {tab === "behaviour" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                <Brain className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  These traits are <strong className="text-amber-400">inferred</strong> from your decision history and are automatically updated. They influence AI recommendations but can be overridden at any time.
                </p>
              </div>

              {Object.entries(b).map(([key, pref]) => {
                const p = pref as { value: boolean | number; source: "explicit" | "inferred"; updatedAt: string; reason?: string };
                const label: Record<string, string> = {
                  acceptanceRate: "Recommendation Acceptance Rate",
                  sellsDuringVolatility: "Tends to Exit During Volatility",
                  prefersDividends: "Prefers Dividend Income",
                  prefersGrowth: "Prefers Growth Stocks",
                  prefersStability: "Prefers Capital Stability",
                };
                return (
                  <div key={key} className="p-5 rounded-xl glass flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{label[key] ?? key}</span>
                        <InferredBadge reason={p.reason} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{p.reason}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {typeof p.value === "boolean" ? (
                        <span className={cn("text-sm font-bold", p.value ? "text-accent" : "text-muted-foreground")}>
                          {p.value ? "YES" : "NO"}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-primary">{(p.value as number * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Timeline Tab ── */}
          {tab === "timeline" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Memory Timeline</h2>
                <span className="text-[10px] text-muted-foreground">{memory.timeline.length} entries</span>
              </div>
              <div className="space-y-2">
                {memory.timeline.map((entry, i) => (
                  <div key={entry.id} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center shrink-0 border text-[9px] font-bold",
                        entry.source === "inferred"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-primary/10 border-primary/20 text-primary"
                      )}>
                        {entry.source === "inferred" ? <Brain className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      {i < memory.timeline.length - 1 && <div className="w-px h-full bg-white/5 flex-1 mt-1 min-h-4" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="text-xs font-medium text-foreground">{entry.summary}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {formatDateTime(entry.timestamp)}
                        </p>
                        {entry.source === "inferred" && <InferredBadge />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
