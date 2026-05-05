import { useState } from "react";
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

const stats = [
  {
    title: "Total Revenue",
    value: "$847,500",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "#ff8964",
  },
  {
    title: "Active Deals",
    value: "147",
    change: "+8.2%",
    trend: "up",
    icon: Target,
    color: "#5683da",
  },
  {
    title: "Contacts",
    value: "2,847",
    change: "+24.1%",
    trend: "up",
    icon: Users,
    color: "#6452db",
  },
  {
    title: "Companies",
    value: "432",
    change: "-2.4%",
    trend: "down",
    icon: Building2,
    color: "#8dc572",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "deal",
    title: "Acme Corp deal moved to Negotiation",
    user: "Sarah Chen",
    time: "2 min ago",
    icon: DollarSign,
    color: "#ff8964",
  },
  {
    id: 2,
    type: "contact",
    title: "New contact: James Wilson",
    user: "Mike Ross",
    time: "15 min ago",
    icon: Users,
    color: "#5683da",
  },
  {
    id: 3,
    type: "email",
    title: "Email sent to TechStart Inc",
    user: "Sarah Chen",
    time: "1 hr ago",
    icon: Mail,
    color: "#6452db",
  },
  {
    id: 4,
    type: "call",
    title: "Call completed with Global Systems",
    user: "Mike Ross",
    time: "2 hr ago",
    icon: Phone,
    color: "#8dc572",
  },
  {
    id: 5,
    type: "meeting",
    title: "Meeting scheduled with Apex Solutions",
    user: "John Doe",
    time: "3 hr ago",
    icon: Calendar,
    color: "#f0ad4e",
  },
];

const topDeals = [
  { company: "Acme Corporation", value: "$125,000", stage: "Negotiation", probability: 75 },
  { company: "TechStart Inc", value: "$89,000", stage: "Proposal", probability: 60 },
  { company: "Global Systems", value: "$67,500", stage: "Qualified", probability: 45 },
  { company: "Apex Solutions", value: "$45,000", stage: "Proposal", probability: 55 },
  { company: "DataFlow Ltd", value: "$38,000", stage: "Negotiation", probability: 80 },
];

const stageColors: Record<string, string> = {
  Lead: "bg-white/10 text-white/60",
  Qualified: "bg-[#5683da]/20 text-[#5683da]",
  Proposal: "bg-[#6452db]/20 text-[#6452db]",
  Negotiation: "bg-[#ff8964]/20 text-[#ff8964]",
  Closed: "bg-[#8dc572]/20 text-[#8dc572]",
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("month");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Welcome back, John. Here's what's happening today.
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
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-[#18191b] border-white/10"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
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
              {topDeals.map((deal) => (
                <div key={deal.company} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {deal.company}
                      </p>
                      <p className="text-sm font-semibold text-white ml-2">
                        {deal.value}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${stageColors[deal.stage] || ""}`}
                      >
                        {deal.stage}
                      </Badge>
                      <div className="flex-1">
                        <Progress
                          value={deal.probability}
                          className="h-1.5 bg-white/10"
                        />
                      </div>
                      <span className="text-xs text-white/40 w-8 text-right">
                        {deal.probability}%
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${activity.color}15` }}
                  >
                    <activity.icon
                      className="w-4 h-4"
                      style={{ color: activity.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40">
                        {activity.user}
                      </span>
                      <span className="text-xs text-white/20">·</span>
                      <span className="text-xs text-white/40">
                        {activity.time}
                      </span>
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
