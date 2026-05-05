import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#6452db", "#5683da", "#ff8964", "#f0ad4e", "#8dc572"];

export default function Analytics() {
  const [dealsByStage, setDealsByStage] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [contactsBySource, setContactsBySource] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalValue: 0,
    avgDealSize: 0,
    conversionRate: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: deals } = await supabase.from("deals").select("stage, value, status, created_at");
      const { data: contacts } = await supabase.from("contacts").select("source");

      // Deals by stage
      const stageMap: Record<string, number> = {};
      deals?.forEach((d) => {
        stageMap[d.stage] = (stageMap[d.stage] || 0) + 1;
      });
      setDealsByStage(
        Object.entries(stageMap).map(([name, value]) => ({ name, value }))
      );

      // Monthly revenue (mock data for demo)
      setMonthlyRevenue([
        { month: "Jan", revenue: 45000, deals: 12 },
        { month: "Feb", revenue: 52000, deals: 15 },
        { month: "Mar", revenue: 48000, deals: 13 },
        { month: "Apr", revenue: 61000, deals: 18 },
        { month: "May", revenue: 55000, deals: 16 },
        { month: "Jun", revenue: 72000, deals: 21 },
      ]);

      // Contacts by source
      const sourceMap: Record<string, number> = {};
      contacts?.forEach((c) => {
        const source = c.source || "Unknown";
        sourceMap[source] = (sourceMap[source] || 0) + 1;
      });
      setContactsBySource(
        Object.entries(sourceMap).map(([name, value]) => ({ name, value }))
      );

      // Stats
      const totalValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      const wonDeals = deals?.filter((d) => d.status === "won").length || 0;
      setStats({
        totalDeals: deals?.length || 0,
        totalValue,
        avgDealSize: deals?.length ? totalValue / deals.length : 0,
        conversionRate: deals?.length ? (wonDeals / deals.length) * 100 : 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleExport = () => {
    toast({ title: "Analytics report exported" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-white/60 mt-1">Advanced reporting and insights</p>
        </div>
        <Button
          variant="outline"
          className="border-[#303236] text-white/85 hover:bg-[#18191b] hover:text-white"
          onClick={handleExport}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Deals</p>
                <p className="text-2xl font-semibold text-white mt-1">{stats.totalDeals}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#6452db]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Pipeline Value</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  ${(stats.totalValue / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ff8964]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#ff8964]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Avg Deal Size</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  ${stats.avgDealSize.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#5683da]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#5683da]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Conversion Rate</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#8dc572]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#8dc572]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#18191b] border-[#303236]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303236" />
                <XAxis dataKey="month" stroke="#61656b" />
                <YAxis stroke="#61656b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18191b",
                    border: "1px solid #303236",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6452db"
                  strokeWidth={2}
                  dot={{ fill: "#6452db" }}
                />
                <Line
                  type="monotone"
                  dataKey="deals"
                  stroke="#ff8964"
                  strokeWidth={2}
                  dot={{ fill: "#ff8964" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#18191b] border-[#303236]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealsByStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303236" />
                <XAxis dataKey="name" stroke="#61656b" />
                <YAxis stroke="#61656b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18191b",
                    border: "1px solid #303236",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#6452db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#18191b] border-[#303236]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Contact Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contactsBySource}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contactsBySource.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18191b",
                    border: "1px solid #303236",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {contactsBySource.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-white/60">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18191b] border-[#303236]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Lead to Qualified", value: 68, color: "#6452db" },
              { label: "Qualified to Proposal", value: 45, color: "#5683da" },
              { label: "Proposal to Closed", value: 32, color: "#ff8964" },
              { label: "Overall Conversion", value: stats.conversionRate, color: "#8dc572" },
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/85">{metric.label}</span>
                  <span className="text-white/60">{metric.value.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-[#0b0d10] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: metric.color, width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
