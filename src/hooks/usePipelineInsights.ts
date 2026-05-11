import { useState, useCallback } from "react";

export interface PipelineInsight {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  metric: string;
  value: number;
}

export function usePipelineInsights(_organizationId?: string) {
  const [insights, setInsights] = useState<PipelineInsight[]>([]);

  const generateInsights = useCallback(() => {
    setInsights([]);
  }, []);

  return { insights, generateInsights };
}
