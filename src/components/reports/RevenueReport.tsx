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
import { useOrganization } from "@/hooks/useOrganization";
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
  const { organizationId } = useOrganization();
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
  }, [range.start, range.end, organizationId]);

  async function fetchRevenueReport() {
    try {
      setLoading(true);
      let query = supabase
        .from("invoices")
        .select(
          "id, invoice_number, amount, status, due_date, paid_date, created_at, contacts:contact_id (first_name, last_name)"
        )
        .gte("created_at", range.start)
        .lte("created_at", range.end);
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      const { data: invData } = await query;

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
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportStatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} trend="up" trendValue="" />
        <ReportStatCard icon={FileText} label="Outstanding" value={`$${stats.outstanding.toLocaleString()}`} trend="down" trendValue="" />
        <ReportStatCard icon={TrendingUp} label="Overdue" value={`$${stats.overdue.toLocaleString()}`} trend="down" trendValue="" />
        <ReportStatCard icon={CheckCircle2} label="Paid Invoices" value={stats.paidInvoices.toString()} trend="up" trendValue="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent Invoices</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {invoices.slice(0, 8).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-2 rounded bg-muted border border-border/50 text-sm">
                  <div>
                    <span className="text-foreground font-medium">{inv.invoice_number}</span>
                    {inv.contacts && <span className="text-muted-foreground ml-2">· {inv.contacts.first_name} {inv.contacts.last_name}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">${(inv.amount || 0).toLocaleString()}</span>
                    <Badge variant="secondary" className={`text-xs ${statusColors[inv.status] || "bg-muted text-muted-foreground"}`}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" size="sm" onClick={() => downloadCSV(invoices, "revenue")}>
        <Download className="w-4 h-4 mr-2" />Export CSV
      </Button>
    </div>
  );
}
