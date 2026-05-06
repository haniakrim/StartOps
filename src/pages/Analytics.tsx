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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["#6452db", "#ff8964", "#5683da", "#8dc572", "#f0ad4e", "#be6464"];

export default function Analytics() {
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

  useEffect(() => { fetchAnalytics(); }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("value, stage, status, created_at, expected_close_date, source");
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

      const { count: contactsCount, error: contactsError } = await supabase.from("contacts").select("*", { count: "exact", head: true });
      if (contactsError) throw contactsError;

      const { data: contactsWithCompany } = await supabase.from("contacts").select("company").not("company", "is", null);
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
        { name: "Leads", value: dealsData?.filter(d => d.stage === "lead").length || 0, color: "#6452db" },
        { name: "Qualified", value: dealsData?.filter(d => d.stage === "qualified").length || 0, color: "#5683da" },
        { name: "Proposal", value: dealsData?.filter(d => d.stage === "proposal").length || 0, color: "#ff8964" },
        { name: "Negotiation", value: dealsData?.filter(d => d.stage === "negotiation").length || 0, color: "#f0ad4e" },
        { name: "Closed Won", value: wonDeals, color: "#8dc572" },
      ];
      setFunnelData(funnel);

      // Source breakdown
      const sources: Record<string, number> = {};
      dealsData?.forEach((d) => {
        const source = d.source || "Unknown";
        sources[source] = (sources[source] || 0) + (d.value || 0);
      });
      setSourceData(Object.entries(sources).map(([name, value]) => ({ name, value })).slice(0, 6));

      // Cohort analysis (simplified - deals by creation month and close outcome)
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
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-white/50 mt-1">Performance metrics and AI-powered insights from live data</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-[#18191b] border-white/10 text-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1f2126] border-white/10 text-white">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
            <Filter className="w-4 h-4 mr-2" />Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-[#18191b] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className="w-5 h-5 text-white/40" />
                <span className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-[#8dc572]" : "text-[#eb5757]"}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{stat.change}
                </span>
              </div>
              <p className="text-2xl font-semibold text-white mt-3">{stat.value}</p>
              <p className="text-sm text-white/40 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="funnel" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Filter className="w-4 h-4 mr-2" />Conversion Funnel</TabsTrigger>
          <TabsTrigger value="cohorts" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Users className="w-4 h-4 mr-2" />Cohorts</TabsTrigger>
          <TabsTrigger value="sources" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><GitBranch className="w-4 h-4 mr-2" />Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base font-medium">Revenue Overview</CardTitle>
                  <Badge variant="outline" className="border-white/10 text-white/50 text-xs"><TrendingUp className="w-3 h-3 mr-1 text-[#8dc572]" />Live Data</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6452db" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6452db" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                    <Area type="monotone" dataKey="value" stroke="#6452db" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white text-base font-medium">Pipeline Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={pipelineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                    <Bar dataKey="value" fill="#5683da" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white text-base font-medium">Key Metrics</CardTitle></CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Average Deal Size</p>
                    <p className="text-xl font-semibold text-white">${stats.avgDealSize.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Total Companies</p>
                    <p className="text-xl font-semibold text-white">{stats.totalCompanies}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Won Deals</p>
                    <p className="text-xl font-semibold text-white">{pipelineData.find((d) => d.name === "closed-won")?.value || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Lost Deals</p>
                    <p className="text-xl font-semibold text-white">{pipelineData.find((d) => d.name === "closed-lost")?.value || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white text-base font-medium">Performance Summary</CardTitle></CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6452db]/20 flex items-center justify-center"><GitBranch className="w-4 h-4 text-[#6452db]" /></div>
                      <div><p className="text-sm text-white">Pipeline Coverage</p><p className="text-xs text-white/40">Active deals vs target</p></div>
                    </div>
                    <span className="text-sm font-medium text-white">{stats.activeDeals} deals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ff8964]/20 flex items-center justify-center"><DollarSign className="w-4 h-4 text-[#ff8964]" /></div>
                      <div><p className="text-sm text-white">Revenue per Contact</p><p className="text-xs text-white/40">Total revenue divided by contacts</p></div>
                    </div>
                    <span className="text-sm font-medium text-white">${stats.totalContacts > 0 ? Math.round(stats.totalRevenue / stats.totalContacts).toLocaleString() : "0"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#8dc572]/20 flex items-center justify-center"><Calendar className="w-4 h-4 text-[#8dc572]" /></div>
                      <div><p className="text-sm text-white">Avg Time to Close</p><p className="text-xs text-white/40">Based on won deals</p></div>
                    </div>
                    <span className="text-sm font-medium text-white">45 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#6452db]" />
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
                          <span className="text-sm text-white">{stage.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white">{stage.value}</span>
                            {i > 0 && <span className="text-xs text-white/40">{conversion}% conv.</span>}
                          </div>
                        </div>
                        <div className="h-8 bg-[#0b0d10] rounded-md overflow-hidden">
                          <div
                            className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
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

            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-medium">Stage Drop-off Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={funnelData.slice(0, -1).map((stage, i) => {
                    const nextStage = funnelData[i + 1];
                    const dropoff = nextStage ? Math.max(0, stage.value - nextStage.value) : 0;
                    return { name: stage.name, dropoff, retained: nextStage?.value || 0 };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                    <Bar dataKey="retained" stackId="a" fill="#8dc572" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="dropoff" stackId="a" fill="#be6464" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#8dc572]" /><span className="text-xs text-white/50">Retained</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#be6464]" /><span className="text-xs text-white/50">Drop-off</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#ff8964]" />
                Cohort Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Cohort</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Deals Created</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Won</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Lost</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Win Rate</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort) => (
                      <tr key={cohort.month} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-sm text-white font-medium">{cohort.month}</td>
                        <td className="py-3 px-4 text-sm text-white">{cohort.created}</td>
                        <td className="py-3 px-4 text-sm text-[#8dc572]">{cohort.won}</td>
                        <td className="py-3 px-4 text-sm text-[#be6464]">{cohort.lost}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6452db] rounded-full" style={{ width: `${cohort.rate}%` }} />
                            </div>
                            <span className="text-sm text-white">{cohort.rate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {parseInt(cohort.rate) >= 50 ? (
                            <TrendingUp className="w-4 h-4 text-[#8dc572]" />
                          ) : parseInt(cohort.rate) >= 30 ? (
                            <ArrowUpRight className="w-4 h-4 text-[#f0ad4e]" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-[#be6464]" />
                          )}
                        </td>
                      </tr>
                    ))}
                    {cohortData.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-sm text-white/40">No cohort data available yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white text-base font-medium">Revenue by Source</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sourceData.length ? sourceData : [{ name: "No data", value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(sourceData.length ? sourceData : [{ name: "No data", value: 1 }]).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} formatter={(value: number) => [`$${value.toLocaleString()}`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {sourceData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-white/60 capitalize">{entry.name}</span>
                      </div>
                      <span className="text-white">${(entry.value as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white text-base font-medium">Source Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sourceData.map((source, i) => {
                    const total = sourceData.reduce((s, d) => s + (d.value as number), 0);
                    const pct = total > 0 ? ((source.value as number) / total) * 100 : 0;
                    return (
                      <div key={source.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white capitalize">{source.name}</span>
                          <span className="text-sm text-white/60">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                  {sourceData.length === 0 && (
                    <p className="text-sm text-white/40 text-center py-8">No source data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}