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
  }, [range.start, range.end]);

  async function fetchPipelineReport() {
    try {
      setLoading(true);
      const { data: dealsData } = await supabase
        .from("deals")
        .select(
          "id, name, value, stage, probability, status, expected_close_date, created_at, contacts:contact_id (first_name, last_name, company)"
        )
        .gte("created_at", range.start)
        .lte("created_at", range.end);

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
        <div className="w-8 h-8 border-2 border-[#6452db] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatCard
          icon={GitBranch}
          iconColor="#6452db"
          value={stats.totalDeals.toString()}
          label="Total Deals"
        />
        <ReportStatCard
          icon={DollarSign}
          iconColor="#ff8964"
          value={`$${stats.totalValue.toLocaleString()}`}
          label="Pipeline Value"
        />
        <ReportStatCard
          icon={BarChart3}
          iconColor="#5683da"
          value={`$${stats.avgDealSize.toLocaleString()}`}
          label="Avg Deal Size"
        />
        <ReportStatCard
          icon={TrendingUp}
          iconColor="#8dc572"
          value={stats.winRate}
          label="Win Rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base font-medium">
              Deals by Stage
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                downloadCSV(
                  stageData.map((d: any) => ({
                    Stage: d.name,
                    "Deal Count": d.value,
                  })),
                  "pipeline-stage-report.csv"
                )
              }
              className="text-white/50 hover:text-white hover:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2126",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#6452db"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base font-medium">
              Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageData.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2126",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {stageData.map((entry: any, index: number) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="text-white/60">{entry.name}</span>
                  </div>
                  <span className="text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white text-base font-medium">
            Deal Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              downloadCSV(
                deals.map((d: any) => ({
                  Name: d.name,
                  Company: d.contacts?.company || "-",
                  Stage: d.stage,
                  Value: d.value || 0,
                  Probability: `${d.probability || 0}%`,
                  Status: d.status,
                })),
                "deals-report.csv"
              )
            }
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Deal
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Stage
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Value
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Probability
                  </th>
                </tr>
              </thead>
              <tbody>
                {deals.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-sm text-white/40"
                    >
                      No deals in selected period
                    </td>
                  </tr>
                )}
                {deals.map((deal: any) => (
                  <tr
                    key={deal.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="py-3 px-4 text-sm text-white font-medium">
                      {deal.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/70">
                      {deal.contacts?.company || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          statusColors[deal.status] || statusColors.open
                        }`}
                      >
                        {deal.stage}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-white">
                      ${(deal.value || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/70">
                      {deal.probability || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}