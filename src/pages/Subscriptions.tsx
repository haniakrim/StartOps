import { useState, useEffect } from "react";
import {
  CreditCard, Plus, Search, Loader2, Calendar, DollarSign, Users,
  TrendingUp, AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  MoreHorizontal, Filter, Download
} from "lucide-react";
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
  active: "bg-[#8dc572]/20 text-[#8dc572]",
  trialing: "bg-[#5683da]/20 text-[#5683da]",
  past_due: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  canceled: "bg-[#be6464]/20 text-[#be6464]",
  paused: "bg-white/10 text-white/50",
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
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Subscriptions</h1>
          <p className="text-sm text-white/50 mt-1">Recurring revenue and billing management</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />New Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader><DialogTitle>Create Subscription</DialogTitle></DialogHeader>
            <form onSubmit={createSubscription} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Customer Name</Label>
                <Input required value={newSub.customer_name} onChange={(e) => setNewSub(p => ({ ...p, customer_name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Customer Email</Label>
                <Input type="email" required value={newSub.customer_email} onChange={(e) => setNewSub(p => ({ ...p, customer_email: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Plan Name</Label>
                  <Input required value={newSub.plan_name} onChange={(e) => setNewSub(p => ({ ...p, plan_name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Pro Plan" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Price ($)</Label>
                  <Input type="number" required value={newSub.plan_price} onChange={(e) => setNewSub(p => ({ ...p, plan_price: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="99" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Billing Cycle</Label>
                  <Select value={newSub.billing_cycle} onValueChange={(v) => setNewSub(p => ({ ...p, billing_cycle: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Payment Method</Label>
                  <Select value={newSub.payment_method} onValueChange={(v) => setNewSub(p => ({ ...p, payment_method: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Subscription</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <DollarSign className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">${totalMRR.toLocaleString()}</p>
            <p className="text-sm text-white/50">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">${totalARR.toLocaleString()}</p>
            <p className="text-sm text-white/50">Annual Recurring Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Users className="w-5 h-5 text-[#5683da] mb-3" />
            <p className="text-2xl font-semibold text-white">{activeSubs.length}</p>
            <p className="text-sm text-white/50">Active Subscribers</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <AlertTriangle className="w-5 h-5 text-[#f0ad4e] mb-3" />
            <p className="text-2xl font-semibold text-white">{churnRate}%</p>
            <p className="text-sm text-white/50">Churn Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Plan Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {planBreakdown.map(plan => (
                <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{plan.name}</p>
                    <p className="text-xs text-white/40">{plan.count} active subscribers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">${plan.mrr.toLocaleString()}/mo</p>
                    <p className="text-xs text-white/40">${(plan.mrr * 12).toLocaleString()}/yr</p>
                  </div>
                </div>
              ))}
              {planBreakdown.length === 0 && (
                <p className="text-sm text-white/40 text-center py-8">No active subscriptions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Health Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white/50">Active Rate</span>
                  <span className="text-white">{subscriptions.length > 0 ? Math.round((activeSubs.length / subscriptions.length) * 100) : 0}%</span>
                </div>
                <Progress value={subscriptions.length > 0 ? (activeSubs.length / subscriptions.length) * 100 : 0} className="h-2 bg-white/10" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white/50">At Risk</span>
                  <span className="text-[#f0ad4e]">{subscriptions.filter(s => s.status === "past_due").length}</span>
                </div>
                <Progress value={subscriptions.length > 0 ? (subscriptions.filter(s => s.status === "past_due").length / subscriptions.length) * 100 : 0} className="h-2 bg-white/10" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white/50">Churned</span>
                  <span className="text-[#be6464]">{churned}</span>
                </div>
                <Progress value={subscriptions.length > 0 ? (churned / subscriptions.length) * 100 : 0} className="h-2 bg-white/10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search subscriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
        </div>
        <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
          <Filter className="w-4 h-4 mr-2" />Filter
        </Button>
        <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
          <Download className="w-4 h-4 mr-2" />Export
        </Button>
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Plan</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Price</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Next Billing</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">MRR</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-white/40">No subscriptions found</td></tr>
              )}
              {filtered.map(sub => (
                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4">
                    <p className="text-sm text-white font-medium">{sub.customer_name}</p>
                    <p className="text-xs text-white/40">{sub.customer_email}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-white">{sub.plan_name}</td>
                  <td className="py-3 px-4 text-sm text-white">${(sub.plan_price || 0).toLocaleString()}/{sub.billing_cycle === "monthly" ? "mo" : sub.billing_cycle === "quarterly" ? "qtr" : "yr"}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={`text-xs ${statusColors[sub.status] || statusColors.active}`}>{sub.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/50">{sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : "-"}</td>
                  <td className="py-3 px-4 text-sm text-white">${(sub.mrr || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {sub.status === "active" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-[#f0ad4e]" onClick={() => updateStatus(sub.id, "paused")}>
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {sub.status !== "canceled" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-[#be6464]" onClick={() => updateStatus(sub.id, "canceled")}>
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
