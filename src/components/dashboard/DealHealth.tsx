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
      <Card className="bg-[#18191b] border-white/10">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-[#6452db] animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#18191b] border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base font-medium flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#be6464]" />
            Deal Health Monitor
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => navigate("/deals")}>
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deals.length === 0 && (
            <p className="text-sm text-white/40 text-center py-4">All deals are healthy. No risks detected.</p>
          )}
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
              onClick={() => navigate("/deals")}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white truncate">{deal.name}</p>
                  <Badge
                    className={`text-xs border-0 ${
                      deal.risk === "high"
                        ? "bg-[#be6464]/20 text-[#be6464]"
                        : "bg-[#f0ad4e]/20 text-[#f0ad4e]"
                    }`}
                  >
                    {deal.risk === "high" ? "At Risk" : "Stalling"}
                  </Badge>
                </div>
                <p className="text-xs text-white/40">
                  ${(deal.value || 0).toLocaleString()} · {deal.stage} · {deal.daysOld} days old · {deal.probability || 0}% probability
                </p>
              </div>
              <AlertTriangle
                className={`w-4 h-4 flex-shrink-0 ${
                  deal.risk === "high" ? "text-[#be6464]" : "text-[#f0ad4e]"
                }`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}