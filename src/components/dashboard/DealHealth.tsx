import { useState, useEffect, useCallback } from "react";
import { HeartPulse, AlertTriangle, Loader2, ArrowRight, Activity, Clock, MessageSquare, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { useDealScoring } from "@/hooks/useDealScoring";

interface AtRiskDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  daysOld: number;
  daysInStage: number;
  lastActivityDays: number;
  activityCount: number;
  risk: "high" | "medium" | "low";
  score: number;
  scoreGrade: string;
  scoreColor: string;
  reasons: string[];
  recommendation: string;
}

export function DealHealth() {
  const { organizationId } = useOrganization();
  const { scores, sortedByScore } = useDealScoring();
  const [deals, setDeals] = useState<AtRiskDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAtRiskDeals = useCallback(async () => {
    if (!organizationId) {
      setDeals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [dealsRes, activitiesRes] = await Promise.all([
        supabase
          .from("deals")
          .select("id, name, value, stage, probability, status, created_at, updated_at, expected_close_date")
          .eq("organization_id", organizationId)
          .eq("status", "open")
          .neq("stage", "closed-won")
          .neq("stage", "closed-lost")
          .order("created_at", { ascending: true }),
        supabase
          .from("activities")
          .select("deal_id, created_at")
          .eq("organization_id", organizationId)
          .gte("created_at", thirtyDaysAgo.toISOString()),
      ]);

      const dealData = (dealsRes.data || []) as Array<{
        id: string; name: string; value: number; stage: string; probability: number;
        status: string; created_at: string; updated_at: string; expected_close_date: string | null;
      }>;

      const activities = activitiesRes.data || [];
      const activityMap: Record<string, { count: number; lastAt: Date | null }> = {};
      for (const a of activities) {
        if (a.deal_id) {
          if (!activityMap[a.deal_id]) {
            activityMap[a.deal_id] = { count: 0, lastAt: null };
          }
          activityMap[a.deal_id].count++;
          const d = new Date(a.created_at);
          if (!activityMap[a.deal_id].lastAt || d > activityMap[a.deal_id].lastAt!) {
            activityMap[a.deal_id].lastAt = d;
          }
        }
      }

      const mapped: AtRiskDeal[] = dealData.map((d) => {
        const daysOld = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
        const daysInStage = Math.floor((Date.now() - new Date(d.updated_at || d.created_at).getTime()) / 86400000);
        const act = activityMap[d.id];
        const lastActivityDays = act?.lastAt
          ? Math.floor((Date.now() - act.lastAt.getTime()) / 86400000)
          : daysOld;
        const activityCount = act?.count || 0;

        const scoreData = scores[d.id];
        const score = scoreData?.score ?? 50;
        const scoreGrade = scoreData?.grade ?? "C";
        const scoreColor = scoreData?.color ?? "#FF9500";

        let risk: "high" | "medium" | "low" = "low";
        const reasons: string[] = [];
        let recommendation = "Maintain momentum with regular follow-ups.";

        if (score <= 25) {
          risk = "high";
          reasons.push("Very low lead score");
          recommendation = "Re-evaluate qualification or consider archiving.";
        } else if (score <= 45) {
          risk = "medium";
          reasons.push("Low lead score");
          recommendation = "Increase touchpoints and reassess value proposition.";
        }

        if (daysInStage > 30) {
          risk = risk === "low" ? "medium" : risk;
          reasons.push(`${daysInStage} days stuck in ${d.stage}`);
          if (risk === "high") {
            recommendation = "Deal is stalled — schedule a call to re-engage or move to closed-lost.";
          }
        }

        if (lastActivityDays > 14) {
          risk = risk === "low" ? "medium" : risk;
          reasons.push(`No activity for ${lastActivityDays} days`);
          if (risk === "high") {
            recommendation = "Send a re-engagement email or call immediately.";
          } else if (reasons.length === 1) {
            recommendation = "Reach out — even a quick check-in can revive interest.";
          }
        }

        if (activityCount === 0) {
          risk = risk === "low" ? "medium" : risk;
          reasons.push("Zero recent activities");
        }

        if (d.expected_close_date) {
          const daysUntil = Math.ceil((new Date(d.expected_close_date).getTime() - Date.now()) / 86400000);
          if (daysUntil < 0) {
            risk = "high";
            reasons.push("Close date has passed");
            recommendation = "Update the expected close date or close the deal.";
          } else if (daysUntil < 7 && risk !== "high") {
            reasons.push(`Closing in ${daysUntil} days`);
            recommendation = "High urgency — push for a decision.";
          }
        }

        if (d.probability < 20) {
          risk = risk === "low" ? "medium" : risk;
          reasons.push(`${d.probability}% win probability`);
        }

        // If no risks detected but score is average
        if (reasons.length === 0 && score < 60) {
          risk = "medium";
          reasons.push("Below-average lead score");
          recommendation = scoreData?.recommendation || "Nurture with more touchpoints.";
        }

        if (reasons.length === 0) {
          risk = "low";
          reasons.push("Healthy deal");
          recommendation = "Keep the momentum going!";
        }

        return {
          id: d.id,
          name: d.name,
          value: d.value || 0,
          stage: d.stage,
          probability: d.probability || 0,
          daysOld,
          daysInStage,
          lastActivityDays,
          activityCount,
          risk,
          score,
          scoreGrade,
          scoreColor,
          reasons,
          recommendation,
        };
      });

      // Sort: high risk first, then by score ascending
      mapped.sort((a, b) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        if (riskOrder[a.risk] !== riskOrder[b.risk]) {
          return riskOrder[a.risk] - riskOrder[b.risk];
        }
        return a.score - b.score;
      });

      setDeals(mapped.slice(0, 6));
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, scores]);

  useEffect(() => {
    fetchAtRiskDeals();
  }, [fetchAtRiskDeals]);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const atRiskCount = deals.filter((d) => d.risk !== "low").length;

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
      <CardContent className="space-y-4">
        {atRiskCount > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-xs text-destructive">
              {atRiskCount} deal{atRiskCount > 1 ? "s" : ""} need{atRiskCount === 1 ? "s" : ""} attention
            </p>
          </div>
        )}

        <div className="space-y-3">
          {deals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No open deals to monitor.</p>
          )}
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="p-3 rounded-lg bg-muted/50 border border-border cursor-pointer hover:border-primary/20 transition-colors space-y-2"
              onClick={() => navigate("/deals")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{deal.name}</p>
                    {deal.risk !== "low" && (
                      <Badge
                        className={`text-[10px] border-0 h-4 px-1.5 ${
                          deal.risk === "high"
                            ? "bg-red-500/15 text-red-600 dark:text-red-400"
                            : "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {deal.risk === "high" ? "At Risk" : "Stalling"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      ${deal.value.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {deal.stage}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {deal.daysInStage}d in stage
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: deal.scoreColor }}
                  >
                    {deal.scoreGrade}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Lead Score</span>
                  <span>{deal.score}/100</span>
                </div>
                <Progress
                  value={deal.score}
                  className="h-1 bg-muted"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {deal.reasons.map((r) => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-background text-muted-foreground">
                    {r}
                  </span>
                ))}
              </div>

              <p className="text-xs text-foreground font-medium">{deal.recommendation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
