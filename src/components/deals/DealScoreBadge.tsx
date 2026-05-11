import { Badge } from "@/components/ui/badge";

interface Props {
  score?: number;
}

export function DealScoreBadge({ score }: Props) {
  if (!score) return null;
  const color = score >= 80 ? "bg-emerald-500/15 text-emerald-500" : score >= 50 ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-500";
  return (
    <Badge variant="outline" className={color}>
      Score: {score}
    </Badge>
  );
}
