import { useState, useEffect } from "react";
import { HeartPulse, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AtRiskDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  daysOld: number;
  risk: "high" | "medium" | "low";
}

export function DealHealth() {
  const [deals, setDeals] = useState<AtRiskDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAtRiskDeals();
  }, []);

  async function fetchAtRiskDeals() {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("deals")
        .select("id, name, value, stage, probability, status, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: true });

      const mapped: AtRiskDeal[] = (data || [])
        .map((d: any) => {
          const daysOld = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
          let risk: "high" | "medium" | "low" = "low";
          if (daysOld > 21 || (d.probability || 0) < 20) risk = "high";
          else if (daysOld > 14 || (d.probability || 0) < 40) risk = "medium";
          return { ...d, daysOld, risk };
        })
        .filter((d) => d.risk !== "low")
        .slice(0, 5);

      setDeals(mapped);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base font-medium flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-500" />
            Deal Health Monitor
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/deals")}>
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">All deals are healthy. No risks detected.</p>
          )}
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border cursor-pointer hover:border-primary/20 transition-colors"
              onClick={() => navigate("/deals")}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{deal.name}</p>
                  <Badge
                    className={`text-xs border-0 ${
                      deal.risk === "high"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                    }`}
                  >
                    {deal.risk === "high" ? "At Risk" : "Stalling"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  ${(deal.value || 0).toLocaleString()} · {deal.stage} · {deal.daysOld} days old · {deal.probability || 0}% probability
                </p>
              </div>
              <AlertTriangle
                className={`w-4 h-4 flex-shrink-0 ${
                  deal.risk === "high" ? "text-red-500" : "text-orange-500"
                }`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}