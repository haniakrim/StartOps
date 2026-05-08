import { useState, useEffect } from "react";
import {
  CreditCard, Plus, Search, Loader2, Calendar, DollarSign, Users,
  TrendingUp, AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  MoreHorizontal, Filter, Download
} from "lucide-react";
import { exportToCSV } from "@/lib/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Subscription {
  id: string;
  customer_name: string;
  customer_email: string;
  plan_name: string;
  plan_price: number;
  billing_cycle: string;
  status: string;
  start_date: string;
  next_billing_date: string;
  mrr: number;
  arr: number;
  payment_method: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600",
  trialing: "bg-blue-500/15 text-blue-600",
  past_due: "bg-yellow-500/15 text-yellow-600",
  canceled: "bg-red-500/15 text-red-600",
  paused: "bg-muted text-muted-foreground",
};

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSub, setNewSub] = useState({
    customer_name: "",
    customer_email: "",
    plan_name: "",
    plan_price: "",
    billing_cycle: "monthly",
    payment_method: "credit_card",
  });

  useEffect(() => { fetchSubscriptions(); }, []);
  useRealtimeTable("subscriptions", fetchSubscriptions);

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast.error("Failed to load subscriptions: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createSubscription(e: React.FormEvent) {
    e.preventDefault();
    try {
      const price = parseFloat(newSub.plan_price) || 0;
      const mrr = newSub.billing_cycle === "monthly" ? price : price / 12;
      const arr = mrr * 12;
      const { error } = await supabase.from("subscriptions").insert({
        customer_name: newSub.customer_name,
        customer_email: newSub.customer_email,
        plan_name: newSub.plan_name,
        plan_price: price,
        billing_cycle: newSub.billing_cycle,
        payment_method: newSub.payment_method,
        status: "active",
        mrr,
        arr,
        start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
      if (error) throw error;
      toast.success("Subscription created");
      setDialogOpen(false);
      setNewSub({ customer_name: "", customer_email: "", plan_name: "", plan_price: "", billing_cycle: "monthly", payment_method: "credit_card" });
      fetchSubscriptions();
    } catch (error: any) {
      toast.error("Failed to create subscription: " + error.message);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success(`Subscription ${status}`);
      fetchSubscriptions();
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  }

  const filtered = subscriptions.filter(s =>
    s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    s.plan_name.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  const activeSubs = subscriptions.filter(s => s.status === "active");
  const totalMRR = activeSubs.reduce((s, sub) => s + (sub.mrr || 0), 0);
  const totalARR = activeSubs.reduce((s, sub) => s + (sub.arr || 0), 0);
  const churned = subscriptions.filter(s => s.status === "canceled").length;
  const churnRate = subscriptions.length > 0 ? ((churned / subscriptions.length) * 100).toFixed(1) : "0";

  const plans = [...new Set(subscriptions.map(s => s.plan_name))];
  const planBreakdown = plans.map(plan => ({
    name: plan,
    count: subscriptions.filter(s => s.plan_name === plan && s.status === "active").length,
    mrr: subscriptions.filter(s => s.plan_name === plan && s.status === "active").reduce((s, sub) => s + (sub.mrr || 0), 0),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">Recurring revenue and billing management</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />New Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Subscription</DialogTitle></DialogHeader>
            <form onSubmit={createSubscription} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input required value={newSub.customer_name} onChange={(e) => setNewSub(p => ({ ...p, customer_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Customer Email</Label>
                <Input type="email" required value={newSub.customer_email} onChange={(e) => setNewSub(p => ({ ...p, customer_email: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input required value={newSub.plan_name} onChange={(e) => setNewSub(p => ({ ...p, plan_name: e.target.value }))} placeholder="Pro Plan" />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" required value={newSub.plan_price} onChange={(e) => setNewSub(p => ({ ...p, plan_price: e.target.value }))} placeholder="99" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <Select value={newSub.billing_cycle} onValueChange={(v) => setNewSub(p => ({ ...p, billing_cycle: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={newSub.payment_method} onValueChange={(v) => setNewSub(p => ({ ...p, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Subscription</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <DollarSign className="w-5 h-5 text-emerald-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">${totalMRR.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-primary mb-3" />
            <p className="text-2xl font-semibold text-foreground">${totalARR.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Annual Recurring Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Users className="w-5 h-5 text-blue-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{activeSubs.length}</p>
            <p className="text-sm text-muted-foreground">Active Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <AlertTriangle className="w-5 h-5 text-orange-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{churnRate}%</p>
            <p className="text-sm text-muted-foreground">Churn Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Plan Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {planBreakdown.map(plan => (
                <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.count} active subscribers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">${plan.mrr.toLocaleString()}/mo</p>
                    <p className="text-xs text-muted-foreground">${(plan.mrr * 12).toLocaleString()}/yr</p>
                  </div>
                </div>
              ))}
              {planBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No active subscriptions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Health Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Active Rate</span>
                  <span className="text-foreground">{subscriptions.length > 0 ? Math.round((activeSubs.length / subscriptions.length) * 100) : 0}%</span>
                </div>
                <Progress value={subscriptions.length > 0 ? (activeSubs.length / subscriptions.length) * 100 : 0} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">At Risk</span>
                  <span className="text-orange-500">{subscriptions.filter(s => s.status === "past_due").length}</span>
                </div>
                <Progress value={subscriptions.length > 0 ? (subscriptions.filter(s => s.status === "past_due").length / subscriptions.length) * 100 : 0} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Churned</span>
                  <span className="text-red-500">{churned}</span>
                </div>
                <Progress value={subscriptions.length > 0 ? (churned / subscriptions.length) * 100 : 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search subscriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />Filter
        </Button>
        <Button variant="outline" size="sm" onClick={() => {
          const exportData = subscriptions.map(s => ({
            "Customer": s.customer_name,
            "Email": s.customer_email,
            "Plan": s.plan_name,
            "Price": s.plan_price,
            "Billing Cycle": s.billing_cycle,
            "Status": s.status,
            "MRR": s.mrr,
            "ARR": s.arr,
            "Payment Method": s.payment_method,
            "Next Billing": s.next_billing_date,
          }));
          exportToCSV(exportData, "subscriptions");
        }}>
          <Download className="w-4 h-4 mr-2" />Export
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Plan</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Price</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Next Billing</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">MRR</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground/50">No subscriptions found</td></tr>
              )}
              {filtered.map(sub => (
                <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-foreground">{sub.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{sub.customer_email}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{sub.plan_name}</td>
                  <td className="py-3 px-4 text-sm text-foreground">${(sub.plan_price || 0).toLocaleString()}/{sub.billing_cycle === "monthly" ? "mo" : sub.billing_cycle === "quarterly" ? "qtr" : "yr"}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={`text-xs ${statusColors[sub.status] || statusColors.active}`}>{sub.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : "-"}</td>
                  <td className="py-3 px-4 text-sm text-foreground">${(sub.mrr || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {sub.status === "active" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-orange-500" onClick={() => updateStatus(sub.id, "paused")}>
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {sub.status !== "canceled" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => updateStatus(sub.id, "canceled")}>
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
