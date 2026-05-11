import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DealScorePanel() {
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
