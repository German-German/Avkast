import { createClient } from '@supabase/supabase-js';

// Configuration (should be in .env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;

const getSupabase = () => {
  if (supabase) return supabase;
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Avkast] Supabase credentials missing. Audit logging restricted.');
    return null;
  }
  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
};

export interface DecisionArtifact {
  agentId: string;
  recommendation: string;
  confidenceScore: number;
  rationale: string;
  dataSources: string[];
  agentConfidenceScores: Record<string, number>;
}

/**
 * Background logging service to capture 'Decision Artifacts'
 * for 2026 Regulatory Compliance (EU AI Act).
 */
export const LoggingService = {
  async logDecision(portfolioId: string, artifact: DecisionArtifact) {
    console.log('[Avkast Audit Log]', artifact);

    const client = getSupabase();
    if (!client) return null;

    // 1. Log the core decision
    const { data: decision, error: dError } = await client
      .from('agent_decisions')
      .insert({
        portfolio_id: portfolioId,
        agent_id: artifact.agentId,
        recommendation: artifact.recommendation,
        confidence_score: artifact.confidenceScore,
        status: 'shadow', // Default for all new financial logic
      })
      .select()
      .single();

    if (dError) {
      console.error('Failed to log decision:', dError);
      return null;
    }

    // 2. Log the detailed artifact
    const { error: aError } = await client
      .from('decision_artifacts')
      .insert({
        decision_id: decision.id,
        data_sources: artifact.dataSources,
        rationale: artifact.rationale,
        agent_confidence_scores: artifact.agentConfidenceScores,
        audit_link: `audit://${decision.id}`,
      });

    if (aError) {
      console.error('Failed to log artifact:', aError);
    }

    return decision.id;
  },

  async getAuditTrail(decisionId: string) {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
      .from('decision_artifacts')
      .select('*, agent_decisions(*)')
      .eq('decision_id', decisionId)
      .single();

    if (error) {
      console.error('Failed to fetch audit trail:', error);
      return null;
    }

    return data;
  }
};
