import { useState, useCallback } from "react";

export interface DealScore {
  id: string;
  score: number;
  factors: string[];
  grade?: string;
  color?: string;
  recommendation?: string;
}

function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function getColor(score: number): string {
  if (score >= 80) return "#34C759";
  if (score >= 60) return "#007AFF";
  if (score >= 40) return "#FF9500";
  return "#FF2D55";
}

function getRecommendation(score: number): string {
  if (score >= 80) return "Strong deal — push to close.";
  if (score >= 60) return "Nurture with regular follow-ups.";
  if (score >= 40) return "Re-evaluate value proposition.";
  return "High risk — consider archiving.";
}

export function useDealScoring(_dealId?: string) {
  const [scores, setScores] = useState<Record<string, DealScore>>({});

  const getScore = useCallback(
    (dealId: string): DealScore | null => {
      const existing = scores[dealId];
      if (existing) return existing;
      return {
        id: dealId,
        score: 50,
        factors: ["engagement", "timeline"],
        grade: "C",
        color: "#FF9500",
        recommendation: "Nurture with regular follow-ups.",
      };
    },
    [scores]
  );

  const calculateScore = useCallback((dealId: string, baseScore?: number) => {
    const score = baseScore ?? 75;
    setScores((prev) => ({
      ...prev,
      [dealId]: {
        id: dealId,
        score,
        factors: ["engagement", "timeline"],
        grade: getGrade(score),
        color: getColor(score),
        recommendation: getRecommendation(score),
      },
    }));
  }, []);

  const sortedByScore = useCallback(() => {
    return Object.entries(scores)
      .map(([dealId, score]) => ({ dealId, score }))
      .sort((a, b) => b.score.score - a.score.score);
  }, [scores]);

  return { scores, getScore, calculateScore, sortedByScore, loading: false };
}
