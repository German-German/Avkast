"use client";
import { useState, useCallback, useEffect } from "react";
import { MemoryService } from "@/services/memory.service";
import { createDefaultMemory } from "@/lib/memory";
import type { ClientMemory, ExplicitPreferences, HardConstraints, DecisionRecord, DecisionOutcome } from "@/lib/memory";

export function useMemory() {
  const [memory, setMemory] = useState<ClientMemory>(createDefaultMemory());

  const refresh = useCallback(() => setMemory(MemoryService.get()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updatePreferences = useCallback(
    (updates: Partial<ExplicitPreferences>, summary?: string) => {
      const next = MemoryService.updatePreferences(updates, summary);
      setMemory({ ...next });
    },
    []
  );

  const updateConstraints = useCallback(
    (constraints: Partial<HardConstraints>, summary?: string) => {
      const next = MemoryService.updateConstraints(constraints, summary);
      setMemory({ ...next });
    },
    []
  );

  const addExclusion = useCallback(
    (type: "sector" | "ticker", value: string) => {
      const next = MemoryService.addHardExclusion(type, value);
      setMemory({ ...next });
    },
    []
  );

  const removeExclusion = useCallback(
    (type: "sector" | "ticker", value: string) => {
      const next = MemoryService.removeHardExclusion(type, value);
      setMemory({ ...next });
    },
    []
  );

  const recordDecision = useCallback(
    (record: Omit<DecisionRecord, "id" | "timestamp">, outcome: DecisionOutcome) => {
      const next = MemoryService.recordDecision(record, outcome);
      setMemory({ ...next });
    },
    []
  );

  const resetMemory = useCallback(() => {
    const next = MemoryService.reset();
    setMemory({ ...next });
  }, []);

  const exportMemory = useCallback(() => MemoryService.export(), []);

  const agentContext = useCallback(() => MemoryService.getAgentContext(), []);

  return {
    memory,
    refresh,
    updatePreferences,
    updateConstraints,
    addExclusion,
    removeExclusion,
    recordDecision,
    resetMemory,
    exportMemory,
    agentContext,
  };
}
