import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  change,
  className,
}) => {
  return (
    <div className={cn("p-6 rounded-xl glass gold-glow space-y-2", className)}>
      <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground leading-none">
        {label}
      </div>
      <div className="text-2xl font-semibold tracking-tighter text-foreground leading-tight">
        {value}
      </div>
      <div className="flex items-center gap-2">
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            change.isPositive ? "text-accent" : "text-destructive"
          )}>
            {change.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change.value}
          </div>
        )}
        {subValue && (
          <div className="text-xs text-muted-foreground font-mono">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};
