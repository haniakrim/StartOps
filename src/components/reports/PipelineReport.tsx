import { useState, useEffect } from "react";
import {
  GitBranch,
  DollarSign,
  BarChart3,
  TrendingUp,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportStatCard } from "./ReportStatCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DateRange } from "@/lib/reports";
import { downloadCSV, COLORS, statusColors } from "@/lib/reports";

export function PipelineReport({ range }: { range: DateRange }) {
  const { organizationId } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalValue: 0,
    avgDealSize: 0,
    winRate: "0%",
  });
  const [stageData, setStageData] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    fetchPipelineReport();
  }, [range.start, range.end, organizationId]);

  async function fetchPipelineReport() {
    try {
      setLoading(true);
      let query = supabase
        .from("deals")
        .select(
          "id, name, value, stage, probability, status, expected_close_date, created_at, contacts:contact_id (first_name, last_name, company)"
        )
        .gte("created_at", range.start)
        .lte("created_at", range.end);
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      const { data: dealsData } = await query;

      const dealsList = (dealsData || []).map((d: any) => ({
        ...d,
        contacts: d.contacts?.[0] ?? null,
      }));

      const totalValue = dealsList.reduce(
        (s: number, d: any) => s + (d.value || 0),
        0
      );
      const won = dealsList.filter((d: any) => d.stage === "closed-won").length;
      const closed = dealsList.filter((d: any) =>
        d.stage?.startsWith("closed")
      ).length;

      setStats({
        totalDeals: dealsList.length,
        totalValue,
        avgDealSize:
          dealsList.length > 0 ? Math.round(totalValue / dealsList.length) : 0,
        winRate: closed > 0 ? `${((won / closed) * 100).toFixed(1)}%` : "0%",
      });

      const stages: Record<string, number> = {};
      dealsList.forEach((d: any) => {
        stages[d.stage || "lead"] = (stages[d.stage || "lead"] || 0) + 1;
      });
      setStageData(
        Object.entries(stages).map(([name, value]) => ({ name, value }))
      );

      setDeals(dealsList);
    } catch (error: any) {
      toast.error("Failed to load pipeline report: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportStatCard
          icon={GitBranch}
          label="Total Deals"
          value={stats.totalDeals.toString()}
          trend="up"
          trendValue=""
        />
        <ReportStatCard
          icon={DollarSign}
          label="Total Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          trend="up"
          trendValue=""
        />
        <ReportStatCard
          icon={BarChart3}
          label="Avg Deal Size"
          value={`$${stats.avgDealSize.toLocaleString()}`}
          trend="up"
          trendValue=""
        />
        <ReportStatCard
          icon={TrendingUp}
          label="Win Rate"
          value={stats.winRate}
          trend="up"
          trendValue=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {deals.slice(0, 8).map((deal: any) => (
                <div key={deal.id} className="flex items-center justify-between p-2 rounded bg-muted border border-border/50 text-sm">
                  <div>
                    <span className="text-foreground">{deal.name}</span>
                    {deal.contacts && <span className="text-muted-foreground ml-2">· {deal.contacts.first_name} {deal.contacts.last_name}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">${(deal.value || 0).toLocaleString()}</span>
                    <Badge variant="secondary" className={`text-xs ${statusColors[deal.status] || "bg-muted text-muted-foreground"}`}>{deal.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" size="sm" onClick={() => downloadCSV(deals, "pipeline")}>
        <Download className="w-4 h-4 mr-2" />Export CSV
      </Button>
    </div>
  );
}
