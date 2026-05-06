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
        <div className="w-8 h-8 border-2 border-[#6452db] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatCard
          icon={Mail}
          iconColor="#6452db"
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
        <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base font-medium">
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
              className="text-white/50 hover:text-white hover:bg-white/5"
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
                <Bar dataKey="value" fill="#5683da" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base font-medium">
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
                      <span className="text-sm text-white">{item.label}</span>
                      <span className="text-sm text-white/60">
                        {item.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white text-base font-medium">
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
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Sentiment
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {communications.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-sm text-white/40"
                    >
                      No communications in selected period
                    </td>
                  </tr>
                )}
                {communications.map((comm: any) => (
                  <tr
                    key={comm.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="py-3 px-4 text-sm text-white font-medium">
                      {comm.subject || "No subject"}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/70 capitalize">
                      {comm.type}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          comm.sentiment === "positive"
                            ? "bg-[#8dc572]/20 text-[#8dc572]"
                            : comm.sentiment === "negative"
                              ? "bg-[#be6464]/20 text-[#be6464]"
                              : "bg-[#5683da]/20 text-[#5683da]"
                        }`}
                      >
                        {comm.sentiment || "neutral"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/50">
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