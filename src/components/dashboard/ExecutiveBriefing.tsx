import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface BriefingItem {
  type: "insight" | "warning" | "action";
  title: string;
  description: string;
}

export function ExecutiveBriefing() {
  const [briefing, setBriefing] = useState<BriefingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateBriefing();
  }, []);

  async function generateBriefing() {
    try {
      setLoading(true);

      const items: BriefingItem[] = [];

      // Pipeline health
      const { data: deals } = await supabase.from("deals").select("value, stage, probability, status, created_at").eq("status", "open");
      const totalValue = deals?.reduce((s, d) => s + (d.value || 0), 0) || 0;
      const stalledDeals = (deals || []).filter((d) => {
        const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
        return days > 14;
      });
      const lowProbDeals = (deals || []).filter((d) => (d.probability || 0) < 30);

      items.push({
        type: "insight",
        title: `Pipeline at $${totalValue.toLocaleString()}`,
        description: `${deals?.length || 0} active deals in motion across all stages.`,
      });

      if (stalledDeals.length > 0) {
        items.push({
          type: "warning",
          title: `${stalledDeals.length} deals need attention`,
          description: `Deals stagnant for 14+ days: ${stalledDeals.map((d) => d.stage).join(", ")} stages affected.`,
        });
      }

      if (lowProbDeals.length > 0) {
        items.push({
          type: "action",
          title: "Low-probability deals detected",
          description: `${lowProbDeals.length} deals have <30% win probability. Consider re-qualification.`,
        });
      }

      // Recent activity
      const { data: recentDeals } = await supabase.from("deals").select("name, stage, created_at").order("created_at", { ascending: false }).limit(1);
      if (recentDeals && recentDeals.length > 0) {
        items.push({
          type: "insight",
          title: "Latest deal created",
          description: `"${recentDeals[0].name}" entered the pipeline at ${recentDeals[0].stage} stage.`,
        });
      }

      // Contact growth
      const { count: contactCount } = await supabase.from("contacts").select("*", { count: "exact", head: true });
      const { count: lastWeekCount } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());

      if (lastWeekCount && lastWeekCount > 0) {
        items.push({
          type: "insight",
          title: "Contact graph growing",
          description: `${lastWeekCount} new contacts added this week. Total: ${contactCount || 0}.`,
        });
      }

      setBriefing(items);
    } catch {
      setBriefing([]);
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
            <Sparkles className="w-4 h-4 text-orange-500" />
            Executive Briefing
          </CardTitle>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            AI-Generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {briefing.map((item, i) => {
            const Icon = item.type === "warning" ? AlertTriangle : item.type === "action" ? Lightbulb : TrendingUp;
            const color = item.type === "warning" ? "#00BFFF" : item.type === "action" ? "#0066B1" : "#0066B1";
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
          {briefing.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No briefing available yet. Add more data to generate insights.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
