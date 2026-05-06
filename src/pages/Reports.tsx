import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Loader2,
  BarChart3,
  DollarSign,
  Activity,
  Mail,
  CheckCircle2,
  TrendingUp,
  Users,
  GitBranch,
  Phone,
  MessageSquare,
  BrainCircuit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const COLORS = ["#6452db", "#ff8964", "#5683da", "#8dc572", "#f0ad4e", "#be6464"];

interface DateRange {
  label: string;
  start: string;
  end: string;
}

const dateRanges: DateRange[] = [
  {
    label: "Last 7 days",
    start: new Date(Date.now() - 7 * 86400000).toISOString(),
    end: new Date().toISOString(),
  },
  {
    label: "Last 30 days",
    start: new Date(Date.now() - 30 * 86400000).toISOString(),
    end: new Date().toISOString(),
  },
  {
    label: "This quarter",
    start: new Date(
      new Date().getFullYear(),
      Math.floor(new Date().getMonth() / 3) * 3,
      1
    ).toISOString(),
    end: new Date().toISOString(),
  },
  {
    label: "This year",
    start: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    end: new Date().toISOString(),
  },
  {
    label: "All time",
    start: new Date(2020, 0, 1).toISOString(),
    end: new Date().toISOString(),
  },
];

function downloadCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report downloaded");
}

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [activeTab, setActiveTab] = useState("pipeline");

  // Pipeline report state
  const [pipelineStats, setPipelineStats] = useState({
    totalDeals: 0,
    totalValue: 0,
    avgDealSize: 0,
    winRate: "0%",
  });
  const [pipelineStageData, setPipelineStageData] = useState<any[]>([]);
  const [pipelineDeals, setPipelineDeals] = useState<any[]>([]);

  // Revenue report state
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    outstanding: 0,
    overdue: 0,
    paidInvoices: 0,
  });
  const [revenueMonthly, setRevenueMonthly] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Activity report state
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    completed: 0,
    pending: 0,
    completionRate: "0%",
  });
  const [activitiesByType, setActivitiesByType] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Communication report state
  const [commStats, setCommStats] = useState({
    totalComms: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [commsByType, setCommsByType] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);

  const range = dateRanges.find((r) => r.label === dateRange) || dateRanges[1];

  useEffect(() => {
    fetchReportData();
  }, [dateRange, activeTab]);

  async function fetchReportData() {
    setLoading(true);
    try {
      if (activeTab === "pipeline") await fetchPipelineReport();
      if (activeTab === "revenue") await fetchRevenueReport();
      if (activeTab === "activities") await fetchActivityReport();
      if (activeTab === "communications") await fetchCommunicationReport();
    } catch (error: any) {
      toast.error("Failed to load report: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPipelineReport() {
    const { data: deals } = await supabase
      .from("deals")
      .select("id, name, value, stage, probability, status, expected_close_date, created_at, contacts:contact_id (first_name, last_name, company)")
      .gte("created_at", range.start)
      .lte("created_at", range.end);

    const dealsList = (deals || []).map((d: any) => ({
      ...d,
      contacts: d.contacts?.[0] ?? null,
    }));

    const totalValue = dealsList.reduce((s, d) => s + (d.value || 0), 0);
    const won = dealsList.filter((d) => d.stage === "closed-won").length;
    const closed = dealsList.filter((d) => d.stage?.startsWith("closed")).length;

    setPipelineStats({
      totalDeals: dealsList.length,
      totalValue,
      avgDealSize: dealsList.length > 0 ? Math.round(totalValue / dealsList.length) : 0,
      winRate: closed > 0 ? `${((won / closed) * 100).toFixed(1)}%` : "0%",
    });

    const stages: Record<string, number> = {};
    dealsList.forEach((d) => {
      stages[d.stage || "lead"] = (stages[d.stage || "lead"] || 0) + 1;
    });
    setPipelineStageData(
      Object.entries(stages).map(([name, value]) => ({ name, value }))
    );

    setPipelineDeals(dealsList);
  }

  async function fetchRevenueReport() {
    const { data: invData } = await supabase
      .from("invoices")
      .select("id, invoice_number, amount, status, due_date, paid_date, created_at, contacts:contact_id (first_name, last_name)")
      .gte("created_at", range.start)
      .lte("created_at", range.end);

    const invList = (invData || []).map((i: any) => ({
      ...i,
      contacts: i.contacts?.[0] ?? null,
    }));

    const totalRevenue = invList
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + (i.amount || 0), 0);
    const outstanding = invList
      .filter((i) => i.status === "sent" || i.status === "pending")
      .reduce((s, i) => s + (i.amount || 0), 0);
    const overdue = invList
      .filter((i) => i.status === "overdue")
      .reduce((s, i) => s + (i.amount || 0), 0);

    setRevenueStats({
      totalRevenue,
      outstanding,
      overdue,
      paidInvoices: invList.filter((i) => i.status === "paid").length,
    });

    const monthly: Record<string, number> = {};
    invList.forEach((i) => {
      const date = i.paid_date ? new Date(i.paid_date) : new Date(i.created_at);
      const key = date.toLocaleString("default", { month: "short" });
      if (i.status === "paid") monthly[key] = (monthly[key] || 0) + (i.amount || 0);
    });
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    setRevenueMonthly(months.map((m) => ({ name: m, value: monthly[m] || 0 })));

    setInvoices(invList);
  }

  async function fetchActivityReport() {
    const { data: actData } = await supabase
      .from("activities")
      .select("id, type, subject, status, priority, due_date, completed_at, created_at")
      .gte("created_at", range.start)
      .lte("created_at", range.end);

    const actList = actData || [];
    const completed = actList.filter((a) => a.status === "completed").length;

    setActivityStats({
      totalActivities: actList.length,
      completed,
      pending: actList.filter((a) => a.status !== "completed").length,
      completionRate: actList.length > 0 ? `${((completed / actList.length) * 100).toFixed(0)}%` : "0%",
    });

    const types: Record<string, number> = {};
    actList.forEach((a) => {
      types[a.type || "task"] = (types[a.type || "task"] || 0) + 1;
    });
    setActivitiesByType(
      Object.entries(types).map(([name, value]) => ({ name, value }))
    );

    setActivities(actList);
  }

  async function fetchCommunicationReport() {
    const { data: commData } = await supabase
      .from("communications")
      .select("id, type, subject, sentiment, occurred_at, created_at")
      .gte("created_at", range.start)
      .lte("created_at", range.end);

    const commList = commData || [];
    const sentiments = commList.reduce(
      (acc: any, c) => {
        acc[c.sentiment || "neutral"] = (acc[c.sentiment || "neutral"] || 0) + 1;
        return acc;
      },
      {}
    );

    setCommStats({
      totalComms: commList.length,
      positive: sentiments.positive || 0,
      negative: sentiments.negative || 0,
      neutral: sentiments.neutral || 0,
    });

    const types: Record<string, number> = {};
    commList.forEach((c) => {
      types[c.type || "email"] = (types[c.type || "email"] || 0) + 1;
    });
    setCommsByType(
      Object.entries(types).map(([name, value]) => ({ name, value }))
    );

    setCommunications(commList);
  }

  const statusColors: Record<string, string> = {
    draft: "bg-white/10 text-white/50",
    sent: "bg-[#5683da]/20 text-[#5683da]",
    paid: "bg-[#8dc572]/20 text-[#8dc572]",
    overdue: "bg-[#be6464]/20 text-[#be6464]",
    pending: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
    open: "bg-[#5683da]/20 text-[#5683da]",
    completed: "bg-[#8dc572]/20 text-[#8dc572]",
    cancelled: "bg-[#be6464]/20 text-[#be6464]",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Structured, exportable business intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="bg-[#18191b] border-white/10 text-white w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1f2126] border-white/10 text-white">
              {dateRanges.map((r) => (
                <SelectItem key={r.label} value={r.label}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportData}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="pipeline"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Activity className="w-4 h-4 mr-2" />
            Activities
          </TabsTrigger>
          <TabsTrigger
            value="communications"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Communications
          </TabsTrigger>
        </TabsList>

        {/* Pipeline Report */}
        <TabsContent value="pipeline" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <GitBranch className="w-5 h-5 text-[#6452db] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {pipelineStats.totalDeals}
                </p>
                <p className="text-sm text-white/50">Total Deals</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <DollarSign className="w-5 h-5 text-[#ff8964] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  ${pipelineStats.totalValue.toLocaleString()}
                </p>
                <p className="text-sm text-white/50">Pipeline Value</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <BarChart3 className="w-5 h-5 text-[#5683da] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  ${pipelineStats.avgDealSize.toLocaleString()}
                </p>
                <p className="text-sm text-white/50">Avg Deal Size</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <TrendingUp className="w-5 h-5 text-[#8dc572] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {pipelineStats.winRate}
                </p>
                <p className="text-sm text-white/50">Win Rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-base font-medium">
                  Deals by Stage
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    downloadCSV(
                      pipelineStageData.map((d) => ({
                        Stage: d.name,
                        "Deal Count": d.value,
                      })),
                      "pipeline-stage-report.csv"
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
                  <BarChart data={pipelineStageData}>
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
                    <Bar dataKey="value" fill="#6452db" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-medium">
                  Stage Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pipelineStageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pipelineStageData.map((_, index) => (
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
                  {pipelineStageData.map((entry, index) => (
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
                        <span className="text-white/60">{entry.name}</span>
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
                Deal Details
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  downloadCSV(
                    pipelineDeals.map((d) => ({
                      Name: d.name,
                      Company: d.contacts?.company || "-",
                      Stage: d.stage,
                      Value: d.value || 0,
                      Probability: `${d.probability || 0}%`,
                      Status: d.status,
                    })),
                    "deals-report.csv"
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
                        Deal
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                        Company
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                        Stage
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                        Value
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                        Probability
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipelineDeals.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-sm text-white/40"
                        >
                          No deals in selected period
                        </td>
                      </tr>
                    )}
                    {pipelineDeals.map((deal) => (
                      <tr
                        key={deal.id}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="py-3 px-4 text-sm text-white font-medium">
                          {deal.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-white/70">
                          {deal.contacts?.company || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${statusColors[deal.status] || statusColors.open}`}
                          >
                            {deal.stage}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          ${(deal.value || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-white/70">
                          {deal.probability || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Report */}
        <TabsContent value="revenue" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <DollarSign className="w-5 h-5 text-[#8dc572] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  ${revenueStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-white/50">Revenue Collected</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <FileText className="w-5 h-5 text-[#5683da] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  ${revenueStats.outstanding.toLocaleString()}
                </p>
                <p className="text-sm text-white/50">Outstanding</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <TrendingUp className="w-5 h-5 text-[#be6464] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  ${revenueStats.overdue.toLocaleString()}
                </p>
                <p className="text-sm text-white/50">Overdue</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <CheckCircle2 className="w-5 h-5 text-[#6452db] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {revenueStats.paidInvoices}
                </p>
                <p className="text-sm text-white/50">Paid Invoices</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#18191b] border-white/10">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base font-medium">
                Revenue by Month
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  downloadCSV(
                    revenueMonthly.map((d) => ({
                      Month: d.name,
                      Revenue: d.value,
                    })),
                    "revenue-monthly-report.csv"
                  )
                }
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueMonthly}>
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
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2126",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="value" fill="#8dc572" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#18191b] border-white/10">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base font-medium">
                Invoice Details
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  downloadCSV(
                    invoices.map((i) => ({
                      "Invoice #": i.invoice_number,
                      Client: i.contacts
                        ? `${i.contacts.first_name} ${i.contacts.last_name}`
                        : "-",
                      Amount: i.amount || 0,
                      Status: i.status,
                      "Due Date": i.due_date
                        ? new Date(i.due_date).toLocaleDateString()
                        : "-",
                    })),
                    "invoices-report.csv"
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
                        Invoice
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                        Client
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-sm text-white/40"
                        >
                          No invoices in selected period
                        </td>
                      </tr>
                    )}
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="py-3 px-4 text-sm text-white font-medium">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4 text-sm text-white/70">
                          {inv.contacts
                            ? `${inv.contacts.first_name} ${inv.contacts.last_name}`
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          ${(inv.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${statusColors[inv.status] || statusColors.draft}`}
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/50">
                          {inv.due_date
                            ? new Date(inv.due_date).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Report */}
        <TabsContent value="activities" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <Activity className="w-5 h-5 text-[#6452db] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {activityStats.totalActivities}
                </p>
                <p className="text-sm text-white/50">Total Activities</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <CheckCircle2 className="w-5 h-5 text-[#8dc572] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {activityStats.completed}
                </p>
                <p className="text-sm text-white/50">Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <Calendar className="w-5 h-5 text-[#f0ad4e] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {activityStats.pending}
                </p>
                <p className="text-sm text-white/50">Pending</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <TrendingUp className="w-5 h-5 text-[#5683da] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {activityStats.completionRate}
                </p>
                <p className="text-sm text-white/50">Completion Rate</p>
              </CardContent>
            </Card>
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
                      activitiesByType.map((d) => ({
                        Type: d.name,
                        Count: d.value,
                      })),
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
                  <BarChart data={activitiesByType}>
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
                    <Bar dataKey="value" fill="#ff8964" radius={[4, 4, 0, 0]} />
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
                      data={activitiesByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {activitiesByType.map((_, index) => (
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
                  {activitiesByType.map((entry, index) => (
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
                    activities.map((a) => ({
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
                    {activities.map((act) => (
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
                            className={`text-xs ${statusColors[act.status] || statusColors.open}`}
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
        </TabsContent>

        {/* Communications Report */}
        <TabsContent value="communications" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <Mail className="w-5 h-5 text-[#6452db] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {commStats.totalComms}
                </p>
                <p className="text-sm text-white/50">Total Communications</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <TrendingUp className="w-5 h-5 text-[#8dc572] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {commStats.positive}
                </p>
                <p className="text-sm text-white/50">Positive</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <MessageSquare className="w-5 h-5 text-[#5683da] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {commStats.neutral}
                </p>
                <p className="text-sm text-white/50">Neutral</p>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardContent className="p-5">
                <TrendingUp className="w-5 h-5 text-[#be6464] mb-3" />
                <p className="text-2xl font-semibold text-white">
                  {commStats.negative}
                </p>
                <p className="text-sm text-white/50">Negative</p>
              </CardContent>
            </Card>
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
                      commsByType.map((d) => ({
                        Type: d.name,
                        Count: d.value,
                      })),
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
                  <BarChart data={commsByType}>
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
                    {
                      label: "Positive",
                      value: commStats.positive,
                      color: "#8dc572",
                    },
                    {
                      label: "Neutral",
                      value: commStats.neutral,
                      color: "#5683da",
                    },
                    {
                      label: "Negative",
                      value: commStats.negative,
                      color: "#be6464",
                    },
                  ].map((item) => {
                    const total = commStats.totalComms || 1;
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
                            style={{
                              width: `${pct}%`,
                              backgroundColor: item.color,
                            }}
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
                    communications.map((c) => ({
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
                    {communications.map((comm) => (
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
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
        </div>
      )}
    </div>
  );
}