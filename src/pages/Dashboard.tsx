import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Mail,
  Phone,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const revenueData = [
  { name: "Jan", value: 42000 },
  { name: "Feb", value: 38000 },
  { name: "Mar", value: 55000 },
  { name: "Apr", value: 48000 },
  { name: "May", value: 62000 },
  { name: "Jun", value: 58000 },
  { name: "Jul", value: 75000 },
  { name: "Aug", value: 68000 },
  { name: "Sep", value: 82000 },
  { name: "Oct", value: 78000 },
  { name: "Nov", value: 95000 },
  { name: "Dec", value: 88000 },
];

const pipelineData = [
  { name: "Lead", value: 45 },
  { name: "Qualified", value: 32 },
  { name: "Proposal", value: 28 },
  { name: "Negotiation", value: 18 },
  { name: "Closed", value: 24 },
];

interface ActivityItem {
  id: string;
  type: string;
  subject: string;
  created_at: string;
  contacts?: { first_name: string; last_name: string } | null;
  deals?: { name: string } | null;
}

interface TopDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  contacts?: { company: string | null } | null;
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("month");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeDeals: 0,
    totalContacts: 0,
    totalCompanies: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Get total revenue and active deals count
      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("value, stage, status");

      if (dealsError) throw dealsError;

      const totalRevenue = dealsData?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      const activeDeals = dealsData?.filter((d) => d.status === "open" && !d.stage?.startsWith("closed")).length || 0;

      // Get contacts count
      const { count: contactsCount, error: contactsError } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true });

      if (contactsError) throw contactsError;

      // Get distinct companies count
      const { data: companiesData, error: companiesError } = await supabase
        .from("contacts")
        .select("company");

      if (companiesError) throw companiesError;

      const distinctCompanies = new Set(
        (companiesData || []).map((c) => c.company).filter(Boolean)
      ).size;

      setStats({
        totalRevenue,
        activeDeals,
        totalContacts: contactsCount || 0,
        totalCompanies: distinctCompanies,
      });

      // Get recent activity
      const { data: activityData, error: activityError } = await supabase
        .from("activities")
        .select(`
          id,
          type,
          subject,
          created_at,
          contacts:contact_id (first_name, last_name),
          deals:deal_id (name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (activityError) throw activityError;
      setRecentActivity(activityData || []);

      // Get top deals
      const { data: topDealsData, error: topDealsError } = await supabase
        .from("deals")
        .select(`
          id,
          name,
          value,
          stage,
          probability,
          contacts:contact_id (company)
        `)
        .eq("status", "open")
        .order("value", { ascending: false })
        .limit(5);

      if (topDealsError) throw topDealsError;
      setTopDeals(topDealsData || []);
    } catch (error: any) {
      toast.error("Failed to load dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "#ff8964",
    },
    {
      title: "Active Deals",
      value: stats.activeDeals.toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: Target,
      color: "#5683da",
    },
    {
      title: "Contacts",
      value: stats.totalContacts.toLocaleString(),
      change: "+24.1%",
      trend: "up" as const,
      icon: Users,
      color: "#6452db",
    },
    {
      title: "Companies",
      value: stats.totalCompanies.toString(),
      change: "-2.4%",
      trend: "down" as const,
      icon: Building2,
      color: "#8dc572",
    },
  ];

  const stageColors: Record<string, string> = {
    lead: "bg-white/10 text-white/60",
    qualified: "bg-[#5683da]/20 text-[#5683da]",
    proposal: "bg-[#6452db]/20 text-[#6452db]",
    negotiation: "bg-[#ff8964]/20 text-[#ff8964]",
    "closed-won": "bg-[#8dc572]/20 text-[#8dc572]",
    "closed-lost": "bg-[#be6464]/20 text-[#be6464]",
  };

  const activityIcons: Record<string, any> = {
    email: Mail,
    call: Phone,
    meeting: Calendar,
    task: Activity,
    note: Activity,
  };

  const activityColors: Record<string, string> = {
    email: "#6452db",
    call: "#8dc572",
    meeting: "#f0ad4e",
    task: "#5683da",
    note: "#ff8964",
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Welcome back. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month", "quarter", "year"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? "bg-[#6452db] text-white hover:bg-[#6452db]/90"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up" ? "text-[#8dc572]" : "text-[#be6464]"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-sm text-white/50 mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium">
                Revenue Overview
              </CardTitle>
              <Badge
                variant="outline"
                className="border-white/10 text-white/50 text-xs"
              >
                <TrendingUp className="w-3 h-3 mr-1 text-[#8dc572]" />
                +23.4% YoY
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6452db" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6452db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2126",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6452db"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base font-medium">
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2126",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#5683da" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Deals */}
        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium">
                Top Deals
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDeals.length === 0 && (
                <p className="text-sm text-white/40 text-center py-8">
                  No active deals yet. Create your first deal!
                </p>
              )}
              {topDeals.map((deal) => (
                <div key={deal.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {deal.name}
                      </p>
                      <p className="text-sm font-semibold text-white ml-2">
                        ${(deal.value || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${stageColors[deal.stage] || "bg-white/10 text-white/60"}`}
                      >
                        {deal.stage}
                      </Badge>
                      <div className="flex-1">
                        <Progress
                          value={deal.probability || 0}
                          className="h-1.5 bg-white/10"
                        />
                      </div>
                      <span className="text-xs text-white/40 w-8 text-right">
                        {deal.probability || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium">
                Recent Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                <Activity className="w-4 h-4 mr-1" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 && (
                <p className="text-sm text-white/40 text-center py-8">
                  No recent activity. Start engaging with your contacts!
                </p>
              )}
              {recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type] || Activity;
                const color = activityColors[activity.type] || "#5683da";
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/40">
                          {activity.contacts
                            ? `${activity.contacts.first_name} ${activity.contacts.last_name}`
                            : activity.deals?.name || "System"}
                        </span>
                        <span className="text-xs text-white/20">·</span>
                        <span className="text-xs text-white/40">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}