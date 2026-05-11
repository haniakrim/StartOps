import { useState, useCallback } from "react";

export interface DealScore {
  id: string;
  score: number;
  factors: string[];
}

export function useDealScoring(_dealId?: string) {
  const [scores, setScores] = useState<Record<string, DealScore>>({});

  const getScore = useCallback(
    (dealId: string): DealScore | null => {
      return scores[dealId] || { id: dealId, score: 50, factors: ["engagement", "timeline"] };
    },
    [scores]
  );

  const calculateScore = useCallback((dealId: string) => {
    setScores((prev) => ({
      ...prev,
      [dealId]: { id: dealId, score: 75, factors: ["engagement", "timeline"] },
    }));
  }, []);

  return { scores, getScore, calculateScore };
}
