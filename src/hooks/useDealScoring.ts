import { useState, useCallback } from "react";

export interface DealScore {
  id: string;
  score: number;
  factors: string[];
}

export function useDealScoring(_dealId?: string) {
  const [score, setScore] = useState<DealScore | null>(null);

  const calculateScore = useCallback(() => {
    setScore({ id: _dealId || "", score: 75, factors: ["engagement", "timeline"] });
  }, [_dealId]);

  return { score, calculateScore };
}
