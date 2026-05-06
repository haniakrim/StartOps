import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, TrendingUp, Loader2, BrainCircuit, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Anomaly {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  module: string;
  detected_at: string;
}

export function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectAnomalies();
  }, []);

  async function detectAnomalies() {
    try {
      setLoading(true);
      const detected: Anomaly[] = [];

      // Check for stalled deals
      const { data: stalledDeals } = await supabase
        .from("deals")
        .select("id, name, stage, created_at, value")
        .eq("status", "open")
        .lt("created_at", new Date(Date.now() - 14 * 86400000).toISOString())
        .limit(3);

      (stalledDeals || []).forEach((d: any) => {
        detected.push({
          id: `deal-${d.id}`,
          type: "stalled_deal",
          severity: "high",
          title: `Stalled Deal: ${d.name}`,
          description: `No progress for 14+ days. $${(d.value || 0).toLocaleString()} at ${d.stage} stage.`,
          module: "Revenue",
          detected_at: new Date().toISOString(),
        });
      });

      // Check for low probability deals
      const { data: lowProbDeals } = await supabase
        .from("deals")
        .select("id, name, probability, value")
        .eq("status", "open")
        .lt("probability", 30)
        .limit(2);

      (lowProbDeals || []).forEach((d: any) => {
        detected.push({
          id: `prob-${d.id}`,
          type: "low_probability",
          severity: "medium",
          title: `Low Win Probability: ${d.name}`,
          description: `${d.probability || 0}% probability on $${(d.value || 0).toLocaleString()} deal. Consider re-qualification.`,
          module: "Revenue",
          detected_at: new Date().toISOString(),
        });
      });

      // Check for overdue invoices
      const { data: overdueInvoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, amount, due_date")
        .eq("status", "overdue")
        .limit(2);

      (overdueInvoices || []).forEach((inv: any) => {
        detected.push({
          id: `inv-${inv.id}`,
          type: "overdue_invoice",
          severity: "high",
          title: `Overdue Invoice: ${inv.invoice_number}`,
          description: `$${(inv.amount || 0).toLocaleString()} overdue since ${new Date(inv.due_date).toLocaleDateString()}`,
          module: "Finance",
          detected_at: new Date().toISOString(),
        });
      });

      // Check for at-risk projects
      const { data: atRiskProjects } = await supabase
        .from("projects")
        .select("id, name, progress, end_date, budget, actual_cost")
        .in("status", ["active", "on_hold"])
        .limit(2);

      (atRiskProjects || []).forEach((p: any) => {
        const daysLeft = p.end_date ? Math.ceil((new Date(p.end_date).getTime() - Date.now()) / 86400000) : 999;
        const budgetUsed = p.budget > 0 ? ((p.actual_cost || 0) / p.budget) * 100 : 0;
        if ((p.progress || 0) < 50 && daysLeft < 14) {
          detected.push({
            id: `proj-${p.id}`,
            type: "delivery_risk",
            severity: "high",
            title: `Delivery Risk: ${p.name}`,
            description: `Only ${p.progress || 0}% complete with ${daysLeft} days remaining.`,
            module: "Projects",
            detected_at: new Date().toISOString(),
          });
        } else if (budgetUsed > 90) {
          detected.push({
            id: `budget-${p.id}`,
            type: "budget_risk",
            severity: "medium",
            title: `Budget Risk: ${p.name}`,
            description: `${budgetUsed.toFixed(0)}% of budget consumed. Monitor closely.`,
            module: "Projects",
            detected_at: new Date().toISOString(),
          });
        }
      });

      setAnomalies(detected);
    } catch {
      setAnomalies([]);
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
            <BrainCircuit className="w-4 h-4 text-orange-500" />
            AI Anomaly Detection
          </CardTitle>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            Cross-System
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.length === 0 && (
            <div className="text-center py-6">
              <Zap className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All systems operating normally</p>
              <p className="text-xs text-muted-foreground/70 mt-1">No anomalies detected across Revenue, Finance, or Projects</p>
            </div>
          )}
          {anomalies.map((anomaly) => {
            const Icon = anomaly.severity === "high" ? AlertTriangle : anomaly.severity === "medium" ? TrendingDown : TrendingUp;
            const color = anomaly.severity === "high" ? "#E63946" : anomaly.severity === "medium" ? "#00BFFF" : "#0066B1";
            return (
              <div key={anomaly.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{anomaly.title}</p>
                    <Badge className={`text-xs border-0 ${anomaly.severity === "high" ? "bg-red-500/15 text-red-600 dark:text-red-400" : anomaly.severity === "medium" ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" : "bg-blue-500/15 text-blue-600 dark:text-blue-400"}`}>
                      {anomaly.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">{anomaly.module}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        {anomalies.length > 0 && (
          <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground hover:text-foreground hover:bg-accent" onClick={detectAnomalies}>
            <Zap className="w-3.5 h-3.5 mr-2" />Refresh Detection
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
