import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  score?: { id: string; score: number; factors: string[] } | null;
}

export function DealScorePanel({ score }: Props) {
  if (!score) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Deal Score</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground">Score not calculated yet.</p>
        </CardContent>
      </Card>
    );
  }

  const color =
    score.score >= 80
      ? "text-emerald-500"
      : score.score >= 50
      ? "text-amber-500"
      : "text-red-500";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Deal Score</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className={`text-2xl font-bold ${color}`}>{score.score}</div>
        <div className="flex flex-wrap gap-1">
          {score.factors.map((f) => (
            <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
