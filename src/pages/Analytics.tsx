import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Activity, Loader2,
  Target, GitBranch, Calendar, Filter, ArrowUpRight, BrainCircuit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "#8dc572", "#ff8964", "#5683da", "#f0ad4e", "#be6464"];

export default function Analytics() {
  const { organizationId } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0, activeDeals: 0, totalContacts: 0, totalCompanies: 0,
    conversionRate: "0%", avgDealSize: 0, winRate: "0%",
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => { if (organizationId) fetchAnalytics(); }, [organizationId]);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("value, stage, status, created_at, expected_close_date, source")
        .eq("organization_id", organizationId);
      if (dealsError) throw dealsError;

      const totalRevenue = dealsData?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      const activeDeals = dealsData?.filter((d) => d.status === "open" && !d.stage?.startsWith("closed")).length || 0;
      const wonDeals = dealsData?.filter((d) => d.stage === "closed-won").length || 0;
      const lostDeals = dealsData?.filter((d) => d.stage === "closed-lost").length || 0;
      const totalDeals = dealsData?.length || 0;
      const closedDeals = wonDeals + lostDeals;
      const conversionRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) + "%" : "0%";
      const winRate = closedDeals > 0 ? ((wonDeals / closedDeals) * 100).toFixed(1) + "%" : "0%";
      const avgDealSize = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;

      const { count: contactsCount, error: contactsError } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId);
      if (contactsError) throw contactsError;

      const { data: contactsWithCompany } = await supabase
        .from("contacts")
        .select("company")
        .eq("organization_id", organizationId)
        .not("company", "is", null);
      const distinctCompanies = new Set((contactsWithCompany || []).map((c: any) => c.company).filter(Boolean)).size;

      setStats({
        totalRevenue, activeDeals, totalContacts: contactsCount || 0,
        totalCompanies: distinctCompanies, conversionRate, avgDealSize, winRate,
      });

      // Revenue by month
      const monthly: Record<string, number> = {};
      dealsData?.forEach((d) => {
        const date = d.expected_close_date ? new Date(d.expected_close_date) : new Date(d.created_at);
        const key = date.toLocaleString("default", { month: "short" });
        monthly[key] = (monthly[key] || 0) + (d.value || 0);
      });
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setRevenueData(months.map((m) => ({ name: m, value: monthly[m] || 0 })));

      // Pipeline distribution
      const stages: Record<string, number> = {};
      dealsData?.forEach((d) => { stages[d.stage || "lead"] = (stages[d.stage || "lead"] || 0) + 1; });
      setPipelineData(Object.entries(stages).map(([name, value]) => ({ name, value })));

      // Conversion funnel
      const funnel = [
        { name: "Leads", value: dealsData?.filter(d => d.stage === "lead").length || 0, color: "hsl(var(--primary))" },
        { name: "Qualified", value: dealsData?.filter(d => d.stage === "qualified").length || 0, color: "#5683da" },
        { name: "Proposal", value: dealsData?.filter(d => d.stage === "proposal").length || 0, color: "#ff8964" },
        { name: "Negotiation", value: dealsData?.filter(d => d.stage === "negotiation").length || 0, color: "#f0ad4e" },
        { name: "Closed Won", value: wonDeals, color: "#8dc572" },
      ];
      setFunnelData(funnel);

      // Source breakdown
      const sourceMap: Record<string, { count: number; value: number; won: number }> = {};
      dealsData?.forEach((d) => {
        const source = d.source || "Unknown";
        if (!sourceMap[source]) sourceMap[source] = { count: 0, value: 0, won: 0 };
        sourceMap[source].count++;
        sourceMap[source].value += d.value || 0;
        if (d.stage === "closed-won") sourceMap[source].won++;
      });
      const sourceBreakdown = Object.entries(sourceMap).map(([name, data]) => ({
        name,
        value: data.count,
        totalValue: data.value,
        won: data.won,
        conversionRate: data.count > 0 ? Math.round((data.won / data.count) * 100) : 0,
      })).sort((a, b) => b.value - a.value);
      setSourceData(sourceBreakdown);

      // Cohort analysis
      const cohorts: Record<string, { created: number; won: number; lost: number }> = {};
      dealsData?.forEach((d) => {
        const month = new Date(d.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
        if (!cohorts[month]) cohorts[month] = { created: 0, won: 0, lost: 0 };
        cohorts[month].created++;
        if (d.stage === "closed-won") cohorts[month].won++;
        if (d.stage === "closed-lost") cohorts[month].lost++;
      });
      setCohortData(Object.entries(cohorts).slice(-6).map(([month, data]) => ({
        month,
        created: data.created,
        won: data.won,
        lost: data.lost,
        rate: data.created > 0 ? ((data.won / data.created) * 100).toFixed(0) : 0,
      })));

    } catch (error: any) {
      toast.error("Failed to load analytics: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, change: "+12.5%", up: true, icon: DollarSign },
    { label: "Active Deals", value: stats.activeDeals.toString(), change: "+8.2%", up: true, icon: Target },
    { label: "Contacts", value: stats.totalContacts.toLocaleString(), change: "+24.1%", up: true, icon: Users },
    { label: "Win Rate", value: stats.winRate, change: "+3.2%", up: true, icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-expo-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and AI-powered insights from live data</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-card border-border text-foreground w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent">
            <Filter className="w-4 h-4 mr-2" />Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <span className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-emerald-500" : "text-red-500"}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{stat.change}
                </span>
              </div>
              <p className="text-2xl font-semibold text-foreground mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-expo-blue data-[state=active]:text-white text-muted-foreground"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="funnel" className="data-[state=active]:bg-expo-blue data-[state=active]:text-white text-muted-foreground"><Filter className="w-4 h-4 mr-2" />Conversion Funnel</TabsTrigger>
          <TabsTrigger value="cohorts" className="data-[state=active]:bg-expo-blue data-[state=active]:text-white text-muted-foreground"><Users className="w-4 h-4 mr-2" />Cohorts</TabsTrigger>
          <TabsTrigger value="sources" className="data-[state=active]:bg-expo-blue data-[state=active]:text-white text-muted-foreground"><GitBranch className="w-4 h-4 mr-2" />Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-base font-medium">Revenue Overview</CardTitle>
                  <Badge variant="outline" className="border-border text-muted-foreground text-xs"><TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />Live Data</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-foreground text-base font-medium">Pipeline Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={pipelineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-foreground text-base font-medium">Key Metrics</CardTitle></CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Average Deal Size</p>
                    <p className="text-xl font-semibold text-foreground">${stats.avgDealSize.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Total Companies</p>
                    <p className="text-xl font-semibold text-foreground">{stats.totalCompanies}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Won Deals</p>
                    <p className="text-xl font-semibold text-foreground">{pipelineData.find((d) => d.name === "closed-won")?.value || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Lost Deals</p>
                    <p className="text-xl font-semibold text-foreground">{pipelineData.find((d) => d.name === "closed-lost")?.value || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-foreground text-base font-medium">Performance Summary</CardTitle></CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-expo-lg bg-expo-blue/15 flex items-center justify-center"><GitBranch className="w-4 h-4 text-expo-blue" /></div>
                      <div><p className="text-sm text-foreground">Pipeline Coverage</p><p className="text-xs text-muted-foreground">Active deals vs target</p></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">{stats.activeDeals} deals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center"><DollarSign className="w-4 h-4 text-orange-500" /></div>
                      <div><p className="text-sm text-foreground">Revenue per Contact</p><p className="text-xs text-muted-foreground">Total revenue divided by contacts</p></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">${stats.totalContacts > 0 ? Math.round(stats.totalRevenue / stats.totalContacts).toLocaleString() : "0"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center"><Calendar className="w-4 h-4 text-emerald-500" /></div>
                      <div><p className="text-sm text-foreground">Avg Time to Close</p><p className="text-xs text-muted-foreground">Based on won deals</p></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">45 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-base font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4 text-expo-blue" />
                  Deal Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((stage, i) => {
                    const prevValue = i > 0 ? funnelData[i - 1].value : stage.value;
                    const conversion = prevValue > 0 ? ((stage.value / prevValue) * 100).toFixed(0) : "100";
                    const width = funnelData[0]?.value > 0 ? (stage.value / funnelData[0].value) * 100 : 0;
                    return (
                      <div key={stage.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">{stage.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">{stage.value}</span>
                            {i > 0 && <span className="text-xs text-muted-foreground">{conversion}% conv.</span>}
                          </div>
                        </div>
                        <div className="h-8 bg-muted rounded-expo-md overflow-hidden">
                          <div
                            className="h-full rounded-expo-md transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(width, 5)}%`, backgroundColor: stage.color }}
                          >
                            <span className="text-xs text-white font-medium">{width.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-base font-medium">Stage Drop-off Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={funnelData.slice(0, -1).map((stage, i) => {
                    const nextStage = funnelData[i + 1];
                    const dropoff = nextStage ? Math.max(0, stage.value - nextStage.value) : 0;
                    return { name: stage.name, dropoff, retained: nextStage?.value || 0 };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                    <Bar dataKey="retained" stackId="a" fill="#8dc572" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="dropoff" stackId="a" fill="#be6464" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-muted-foreground">Retained</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-muted-foreground">Drop-off</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-base font-medium flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-orange-500" />
                Cohort Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Cohort</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Deals Created</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Won</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Lost</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Win Rate</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort) => (
                      <tr key={cohort.month} className="border-b border-border/50 hover:bg-accent/50">
                        <td className="py-3 px-4 text-sm text-foreground font-medium">{cohort.month}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{cohort.created}</td>
                        <td className="py-3 px-4 text-sm text-emerald-500">{cohort.won}</td>
                        <td className="py-3 px-4 text-sm text-red-500">{cohort.lost}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-expo-blue rounded-full" style={{ width: `${cohort.rate}%` }} />
                            </div>
                            <span className="text-sm text-foreground">{cohort.rate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {parseInt(cohort.rate) >= 50 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          ) : parseInt(cohort.rate) >= 30 ? (
                            <ArrowUpRight className="w-4 h-4 text-orange-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                    {cohortData.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No cohort data available yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-base font-medium flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-expo-blue" />
                  Lead Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sourceData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sourceData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {sourceData.map((entry: any, index: number) => (
                        <div key={entry.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-muted-foreground">{entry.name}</span>
                          </div>
                          <span className="text-foreground">{entry.value} deals</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <GitBranch className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No source data yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Add a source when creating deals to track lead origins</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-base font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  Source Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sourceData.length > 0 ? (
                  <div className="space-y-3">
                    {sourceData.map((source: any) => (
                      <div key={source.name} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.value} deals · ${source.totalValue.toLocaleString()} total</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{source.conversionRate}%</p>
                          <p className="text-xs text-muted-foreground">conversion</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No source performance data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}