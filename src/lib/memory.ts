// ─────────────────────────────────────────────────────────────
//  Avkast Unified Client Brain — Memory Schema
//  All preferences are tagged as "explicit" (user-set) or
//  "inferred" (derived from behaviour). Inferred prefs are
//  always reversible and clearly labelled in the UI.
// ─────────────────────────────────────────────────────────────

export type PreferenceSource = "explicit" | "inferred";

export interface TaggedPref<T> {
  value: T;
  source: PreferenceSource;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Human-readable explanation of why this was inferred (if inferred) */
  reason?: string;
}

// ── Hard constraints ────────────────────────────────────────

export interface HardConstraints {
  /** Sectors never to recommend, e.g. "Tobacco", "Weapons" */
  excludedSectors: string[];
  /** Individual tickers to blacklist */
  excludedTickers: string[];
  /** Max single-position size as percent of portfolio (0-100) */
  maxPositionPct: number;
  /** Minimum liquidity buffer kept in cash (USD) */
  minimumCashBuffer: number;
}

// ── Explicit Preferences ─────────────────────────────────────

export type RiskTolerance = "conservative" | "moderate" | "aggressive";
export type InvestmentStyle = "growth" | "value" | "dividend" | "blended" | "index";
export type LiquidityNeed = "low" | "medium" | "high";
export type TimeHorizon = "short" | "medium" | "long";

export interface ExplicitPreferences {
  riskTolerance: TaggedPref<RiskTolerance>;
  investmentStyle: TaggedPref<InvestmentStyle>;
  esgMinScore: TaggedPref<number>;           // 0-100
  preferredSectors: TaggedPref<string[]>;
  liquidityNeed: TaggedPref<LiquidityNeed>;
  timeHorizon: TaggedPref<TimeHorizon>;
  currency: TaggedPref<string>;              // ISO 4217 e.g. "USD"
  recurringGoals: TaggedPref<string[]>;      // e.g. ["Retire at 60", "Fund education"]
}

// ── Inferred Behavioural Profile ─────────────────────────────

export interface BehaviouralProfile {
  /** How often user accepts AI recommendations (0-1) */
  acceptanceRate: TaggedPref<number>;
  /** Whether user tends to sell during high-volatility periods */
  sellsDuringVolatility: TaggedPref<boolean>;
  /** Whether user prefers dividend income */
  prefersDividends: TaggedPref<boolean>;
  /** Whether user prefers growth stocks over value */
  prefersGrowth: TaggedPref<boolean>;
  /** Whether user prefers capital stability over returns */
  prefersStability: TaggedPref<boolean>;
}

// ── Decision History ─────────────────────────────────────────

export type DecisionOutcome = "approved" | "rejected" | "ignored";

export interface DecisionRecord {
  id: string;
  ticker: string;
  action: string;
  confidenceScore: number;
  reasoning: string;
  outcome: DecisionOutcome;
  timestamp: string;
  /** Market conditions tag */
  marketCondition?: "bull" | "bear" | "sideways" | "volatile";
}

// ── Memory Timeline Entry ────────────────────────────────────

export interface MemoryTimelineEntry {
  id: string;
  type: "preference_change" | "decision" | "constraint_added" | "reset";
  summary: string;
  timestamp: string;
  source: PreferenceSource;
}

// ── Root Memory Object ───────────────────────────────────────

export interface ClientMemory {
  version: 1;
  userId: string;
  createdAt: string;
  lastUpdatedAt: string;
  hardConstraints: HardConstraints;
  explicitPreferences: ExplicitPreferences;
  behaviouralProfile: BehaviouralProfile;
  decisionHistory: DecisionRecord[];
  timeline: MemoryTimelineEntry[];
}

// ── Factory: default empty memory ────────────────────────────

export function createDefaultMemory(userId: string = "local-user"): ClientMemory {
  const now = new Date().toISOString();
  const explicit = (value: any, source: PreferenceSource = "explicit"): TaggedPref<any> => ({
    value,
    source,
    updatedAt: now,
  });

  return {
    version: 1,
    userId,
    createdAt: now,
    lastUpdatedAt: now,
    hardConstraints: {
      excludedSectors: [],
      excludedTickers: [],
      maxPositionPct: 20,
      minimumCashBuffer: 50000,
    },
    explicitPreferences: {
      riskTolerance: explicit("moderate"),
      investmentStyle: explicit("blended"),
      esgMinScore: explicit(60),
      preferredSectors: explicit([]),
      liquidityNeed: explicit("medium"),
      timeHorizon: explicit("long"),
      currency: explicit("USD"),
      recurringGoals: explicit([]),
    },
    behaviouralProfile: {
      acceptanceRate: { value: 0.5, source: "inferred", updatedAt: now, reason: "Default neutral prior" },
      sellsDuringVolatility: { value: false, source: "inferred", updatedAt: now, reason: "No volatility events yet" },
      prefersDividends: { value: false, source: "inferred", updatedAt: now, reason: "Needs more decision history" },
      prefersGrowth: { value: true, source: "inferred", updatedAt: now, reason: "Default long-horizon prior" },
      prefersStability: { value: false, source: "inferred", updatedAt: now, reason: "Needs more decision history" },
    },
    decisionHistory: [],
    timeline: [
      {
        id: "init",
        type: "preference_change",
        summary: "Client Brain initialised with default preferences.",
        timestamp: now,
        source: "explicit",
      },
    ],
  };
}
