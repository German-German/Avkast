// ─────────────────────────────────────────────────────────────
//  Avkast Unified Client Brain — Memory Service
//  Persists ClientMemory to localStorage (client-side).
//  Server-side calls can import the schema but should hydrate
//  via the API route /api/memory when a DB is wired.
// ─────────────────────────────────────────────────────────────

import {
  ClientMemory,
  DecisionRecord,
  DecisionOutcome,
  ExplicitPreferences,
  HardConstraints,
  MemoryTimelineEntry,
  RiskTolerance,
  InvestmentStyle,
  createDefaultMemory,
  TaggedPref,
} from "@/lib/memory";

const STORAGE_KEY = "avkast_client_memory_v1";

// ── Persistence helpers ───────────────────────────────────────

function load(): ClientMemory {
  if (typeof window === "undefined") return createDefaultMemory();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultMemory();
    const parsed = JSON.parse(raw) as ClientMemory;
    // Basic version guard
    if (parsed.version !== 1) return createDefaultMemory();
    return parsed;
  } catch {
    return createDefaultMemory();
  }
}

function save(mem: ClientMemory): void {
  if (typeof window === "undefined") return;
  mem.lastUpdatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
}

function addTimelineEntry(
  mem: ClientMemory,
  entry: Omit<MemoryTimelineEntry, "id">
): void {
  mem.timeline.unshift({
    id: crypto.randomUUID(),
    ...entry,
  });
  // Keep max 200 entries
  if (mem.timeline.length > 200) mem.timeline.length = 200;
}

// ── Public API ────────────────────────────────────────────────

export const MemoryService = {
  /** Read the full memory object */
  get(): ClientMemory {
    return load();
  },

  /** Update one or more explicit preferences */
  updatePreferences(
    updates: Partial<ExplicitPreferences>,
    summary?: string
  ): ClientMemory {
    const mem = load();
    const now = new Date().toISOString();

    for (const key of Object.keys(updates) as (keyof ExplicitPreferences)[]) {
      const incoming = updates[key] as TaggedPref<any>;
      (mem.explicitPreferences as any)[key] = {
        ...incoming,
        source: "explicit",
        updatedAt: now,
      };
    }

    addTimelineEntry(mem, {
      type: "preference_change",
      summary: summary ?? `Updated ${Object.keys(updates).join(", ")}`,
      timestamp: now,
      source: "explicit",
    });

    save(mem);
    return mem;
  },

  /** Update hard constraints */
  updateConstraints(constraints: Partial<HardConstraints>, summary?: string): ClientMemory {
    const mem = load();
    const now = new Date().toISOString();
    Object.assign(mem.hardConstraints, constraints);
    addTimelineEntry(mem, {
      type: "constraint_added",
      summary: summary ?? `Hard constraint updated`,
      timestamp: now,
      source: "explicit",
    });
    save(mem);
    return mem;
  },

  /** Add a sector or ticker to the never-show blacklist */
  addHardExclusion(type: "sector" | "ticker", value: string): ClientMemory {
    const mem = load();
    const now = new Date().toISOString();

    if (type === "sector" && !mem.hardConstraints.excludedSectors.includes(value)) {
      mem.hardConstraints.excludedSectors.push(value);
    }
    if (type === "ticker" && !mem.hardConstraints.excludedTickers.includes(value)) {
      mem.hardConstraints.excludedTickers.push(value);
    }

    addTimelineEntry(mem, {
      type: "constraint_added",
      summary: `Hard exclusion added: ${value} (${type})`,
      timestamp: now,
      source: "explicit",
    });

    save(mem);
    return mem;
  },

  removeHardExclusion(type: "sector" | "ticker", value: string): ClientMemory {
    const mem = load();
    if (type === "sector") {
      mem.hardConstraints.excludedSectors = mem.hardConstraints.excludedSectors.filter(s => s !== value);
    }
    if (type === "ticker") {
      mem.hardConstraints.excludedTickers = mem.hardConstraints.excludedTickers.filter(t => t !== value);
    }
    save(mem);
    return mem;
  },

  /** Record a decision (approve/reject/ignore) and update behavioural profile */
  recordDecision(
    record: Omit<DecisionRecord, "id" | "timestamp">,
    outcome: DecisionOutcome
  ): ClientMemory {
    const mem = load();
    const now = new Date().toISOString();

    const full: DecisionRecord = {
      id: crypto.randomUUID(),
      ...record,
      outcome,
      timestamp: now,
    };

    mem.decisionHistory.unshift(full);
    if (mem.decisionHistory.length > 500) mem.decisionHistory.length = 500;

    // Re-compute behavioural inferences
    MemoryService._recomputeBehaviour(mem);

    addTimelineEntry(mem, {
      type: "decision",
      summary: `${outcome.toUpperCase()}: ${record.action} ${record.ticker} (conf: ${(record.confidenceScore * 100).toFixed(0)}%)`,
      timestamp: now,
      source: "inferred",
    });

    save(mem);
    return mem;
  },

  /** Recompute all inferred behavioural tags from decision history */
  _recomputeBehaviour(mem: ClientMemory): void {
    const history = mem.decisionHistory;
    if (history.length === 0) return;
    const now = new Date().toISOString();

    const approved = history.filter(d => d.outcome === "approved");
    const total = history.length;
    const rate = approved.length / total;

    mem.behaviouralProfile.acceptanceRate = {
      value: Math.round(rate * 100) / 100,
      source: "inferred",
      updatedAt: now,
      reason: `Based on ${total} recorded decisions`,
    };

    const volatileRejections = history.filter(
      d => d.outcome === "rejected" && d.marketCondition === "volatile"
    );
    if (volatileRejections.length >= 2) {
      mem.behaviouralProfile.sellsDuringVolatility = {
        value: true,
        source: "inferred",
        updatedAt: now,
        reason: `Rejected ${volatileRejections.length} signals during volatile markets`,
      };
    }

    const dividendApprovals = approved.filter(d =>
      d.reasoning.toLowerCase().includes("dividend")
    );
    mem.behaviouralProfile.prefersDividends = {
      value: dividendApprovals.length >= 2,
      source: "inferred",
      updatedAt: now,
      reason: `Approved ${dividendApprovals.length} dividend-related signals`,
    };

    const growthApprovals = approved.filter(d =>
      d.reasoning.toLowerCase().includes("growth") ||
      d.reasoning.toLowerCase().includes("tech")
    );
    mem.behaviouralProfile.prefersGrowth = {
      value: growthApprovals.length > dividendApprovals.length,
      source: "inferred",
      updatedAt: now,
      reason: `Growth signals approved: ${growthApprovals.length}`,
    };
  },

  /** Hard-reset all memory (privacy control) */
  reset(): ClientMemory {
    const fresh = createDefaultMemory();
    fresh.timeline[0].summary = "Memory fully reset by user request.";
    save(fresh);
    return fresh;
  },

  /** Export memory as downloadable JSON */
  export(): string {
    return JSON.stringify(load(), null, 2);
  },

  /** Build a compact context string for agent injection */
  getAgentContext(): string {
    const mem = load();
    const p = mem.explicitPreferences;
    const b = mem.behaviouralProfile;
    const c = mem.hardConstraints;

    const inferred: string[] = [];
    if (b.prefersDividends.value) inferred.push("prefers dividend income");
    if (b.prefersGrowth.value) inferred.push("growth-oriented");
    if (b.sellsDuringVolatility.value) inferred.push("sells during volatility");
    if (!b.prefersStability.value) inferred.push("willing to accept volatility");

    return [
      `Risk tolerance: ${p.riskTolerance.value}`,
      `Investment style: ${p.investmentStyle.value}`,
      `Time horizon: ${p.timeHorizon.value}`,
      `Min ESG score: ${p.esgMinScore.value}`,
      `Liquidity need: ${p.liquidityNeed.value}`,
      `Excluded sectors: ${c.excludedSectors.join(", ") || "none"}`,
      `Excluded tickers: ${c.excludedTickers.join(", ") || "none"}`,
      `Acceptance rate: ${(b.acceptanceRate.value * 100).toFixed(0)}%`,
      inferred.length ? `Inferred traits: ${inferred.join(", ")}` : "",
      p.recurringGoals.value.length ? `Goals: ${p.recurringGoals.value.join(", ")}` : "",
    ].filter(Boolean).join(" | ");
  },
};
