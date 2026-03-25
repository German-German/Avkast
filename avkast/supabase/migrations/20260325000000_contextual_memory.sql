-- Contextual Memory & Audit Trail for Avkast

-- User Preferences (Explicit & Inferred)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    explicit_constraints JSONB DEFAULT '{}', -- e.g., {"no_tobacco": true, "max_crypto": 0.05}
    inferred_behaviors JSONB DEFAULT '{}', -- e.g., {"panic_sell_threshold": 0.1, "risk_appetite": "moderate"}
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Decisions (Core Summary)
CREATE TABLE IF NOT EXISTS agent_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL,
    agent_id TEXT NOT NULL, -- orchestrator, macro, fundamental, sentiment
    recommendation TEXT NOT NULL,
    confidence_score FLOAT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, executed, rejected, shadow
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decision Artifacts (Audit Trail)
CREATE TABLE IF NOT EXISTS decision_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES agent_decisions(id) ON DELETE CASCADE,
    data_sources JSONB DEFAULT '[]', -- List of document UUIDs or API endpoints
    rationale TEXT NOT NULL, -- "Why this?" explanation
    agent_confidence_scores JSONB DEFAULT '{}', -- Granular scores from all swarm agents
    audit_link TEXT, -- Hidden UUID link to machine-readable audit trail
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (2026 Regulatory Compliance)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_artifacts ENABLE ROW LEVEL SECURITY;
