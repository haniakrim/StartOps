import { useState, useEffect } from "react";
import {
  Mail,
  TrendingUp,
  MessageSquare,
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
} from "recharts";
import type { DateRange } from "@/lib/reports";
import { downloadCSV } from "@/lib/reports";

export function CommunicationsReport({ range }: { range: DateRange }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalComms: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [typeData, setTypeData] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);

  useEffect(() => {
    fetchCommunicationReport();
  }, [range.start, range.end]);

  async function fetchCommunicationReport() {
    try {
      setLoading(true);
      const { data: commData } = await supabase
        .from("communications")
        .select(
          "id, type, subject, sentiment, occurred_at, created_at"
        )
        .gte("created_at", range.start)
        .lte("created_at", range.end);

      const commList = commData || [];
      const sentiments = commList.reduce(
        (acc: any, c: any) => {
          acc[c.sentiment || "neutral"] =
            (acc[c.sentiment || "neutral"] || 0) + 1;
          return acc;
        },
        {}
      );

      setStats({
        totalComms: commList.length,
        positive: sentiments.positive || 0,
        negative: sentiments.negative || 0,
        neutral: sentiments.neutral || 0,
      });

      const types: Record<string, number> = {};
      commList.forEach((c: any) => {
        types[c.type || "email"] = (types[c.type || "email"] || 0) + 1;
      });
      setTypeData(
        Object.entries(types).map(([name, value]) => ({ name, value }))
      );

      setCommunications(commList);
    } catch (error: any) {
      toast.error("Failed to load communication report: " + error.message);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatCard
          icon={Mail}
          iconColor="hsl(var(--primary))"
          value={stats.totalComms.toString()}
          label="Total Communications"
        />
        <ReportStatCard
          icon={TrendingUp}
          iconColor="#8dc572"
          value={stats.positive.toString()}
          label="Positive"
        />
        <ReportStatCard
          icon={MessageSquare}
          iconColor="#5683da"
          value={stats.neutral.toString()}
          label="Neutral"
        />
        <ReportStatCard
          icon={TrendingUp}
          iconColor="#be6464"
          value={stats.negative.toString()}
          label="Negative"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-foreground text-base font-medium">
              Communications by Type
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                downloadCSV(
                  typeData.map((d: any) => ({ Type: d.name, Count: d.value })),
                  "communications-by-type.csv"
                )
              }
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-base font-medium">
              Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Positive", value: stats.positive, color: "#8dc572" },
                { label: "Neutral", value: stats.neutral, color: "#5683da" },
                { label: "Negative", value: stats.negative, color: "#be6464" },
              ].map((item) => {
                const total = stats.totalComms || 1;
                const pct = ((item.value / total) * 100).toFixed(0);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-foreground text-base font-medium">
            Communication Log
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              downloadCSV(
                communications.map((c: any) => ({
                  Subject: c.subject || "No subject",
                  Type: c.type,
                  Sentiment: c.sentiment || "neutral",
                  Date: c.occurred_at
                    ? new Date(c.occurred_at).toLocaleDateString()
                    : "-",
                })),
                "communications-report.csv"
              )
            }
            className="text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Sentiment
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {communications.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No communications in selected period
                    </td>
                  </tr>
                )}
                {communications.map((comm: any) => (
                  <tr
                    key={comm.id}
                    className="border-b border-border/50 hover:bg-accent/50"
                  >
                    <td className="py-3 px-4 text-sm text-foreground font-medium">
                      {comm.subject || "No subject"}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground capitalize">
                      {comm.type}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          comm.sentiment === "positive"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : comm.sentiment === "negative"
                              ? "bg-red-500/15 text-red-600 dark:text-red-400"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {comm.sentiment || "neutral"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {comm.occurred_at
                        ? new Date(comm.occurred_at).toLocaleDateString()
                        : "-"}
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
