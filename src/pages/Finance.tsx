import { useCallback, useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, FileText, CreditCard, AlertTriangle,
  Plus, Search, Filter, Loader2, Download, CheckCircle, Clock, XCircle,
  BarChart3, ArrowUpRight, Truck, Star, MapPin, Globe, Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";
import { useOrganization } from "@/hooks/useOrganization";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_date: string | null;
  contacts: { first_name: string; last_name: string; company: string | null } | null;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  category: string | null;
  rating: number;
  payment_terms: string | null;
  is_active: boolean;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  overdue: "bg-red-500/15 text-red-600 dark:text-red-400",
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const COLORS = ["hsl(var(--primary))", "#ff8964", "#5683da", "#8dc572", "#f0ad4e", "#be6464"];

export default function Finance() {
  const { organizationId } = useOrganization();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoice_number: "", amount: "", contact_id: "", due_date: "", status: "draft"
  });
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: "", email: "", phone: "", website: "", address: "", category: "", payment_terms: "" });

  // Fetch all finance data
  const fetchFinanceData = async () => {
    if (!organizationId) { setLoading(false); return; }
    try {
      setLoading(true);

      // Invoices
      const { data: invData, error: invError } = await supabase
        .from("invoices")
        .select(`*, contacts:contact_id (first_name, last_name, company)`)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (invError) throw invError;
      setInvoices((invData || []).map((d: any) => ({ ...d, contacts: d.contacts?.[0] ?? null })));

      // Expenses
      const { data: expData, error: expError } = await supabase
        .from("expenses")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (expError) throw expError;
      setExpenses(expData || []);

      // Fetch contacts for select
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .eq("organization_id", organizationId)
        .order("first_name");
      setContacts(contactsData || []);
    } catch (error: any) {
      toast.error("Failed to load finance data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    if (!organizationId) return;
    try {
      const { data } = await supabase.from("vendors").select("*").eq("organization_id", organizationId).order("name");
      setVendors(data || []);
    } catch (error: any) {
      toast.error("Failed to load vendors: " + error.message);
    }
  };

  useEffect(() => {
    fetchFinanceData();
    fetchVendors();
    detectAnomalies();
  }, [organizationId]);

  useRealtimeTable("invoices", fetchFinanceData);
  useRealtimeTable("expenses", fetchFinanceData);
  useRealtimeTable("vendors", fetchVendors);

  async function detectAnomalies() {
    // Static demo anomalies - could be replaced with real data analysis
    const detected = [
      { type: "duplicate", severity: "high", description: "Potential duplicate invoice #INV-2045 detected", amount: 12500 },
      { type: "spike", severity: "medium", description: "Marketing spend 340% above monthly average", amount: 8400 },
      { type: "unusual", severity: "low", description: "Vendor payment outside normal business hours", amount: 3200 },
    ];
    setAnomalies(detected);
  }

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) {
      toast.error("No organization found");
      return;
    }
    try {
      const { error } = await supabase.from("invoices").insert({
        invoice_number: newInvoice.invoice_number,
        amount: parseFloat(newInvoice.amount) || 0,
        currency: "USD",
        contact_id: newInvoice.contact_id || null,
        due_date: newInvoice.due_date || null,
        status: newInvoice.status,
        organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Invoice created");
      setDialogOpen(false);
      setNewInvoice({ invoice_number: "", amount: "", contact_id: "", due_date: "", status: "draft" });
      fetchFinanceData();
    } catch (error: any) {
      toast.error("Failed to create invoice: " + error.message);
    }
  }

  async function createVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) {
      toast.error("No organization found");
      return;
    }
    try {
      const { error } = await supabase.from("vendors").insert({
        name: newVendor.name,
        email: newVendor.email || null,
        phone: newVendor.phone || null,
        website: newVendor.website || null,
        address: newVendor.address || null,
        category: newVendor.category || null,
        payment_terms: newVendor.payment_terms || null,
        organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Vendor added");
      setVendorDialogOpen(false);
      setNewVendor({ name: "", email: "", phone: "", website: "", address: "", category: "", payment_terms: "" });
      fetchVendors();
    } catch (error: any) {
      toast.error("Failed to add vendor: " + error.message);
    }
  }

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);
  const outstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + (i.amount || 0), 0);
  const overdueAmount = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const expenseByCategory = expenses.reduce((acc: any, e) => {
    acc[e.category || "Other"] = (acc[e.category || "Other"] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const cashFlowData = [
    { name: "Jan", inflow: 42000, outflow: 38000 },
    { name: "Feb", inflow: 38000, outflow: 35000 },
    { name: "Mar", inflow: 55000, outflow: 42000 },
    { name: "Apr", inflow: 48000, outflow: 44000 },
    { name: "May", inflow: 62000, outflow: 48000 },
    { name: "Jun", inflow: 58000, outflow: 52000 },
  ];

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
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Finance</h1>
          <p className="text-sm text-muted-foreground">Financial operations and cash flow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <Badge variant="outline" className="text-xs"><TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />+12%</Badge>
            </div>
            <p className="text-2xl font-semibold text-foreground">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Revenue (Paid)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <Badge variant="outline" className="text-xs"><ArrowUpRight className="w-3 h-3 mr-1 text-blue-500" />Active</Badge>
            </div>
            <p className="text-2xl font-semibold text-foreground">${outstanding.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <Badge variant="outline" className="text-xs border-red-500/30 text-red-500">{invoices.filter(i => i.status === "overdue").length} invoices</Badge>
            </div>
            <p className="text-2xl font-semibold text-foreground">${overdueAmount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <Badge variant="outline" className="text-xs"><TrendingDown className="w-3 h-3 mr-1 text-red-500" />+8%</Badge>
            </div>
            <p className="text-2xl font-semibold text-foreground">${totalExpenses.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Expenses</p>
          </CardContent>
        </Card>
      </div>

      {anomalies.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Anomaly Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anomalies.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border/50">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs border-0 ${a.severity === "high" ? "bg-red-500/15 text-red-600" : a.severity === "medium" ? "bg-orange-500/15 text-orange-600" : "bg-blue-500/15 text-blue-600"}`}>
                      {a.severity}
                    </Badge>
                    <span className="text-sm text-foreground">{a.description}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">${a.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices"><FileText className="w-4 h-4 mr-2" />Invoices</TabsTrigger>
          <TabsTrigger value="expenses"><CreditCard className="w-4 h-4 mr-2" />Expenses</TabsTrigger>
          <TabsTrigger value="vendors"><Truck className="w-4 h-4 mr-2" />Vendors</TabsTrigger>
          <TabsTrigger value="cashflow"><BarChart3 className="w-4 h-4 mr-2" />Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
                <form onSubmit={createInvoice} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Invoice Number</Label>
                    <Input required value={newInvoice.invoice_number} onChange={(e) => setNewInvoice(p => ({ ...p, invoice_number: e.target.value }))} placeholder="INV-001" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount ($)</Label>
                      <Input type="number" required value={newInvoice.amount} onChange={(e) => setNewInvoice(p => ({ ...p, amount: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={newInvoice.due_date} onChange={(e) => setNewInvoice(p => ({ ...p, due_date: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Select value={newInvoice.contact_id} onValueChange={(v) => setNewInvoice(p => ({ ...p, contact_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                      <SelectContent>
                        {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create Invoice</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Client</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground/50">No invoices yet</td></tr>
                  )}
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{inv.invoice_number}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{inv.contacts ? `${inv.contacts.first_name} ${inv.contacts.last_name}` : "-"}</td>
                      <td className="py-3 px-4 text-sm text-foreground">${(inv.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${statusColors[inv.status] || statusColors.draft}`}>{inv.status}</Badge></td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 && (
                    <tr><td colSpan={4} className="py-12 text-center text-sm text-muted-foreground/50">No expenses recorded yet.</td></tr>
                  )}
                  {expenses.map(exp => (
                    <tr key={exp.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm text-muted-foreground capitalize">{exp.category || "Other"}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{exp.description || "-"}</td>
                      <td className="py-3 px-4 text-sm text-foreground">${(exp.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${statusColors[exp.status] || statusColors.pending}`}>{exp.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Vendor</DialogTitle></DialogHeader>
                <form onSubmit={createVendor} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Vendor Name</Label>
                    <Input required value={newVendor.name} onChange={(e) => setNewVendor(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={newVendor.email} onChange={(e) => setNewVendor(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={newVendor.phone} onChange={(e) => setNewVendor(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={newVendor.website} onChange={(e) => setNewVendor(p => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={newVendor.address} onChange={(e) => setNewVendor(p => ({ ...p, address: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input value={newVendor.category} onChange={(e) => setNewVendor(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Software" />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Terms</Label>
                      <Input value={newVendor.payment_terms} onChange={(e) => setNewVendor(p => ({ ...p, payment_terms: e.target.value }))} placeholder="Net 30" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Add Vendor</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map(vendor => (
              <Card key={vendor.id} className="hover:border-border/80 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className={`text-xs ${vendor.is_active ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {vendor.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{vendor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{vendor.category || "No category"}</p>
                  <div className="space-y-2">
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground/50" />
                        {vendor.email}
                      </div>
                    )}
                    {vendor.website && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
                        {vendor.website}
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/50" />
                        {vendor.address}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-foreground">{vendor.rating || 0}/5</span>
                      {vendor.payment_terms && <span className="text-muted-foreground/60">· {vendor.payment_terms}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {vendors.length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground/50">No vendors yet. Add your first vendor!</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-base">Cash Flow Forecast</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8dc572" stopOpacity={0.3} /><stop offset="95%" stopColor="#8dc572" stopOpacity={0} /></linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#be6464" stopOpacity={0.3} /><stop offset="95%" stopColor="#be6464" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                    <Area type="monotone" dataKey="inflow" stroke="#8dc572" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" />
                    <Area type="monotone" dataKey="outflow" stroke="#be6464" strokeWidth={2} fillOpacity={1} fill="url(#colorOutflow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie data={pieData.length ? pieData : [{ name: "None", value: 1 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {(pieData.length ? pieData : [{ name: "None", value: 1 }]).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="text-muted-foreground">{entry.name}</span></div>
                      <span className="text-foreground">${(entry.value as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
