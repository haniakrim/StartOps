import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopDeal } from "@/hooks/useDashboardData";

const stageColors: Record<string, string> = {
  lead: "bg-muted text-muted-foreground",
  qualified: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  proposal: "bg-primary/15 text-primary",
  negotiation: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  "closed-won": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "closed-lost": "bg-red-500/15 text-red-600 dark:text-red-400",
};

interface TopDealsProps {
  deals: TopDeal[];
}

export function TopDeals({ deals }: TopDealsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base font-medium">Top Deals</CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No active deals yet. Create your first deal!</p>}
          {deals.map((deal) => (
            <div key={deal.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{deal.name}</p>
                  <p className="text-sm font-semibold text-foreground ml-2">${(deal.value || 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`text-xs ${stageColors[deal.stage] || "bg-muted text-muted-foreground"}`}>{deal.stage}</Badge>
                  <div className="flex-1"><Progress value={deal.probability || 0} className="h-1.5 bg-muted" /></div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{deal.probability || 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
