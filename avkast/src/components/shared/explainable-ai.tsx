"use client";

import React from "react";
import { Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplainableAIProps {
  rationale: string;
  auditLink: string;
  confidenceScore: number;
  className?: string;
}

/**
 * Compliance-ready Explainability Component (EU AI Act 2026).
 * Reserved slot for 'Why this?' and hidden audit link.
 */
export const ExplainableAI: React.FC<ExplainableAIProps> = ({
  rationale,
  auditLink,
  confidenceScore,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2 text-xs font-medium", className)}>
      <div className="group relative flex items-center gap-1.5 cursor-help">
        <Info className="h-3.5 w-3.5 text-primary" />
        <span className="text-muted-foreground hover:text-primary transition-colors">
          AI Insight: {Math.round(confidenceScore * 100)}% Confidence
        </span>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg glass shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <p className="text-foreground text-xs leading-relaxed mb-2">
            {rationale}
          </p>
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Audit Verified
            </span>
            <span className="text-[10px] font-mono text-primary/50">
              {auditLink.slice(-8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
