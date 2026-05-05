import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { name: "Jan", value: 42000 },
  { name: "Feb", value: 48000 },
  { name: "Mar", value: 45000 },
  { name: "Apr", value: 52000 },
  { name: "May", value: 58000 },
  { name: "Jun", value: 62000 },
  { name: "Jul", value: 68000 },
  { name: "Aug", value: 72000 },
  { name: "Sep", value: 69000 },
  { name: "Oct", value: 78000 },
  { name: "Nov", value: 85000 },
  { name: "Dec", value: 92000 },
];

const pipelineData = [
  { name: "Lead", value: 145 },
  { name: "Qualified", value: 89 },
  { name: "Proposal", value: 56 },
  { name: "Negotiation", value: 34 },
  { name: "Closed", value: 28 },
];

const dealSourceData = [
  { name: "Direct", value: 35 },
  { name: "Referral", value: 25 },
  { name: "Inbound", value: 20 },
  { name: "Outbound", value: 15 },
  { name: "Partner", value: 5 },
];

const COLORS = ["#ff8964", "#5683da", "#6452db", "#8dc572", "#f0ad4e"];

const recentActivity = [
  { id: 1, type: "deal", message: "Acme Corp deal moved to Negotiation", time: "2 min ago", user: "Sarah Chen", status: "positive" },
  { id: 2, type: "contact", message: "New enterprise lead: TechFlow Inc", time: "15 min ago", user: "Mike Ross", status: "neutral" },
  { id: 3, type: "task", message: "Follow-up call with Vertex Systems", time: "1 hr ago", user: "Alex Grant", status: "warning" },
  { id: 4, type: "deal", message: "CloudNine closed - $45,000 ARR", time: "3 hr ago", user: "Sarah Chen", status: "positive" },
  { id: 5, type: "contact", message: "DataSync upgraded to Enterprise plan", time: "5 hr ago", user: "Mike Ross", status: "positive" },
];

const kpis = [
  {
    title: "Total Revenue",
    value: "$847K",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "coral",
  },
  {
    title: "Active Deals",
    value: "324",
    change: "+8.2%",
    trend: "up",
    icon: Briefcase,
    color: "blue",
  },
  {
    title: "Total Contacts",
    value: "2,847",
    change: "+24.1%",
    trend: "up",
    icon: Users,
    color: "violet",
  },
  {
    title: "Win Rate",
    value: "34.2%",
    change: "-2.1%",
    trend: "down",
    icon: Target,
    color: "green",
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-elevated border border-hairline-soft rounded-md px-3 py-2 shadow-lg">
        <p className="text-xs text-white/45 mb-1">{label}</p>
        <p className="text-sm font-medium text-white">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("year");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-app font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/45 mt-0.5">
            Welcome back, Alex. Here's what's happening today.
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList className="bg-surface border border-hairline-soft">
            <TabsTrigger
              value="week"
              className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65"
            >
              Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65"
            >
              Month
            </TabsTrigger>
            <TabsTrigger
              value="year"
              className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65"
            >
              Year
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="bg-surface border-hairline-soft rounded-xl"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-xs text-white/45 font-app">{kpi.title}</p>
                  <p className="text-2xl font-app font-bold text-white">
                    {kpi.value}
                  </p>
                  <div className="flex items-center gap-1">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-app-error" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        kpi.trend === "up" ? "text-success" : "text-app-error"
                      }`}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-xs text-white/30">vs last period</span>
                  </div>
                </div>
                <div
                  className={`p-2.5 rounded-lg ${
                    kpi.color === "coral"
                      ? "bg-coral/10"
                      : kpi.color === "blue"
                      ? "bg-electric-blue/10"
                      : kpi.color === "violet"
                      ? "bg-violet/10"
                      : "bg-success/10"
                  }`}
                >
                  <kpi.icon
                    className={`w-5 h-5 ${
                      kpi.color === "coral"
                        ? "text-coral"
                        : kpi.color === "blue"
                        ? "text-electric-blue"
                        : kpi.color === "violet"
                        ? "text-violet"
                        : "text-success"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-surface border-hairline-soft rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-app font-medium text-white">
                Revenue Overview
              </CardTitle>
              <Badge
                variant="outline"
                className="border-hairline-soft text-white/45 text-xs"
              >
                <TrendingUp className="w-3 h-3 mr-1 text-success" />
                +18.2% YoY
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6452db" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6452db" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6452db"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Deal Sources */}
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-app font-medium text-white">
              Deal Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dealSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dealSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface-elevated border border-hairline-soft rounded-md px-3 py-2 shadow-lg">
                            <p className="text-sm font-medium text-white">
                              {payload[0].name}: {payload[0].value}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {dealSourceData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-xs text-white/65">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline */}
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-app font-medium text-white">
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface-elevated border border-hairline-soft rounded-md px-3 py-2 shadow-lg">
                            <p className="text-xs text-white/45">{label}</p>
                            <p className="text-sm font-medium text-white">
                              {payload[0].value} deals
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" fill="#6452db" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-app font-medium text-white">
                Recent Activity
              </CardTitle>
              <Badge
                variant="outline"
                className="border-hairline-soft text-white/45 text-xs"
              >
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 py-3 border-b border-hairline-soft last:border-0"
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-md ${
                      activity.status === "positive"
                        ? "bg-success/10"
                        : activity.status === "warning"
                        ? "bg-warning/10"
                        : "bg-white/5"
                    }`}
                  >
                    {activity.status === "positive" ? (
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          activity.status === "positive" ? "text-success" : ""
                        }`}
                      />
                    ) : activity.status === "warning" ? (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    ) : (
                      <Clock className="w-4 h-4 text-white/45" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/85 truncate">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/30">{activity.user}</span>
                      <span className="text-xs text-white/20">·</span>
                      <span className="text-xs text-white/30">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
