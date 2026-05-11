import { Badge } from "@/components/ui/badge";

interface DealScore {
  id: string;
  score: number;
  factors: string[];
}

interface Props {
  score?: number | DealScore | null;
}

export function DealScoreBadge({ score }: Props) {
  if (!score) return null;
  const numericScore = typeof score === "number" ? score : score.score;
  if (typeof numericScore !== "number") return null;
  const color =
    numericScore >= 80
      ? "bg-emerald-500/15 text-emerald-500"
      : numericScore >= 50
      ? "bg-amber-500/15 text-amber-500"
      : "bg-red-500/15 text-red-500";
  return (
    <Badge variant="outline" className={color}>
      Score: {numericScore}
    </Badge>
  );
}
