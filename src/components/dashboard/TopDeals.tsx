import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopDeal } from "@/hooks/useDashboardData";

const stageColors: Record<string, string> = {
  lead: "bg-white/10 text-white/60", qualified: "bg-[#5683da]/20 text-[#5683da]",
  proposal: "bg-[#6452db]/20 text-[#6452db]", negotiation: "bg-[#ff8964]/20 text-[#ff8964]",
  "closed-won": "bg-[#8dc572]/20 text-[#8dc572]", "closed-lost": "bg-[#be6464]/20 text-[#be6464]",
};

interface TopDealsProps {
  deals: TopDeal[];
}

export function TopDeals({ deals }: TopDealsProps) {
  return (
    <Card className="bg-[#18191b] border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base font-medium">Top Deals</CardTitle>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deals.length === 0 && <p className="text-sm text-white/40 text-center py-8">No active deals yet. Create your first deal!</p>}
          {deals.map((deal) => (
            <div key={deal.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white truncate">{deal.name}</p>
                  <p className="text-sm font-semibold text-white ml-2">${(deal.value || 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`text-xs ${stageColors[deal.stage] || "bg-white/10 text-white/60"}`}>{deal.stage}</Badge>
                  <div className="flex-1"><Progress value={deal.probability || 0} className="h-1.5 bg-white/10" /></div>
                  <span className="text-xs text-white/40 w-8 text-right">{deal.probability || 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}