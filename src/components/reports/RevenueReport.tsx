import { useState, useEffect } from "react";
import {
  DollarSign,
  FileText,
  TrendingUp,
  CheckCircle2,
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
} from "recharts";
import type { DateRange } from "@/lib/reports";
import { downloadCSV, statusColors } from "@/lib/reports";

export function RevenueReport({ range }: { range: DateRange }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    outstanding: 0,
    overdue: 0,
    paidInvoices: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetchRevenueReport();
  }, [range.start, range.end]);

  async function fetchRevenueReport() {
    try {
      setLoading(true);
      const { data: invData } = await supabase
        .from("invoices")
        .select(
          "id, invoice_number, amount, status, due_date, paid_date, created_at, contacts:contact_id (first_name, last_name)"
        )
        .gte("created_at", range.start)
        .lte("created_at", range.end);

      const invList = (invData || []).map((i: any) => ({
        ...i,
        contacts: i.contacts?.[0] ?? null,
      }));

      const totalRevenue = invList
        .filter((i: any) => i.status === "paid")
        .reduce((s: number, i: any) => s + (i.amount || 0), 0);
      const outstanding = invList
        .filter(
          (i: any) => i.status === "sent" || i.status === "pending"
        )
        .reduce((s: number, i: any) => s + (i.amount || 0), 0);
      const overdue = invList
        .filter((i: any) => i.status === "overdue")
        .reduce((s: number, i: any) => s + (i.amount || 0), 0);

      setStats({
        totalRevenue,
        outstanding,
        overdue,
        paidInvoices: invList.filter((i: any) => i.status === "paid").length,
      });

      const monthly: Record<string, number> = {};
      invList.forEach((i: any) => {
        const date = i.paid_date
          ? new Date(i.paid_date)
          : new Date(i.created_at);
        const key = date.toLocaleString("default", { month: "short" });
        if (i.status === "paid")
          monthly[key] = (monthly[key] || 0) + (i.amount || 0);
      });
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      setMonthlyData(months.map((m) => ({ name: m, value: monthly[m] || 0 })));

      setInvoices(invList);
    } catch (error: any) {
      toast.error("Failed to load revenue report: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#6452db] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatCard
          icon={DollarSign}
          iconColor="#8dc572"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          label="Revenue Collected"
        />
        <ReportStatCard
          icon={FileText}
          iconColor="#5683da"
          value={`$${stats.outstanding.toLocaleString()}`}
          label="Outstanding"
        />
        <ReportStatCard
          icon={TrendingUp}
          iconColor="#be6464"
          value={`$${stats.overdue.toLocaleString()}`}
          label="Overdue"
        />
        <ReportStatCard
          icon={CheckCircle2}
          iconColor="#6452db"
          value={stats.paidInvoices.toString()}
          label="Paid Invoices"
        />
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
                monthlyData.map((d: any) => ({
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
            <BarChart data={monthlyData}>
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
                invoices.map((i: any) => ({
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
                {invoices.map((inv: any) => (
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
                        className={`text-xs ${
                          statusColors[inv.status] || statusColors.draft
                        }`}
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
    </div>
  );
}