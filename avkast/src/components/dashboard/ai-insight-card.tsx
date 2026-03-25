import React from "react";
import { Sparkles } from "lucide-react";
import { ExplainableAI } from "@/components/shared/explainable-ai";
import { cn } from "@/lib/utils";

interface AIInsightCardProps {
  title: string;
  insight: string;
  rationale: string;
  confidenceScore: number;
  auditLink: string;
  className?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  insight,
  rationale,
  confidenceScore,
  auditLink,
  className,
}) => {
  return (
    <div className={cn("p-6 rounded-xl advisor-card glass flex flex-col justify-between", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-[10px] uppercase font-bold tracking-widest leading-none">
            {title}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed font-medium">
          {insight}
        </p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5">
        <ExplainableAI 
          rationale={rationale} 
          auditLink={auditLink} 
          confidenceScore={confidenceScore} 
        />
      </div>
    </div>
  );
};
