import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Calendar,
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

export function ActivitiesReport({ range }: { range: DateRange }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActivities: 0,
    completed: 0,
    pending: 0,
    completionRate: "0%",
  });
  const [typeData, setTypeData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchActivityReport();
  }, [range.start, range.end]);

  async function fetchActivityReport() {
    try {
      setLoading(true);
      const { data: actData } = await supabase
        .from("activities")
        .select(
          "id, type, subject, status, priority, due_date, completed_at, created_at"
        )
        .gte("created_at", range.start)
        .lte("created_at", range.end);

      const actList = actData || [];
      const completed = actList.filter((a) => a.status === "completed").length;

      setStats({
        totalActivities: actList.length,
        completed,
        pending: actList.filter((a) => a.status !== "completed").length,
        completionRate:
          actList.length > 0
            ? `${((completed / actList.length) * 100).toFixed(0)}%`
            : "0%",
      });

      const types: Record<string, number> = {};
      actList.forEach((a) => {
        types[a.type || "task"] = (types[a.type || "task"] || 0) + 1;
      });
      setTypeData(
        Object.entries(types).map(([name, value]) => ({ name, value }))
      );

      setActivities(actList);
    } catch (error: any) {
      toast.error("Failed to load activity report: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#0066B1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatCard
          icon={Activity}
          iconColor="#0066B1"
          value={stats.totalActivities.toString()}
          label="Total Activities"
        />
        <ReportStatCard
          icon={CheckCircle2}
          iconColor="#00BFFF"
          value={stats.completed.toString()}
          label="Completed"
        />
        <ReportStatCard
          icon={Calendar}
          iconColor="#00BFFF"
          value={stats.pending.toString()}
          label="Pending"
        />
        <ReportStatCard
          icon={TrendingUp}
          iconColor="#0066B1"
          value={stats.completionRate}
          label="Completion Rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base font-medium">
              Activities by Type
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                downloadCSV(
                  typeData.map((d) => ({ Type: d.name, Count: d.value })),
                  "activities-by-type.csv"
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
                <Bar dataKey="value" fill="#E63946" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base font-medium">
              Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((_: any, index: number) => (
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
              {typeData.map((entry: any, index: number) => (
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
                    <span className="text-white/60 capitalize">
                      {entry.name}
                    </span>
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
            Activity Log
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              downloadCSV(
                activities.map((a: any) => ({
                  Subject: a.subject,
                  Type: a.type,
                  Status: a.status,
                  Priority: a.priority,
                  "Due Date": a.due_date
                    ? new Date(a.due_date).toLocaleDateString()
                    : "-",
                })),
                "activities-report.csv"
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
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-sm text-white/40"
                    >
                      No activities in selected period
                    </td>
                  </tr>
                )}
                {activities.map((act: any) => (
                  <tr
                    key={act.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="py-3 px-4 text-sm text-white font-medium">
                      {act.subject}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/70 capitalize">
                      {act.type}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          statusColors[act.status] || statusColors.open
                        }`}
                      >
                        {act.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/70 capitalize">
                      {act.priority}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/50">
                      {act.due_date
                        ? new Date(act.due_date).toLocaleDateString()
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