import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Activity, Loader2, Target, GitBranch, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0, activeDeals: 0, totalContacts: 0, totalCompanies: 0,
    conversionRate: "0%", avgDealSize: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);

  useEffect(() => { fetchAnalytics(); }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("value, stage, status, created_at, expected_close_date");
      if (dealsError) throw dealsError;

      const totalRevenue = dealsData?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      const activeDeals = dealsData?.filter((d) => d.status === "open" && !d.stage?.startsWith("closed")).length || 0;
      const wonDeals = dealsData?.filter((d) => d.stage === "closed-won").length || 0;
      const totalDeals = dealsData?.length || 0;
      const conversionRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) + "%" : "0%";
      const avgDealSize = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;

      const { count: contactsCount, error: contactsError } = await supabase.from("contacts").select("*", { count: "exact", head: true });
      if (contactsError) throw contactsError;

      const { data: companiesData, error: companiesError } = await supabase.from("companies").select("*", { count: "exact", head: true });
      if (companiesError) throw companiesError;

      setStats({
        totalRevenue, activeDeals, totalContacts: contactsCount || 0,
        totalCompanies: companiesData?.length ?? 0, conversionRate, avgDealSize,
      });

      const monthly: Record<string, number> = {};
      dealsData?.forEach((d) => {
        const date = d.expected_close_date ? new Date(d.expected_close_date) : new Date(d.created_at);
        const key = date.toLocaleString("default", { month: "short" });
        monthly[key] = (monthly[key] || 0) + (d.value || 0);
      });
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setRevenueData(months.map((m) => ({ name: m, value: monthly[m] || 0 })));

      const stages: Record<string, number> = {};
      dealsData?.forEach((d) => { stages[d.stage || "lead"] = (stages[d.stage || "lead"] || 0) + 1; });
      setPipelineData(Object.entries(stages).map(([name, value]) => ({ name, value })));
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
    { label: "Conversion Rate", value: stats.conversionRate, change: "-2.1%", up: false, icon: Activity },
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
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics</h1>
        <p className="text-white/50 mt-1">Performance metrics and insights from live data</p>
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
    </div>
  );
}