import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const revenueData = [
  { name: "Jan", actual: 42000, forecast: 40000 },
  { name: "Feb", actual: 38000, forecast: 42000 },
  { name: "Mar", actual: 55000, forecast: 48000 },
  { name: "Apr", actual: 48000, forecast: 50000 },
  { name: "May", actual: 62000, forecast: 55000 },
  { name: "Jun", actual: 58000, forecast: 60000 },
  { name: "Jul", actual: 75000, forecast: 65000 },
  { name: "Aug", actual: 68000, forecast: 70000 },
  { name: "Sep", actual: 82000, forecast: 75000 },
  { name: "Oct", actual: 78000, forecast: 80000 },
  { name: "Nov", actual: 95000, forecast: 85000 },
  { name: "Dec", actual: 88000, forecast: 90000 },
];

const conversionData = [
  { name: "Lead", value: 450 },
  { name: "Qualified", value: 320 },
  { name: "Proposal", value: 180 },
  { name: "Negotiation", value: 95 },
  { name: "Closed", value: 68 },
];

const sourceData = [
  { name: "Direct", value: 35, color: "#ff8964" },
  { name: "Referral", value: 25, color: "#5683da" },
  { name: "Organic", value: 20, color: "#6452db" },
  { name: "Paid Ads", value: 15, color: "#8dc572" },
  { name: "Social", value: 5, color: "#f0ad4e" },
];

const teamPerformance = [
  { name: "Sarah Chen", deals: 24, revenue: 485000, conversion: 68 },
  { name: "Mike Ross", deals: 18, revenue: 320000, conversion: 55 },
  { name: "Lisa Park", deals: 15, revenue: 275000, conversion: 62 },
  { name: "David Kim", deals: 12, revenue: 210000, conversion: 48 },
  { name: "Emily Brown", deals: 10, revenue: 185000, conversion: 71 },
];

const kpis = [
  {
    title: "Total Revenue",
    value: "$847,500",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "#ff8964",
  },
  {
    title: "Win Rate",
    value: "68%",
    change: "+5.2%",
    trend: "up",
    icon: Target,
    color: "#5683da",
  },
  {
    title: "Avg Deal Size",
    value: "$42,800",
    change: "+8.1%",
    trend: "up",
    icon: BarChart3,
    color: "#6452db",
  },
  {
    title: "Sales Cycle",
    value: "32 days",
    change: "-4 days",
    trend: "up",
    icon: Calendar,
    color: "#8dc572",
  },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("year");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Analytics & Reporting
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Advanced insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <div className="flex items-center gap-1 bg-[#18191b] border border-white/10 rounded-md p-1">
            {(["week", "month", "quarter", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  timeRange === range
                    ? "bg-[#6452db] text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    kpi.trend === "up"
                      ? "bg-[#8dc572]/20 text-[#8dc572]"
                      : "bg-[#be6464]/20 text-[#be6464]"
                  }`}
                >
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {kpi.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-white">{kpi.value}</p>
                <p className="text-sm text-white/50 mt-1">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="pipeline"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Activity className="w-4 h-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger
            value="sources"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Sources
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Users className="w-4 h-4 mr-2" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base font-medium">
                  Revenue vs Forecast
                </CardTitle>
                <Badge
                  variant="outline"
                  className="border-white/10 text-white/50 text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1 text-[#8dc572]" />
                  +8.3% vs forecast
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6452db" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6452db" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5683da" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#5683da" stopOpacity={0} />
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
                  />
                  <Legend
                    wrapperStyle={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="Actual Revenue"
                    stroke="#6452db"
                    strokeWidth={2}
                    fill="url(#actual)"
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    name="Forecast"
                    stroke="#5683da"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#forecast)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-medium">
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={conversionData} layout="vertical">
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
                    <Bar dataKey="value" fill="#6452db" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-medium">
                  Stage Conversion Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: "Lead → Qualified", rate: 71, count: "320/450" },
                    { stage: "Qualified → Proposal", rate: 56, count: "180/320" },
                    { stage: "Proposal → Negotiation", rate: 53, count: "95/180" },
                    { stage: "Negotiation → Closed", rate: 72, count: "68/95" },
                  ].map((item) => (
                    <div key={item.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">{item.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {item.rate}%
                          </span>
                          <span className="text-xs text-white/40">
                            {item.count}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.rate}%`,
                            backgroundColor:
                              item.rate >= 70
                                ? "#8dc572"
                                : item.rate >= 50
                                ? "#5683da"
                                : "#ff8964",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-medium">
                  Lead Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RePieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                    <Legend
                      wrapperStyle={{ color: "rgba(255,255,255,0.6)" }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-medium">
                  Source Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sourceData.map((source) => (
                    <div
                      key={source.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="text-sm text-white">{source.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-white">
                          {source.value}%
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
                        >
                          +12%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Team Member
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Deals Closed
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Conversion
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((member) => (
                    <tr
                      key={member.name}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-white">
                          {member.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/70">
                        {member.deals}
                      </td>
                      <td className="py-3 px-4 text-sm text-white/70">
                        ${member.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-white">
                          {member.conversion}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${member.conversion}%`,
                                backgroundColor:
                                  member.conversion >= 65
                                    ? "#8dc572"
                                    : member.conversion >= 50
                                    ? "#5683da"
                                    : "#ff8964",
                              }}
                            />
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              member.conversion >= 65
                                ? "bg-[#8dc572]/20 text-[#8dc572]"
                                : member.conversion >= 50
                                ? "bg-[#5683da]/20 text-[#5683da]"
                                : "bg-[#ff8964]/20 text-[#ff8964]"
                            }`}
                          >
                            {member.conversion >= 65
                              ? "Top"
                              : member.conversion >= 50
                              ? "Good"
                              : "Needs Work"}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
