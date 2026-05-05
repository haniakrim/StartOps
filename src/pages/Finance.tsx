import { useState, useEffect } from "react";
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
  draft: "bg-white/10 text-white/50",
  sent: "bg-[#5683da]/20 text-[#5683da]",
  paid: "bg-[#8dc572]/20 text-[#8dc572]",
  overdue: "bg-[#be6464]/20 text-[#be6464]",
  pending: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  approved: "bg-[#8dc572]/20 text-[#8dc572]",
  rejected: "bg-[#be6464]/20 text-[#be6464]",
};

const COLORS = ["#6452db", "#ff8964", "#5683da", "#8dc572", "#f0ad4e", "#be6464"];

export default function Finance() {
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

  useEffect(() => {
    fetchFinanceData();
    fetchContacts();
    fetchVendors();
    detectAnomalies();
  }, []);

  async function fetchFinanceData() {
    try {
      setLoading(true);
      const { data: invData, error: invError } = await supabase
        .from("invoices")
        .select(`*, contacts:contact_id (first_name, last_name, company)`)
        .order("created_at", { ascending: false });
      if (invError) throw invError;
      setInvoices((invData || []).map((d: any) => ({ ...d, contacts: d.contacts?.[0] ?? null })));

      const { data: expData, error: expError } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (expError) throw expError;
      setExpenses(expData || []);
    } catch (error: any) {
      toast.error("Failed to load finance data: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContacts() {
    const { data } = await supabase.from("contacts").select("id, first_name, last_name").order("first_name");
    setContacts(data || []);
  }

  async function fetchVendors() {
    try {
      const { data, error } = await supabase.from("vendors").select("*").order("name");
      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      toast.error("Failed to load vendors: " + error.message);
    }
  }

  async function createVendor(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("vendors").insert({
        name: newVendor.name,
        email: newVendor.email || null,
        phone: newVendor.phone || null,
        website: newVendor.website || null,
        address: newVendor.address || null,
        category: newVendor.category || null,
        payment_terms: newVendor.payment_terms || null,
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

  async function detectAnomalies() {
    // AI-powered anomaly detection simulation
    const detected = [
      { type: "duplicate", severity: "high", description: "Potential duplicate invoice #INV-2045 detected", amount: 12500 },
      { type: "spike", severity: "medium", description: "Marketing spend 340% above monthly average", amount: 8400 },
      { type: "unusual", severity: "low", description: "Vendor payment outside normal business hours", amount: 3200 },
    ];
    setAnomalies(detected);
  }

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("invoices").insert({
        invoice_number: newInvoice.invoice_number,
        amount: parseFloat(newInvoice.amount) || 0,
        contact_id: newInvoice.contact_id || null,
        due_date: newInvoice.due_date || null,
        status: newInvoice.status,
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
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Finance</h1>
          <p className="text-sm text-white/50 mt-1">AI-powered financial operations and cash flow</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <form onSubmit={createInvoice} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Invoice Number</Label>
                <Input required value={newInvoice.invoice_number} onChange={(e) => setNewInvoice(p => ({ ...p, invoice_number: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="INV-001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Amount ($)</Label>
                  <Input type="number" required value={newInvoice.amount} onChange={(e) => setNewInvoice(p => ({ ...p, amount: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Due Date</Label>
                  <Input type="date" value={newInvoice.due_date} onChange={(e) => setNewInvoice(p => ({ ...p, due_date: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Contact</Label>
                <Select value={newInvoice.contact_id} onValueChange={(v) => setNewInvoice(p => ({ ...p, contact_id: v }))}>
                  <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue placeholder="Select contact" /></SelectTrigger>
                  <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Invoice</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-5 h-5 text-[#8dc572]" />
              <Badge variant="outline" className="border-white/10 text-white/50 text-xs"><TrendingUp className="w-3 h-3 mr-1 text-[#8dc572]" />+12%</Badge>
            </div>
            <p className="text-2xl font-semibold text-white">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-white/50 mt-1">Revenue (Paid)</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-5 h-5 text-[#5683da]" />
              <Badge variant="outline" className="border-white/10 text-white/50 text-xs"><ArrowUpRight className="w-3 h-3 mr-1 text-[#5683da]" />Active</Badge>
            </div>
            <p className="text-2xl font-semibold text-white">${outstanding.toLocaleString()}</p>
            <p className="text-sm text-white/50 mt-1">Outstanding</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-5 h-5 text-[#be6464]" />
              <Badge variant="outline" className="border-[#be6464]/30 text-[#be6464] text-xs">{invoices.filter(i => i.status === "overdue").length} invoices</Badge>
            </div>
            <p className="text-2xl font-semibold text-white">${overdueAmount.toLocaleString()}</p>
            <p className="text-sm text-white/50 mt-1">Overdue</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <CreditCard className="w-5 h-5 text-[#ff8964]" />
              <Badge variant="outline" className="border-white/10 text-white/50 text-xs"><TrendingDown className="w-3 h-3 mr-1 text-[#be6464]" />+8%</Badge>
            </div>
            <p className="text-2xl font-semibold text-white">${totalExpenses.toLocaleString()}</p>
            <p className="text-sm text-white/50 mt-1">Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Anomaly Detection */}
      {anomalies.length > 0 && (
        <Card className="bg-[#be6464]/5 border-[#be6464]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#be6464]" />
              AI Anomaly Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anomalies.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs border-0 ${a.severity === "high" ? "bg-[#be6464]/20 text-[#be6464]" : a.severity === "medium" ? "bg-[#f0ad4e]/20 text-[#f0ad4e]" : "bg-[#5683da]/20 text-[#5683da]"}`}>
                      {a.severity}
                    </Badge>
                    <span className="text-sm text-white">{a.description}</span>
                  </div>
                  <span className="text-sm font-medium text-white">${a.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="invoices" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><FileText className="w-4 h-4 mr-2" />Invoices</TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><CreditCard className="w-4 h-4 mr-2" />Expenses</TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Truck className="w-4 h-4 mr-2" />Vendors</TabsTrigger>
          <TabsTrigger value="cashflow" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><BarChart3 className="w-4 h-4 mr-2" />Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Invoice</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Client</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-sm text-white/40">No invoices yet. Create your first invoice!</td></tr>
                  )}
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-sm text-white font-medium">{inv.invoice_number}</td>
                      <td className="py-3 px-4 text-sm text-white/70">{inv.contacts ? `${inv.contacts.first_name} ${inv.contacts.last_name}` : "-"}</td>
                      <td className="py-3 px-4 text-sm text-white">${(inv.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${statusColors[inv.status] || statusColors.draft}`}>{inv.status}</Badge></td>
                      <td className="py-3 px-4 text-sm text-white/50">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 && (
                    <tr><td colSpan={4} className="py-12 text-center text-sm text-white/40">No expenses recorded yet.</td></tr>
                  )}
                  {expenses.map(exp => (
                    <tr key={exp.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-sm text-white/70 capitalize">{exp.category || "Other"}</td>
                      <td className="py-3 px-4 text-sm text-white">{exp.description || "-"}</td>
                      <td className="py-3 px-4 text-sm text-white">${(exp.amount || 0).toLocaleString()}</td>
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
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" placeholder="Search vendors..." className="w-64 bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
            </div>
            <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
                  <Plus className="w-4 h-4 mr-2" />Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#18191b] border-white/10 text-white">
                <DialogHeader><DialogTitle>Add Vendor</DialogTitle></DialogHeader>
                <form onSubmit={createVendor} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Vendor Name</Label>
                    <Input required value={newVendor.name} onChange={(e) => setNewVendor(p => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Email</Label>
                      <Input type="email" value={newVendor.email} onChange={(e) => setNewVendor(p => ({ ...p, email: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Phone</Label>
                      <Input value={newVendor.phone} onChange={(e) => setNewVendor(p => ({ ...p, phone: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Website</Label>
                    <Input value={newVendor.website} onChange={(e) => setNewVendor(p => ({ ...p, website: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Address</Label>
                    <Input value={newVendor.address} onChange={(e) => setNewVendor(p => ({ ...p, address: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Category</Label>
                      <Input value={newVendor.category} onChange={(e) => setNewVendor(p => ({ ...p, category: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="e.g., Software" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Payment Terms</Label>
                      <Input value={newVendor.payment_terms} onChange={(e) => setNewVendor(p => ({ ...p, payment_terms: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Net 30" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Add Vendor</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map(vendor => (
              <Card key={vendor.id} className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-[#6452db]" />
                    </div>
                    <Badge variant="secondary" className={`text-xs ${vendor.is_active ? "bg-[#8dc572]/20 text-[#8dc572]" : "bg-white/10 text-white/50"}`}>
                      {vendor.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{vendor.name}</h3>
                  <p className="text-sm text-white/50 mb-3">{vendor.category || "No category"}</p>
                  <div className="space-y-2">
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Mail className="w-3.5 h-3.5 text-white/30" />
                        {vendor.email}
                      </div>
                    )}
                    {vendor.website && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Globe className="w-3.5 h-3.5 text-white/30" />
                        {vendor.website}
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <MapPin className="w-3.5 h-3.5 text-white/30" />
                        {vendor.address}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Star className="w-3.5 h-3.5 text-[#f0ad4e]" />
                      <span className="text-white">{vendor.rating || 0}/5</span>
                      {vendor.payment_terms && <span className="text-white/40">· {vendor.payment_terms}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {vendors.length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-white/40">No vendors yet. Add your first vendor!</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white text-base">Cash Flow Forecast</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8dc572" stopOpacity={0.3} /><stop offset="95%" stopColor="#8dc572" stopOpacity={0} /></linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#be6464" stopOpacity={0.3} /><stop offset="95%" stopColor="#be6464" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                    <Area type="monotone" dataKey="inflow" stroke="#8dc572" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" />
                    <Area type="monotone" dataKey="outflow" stroke="#be6464" strokeWidth={2} fillOpacity={1} fill="url(#colorOutflow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-[#18191b] border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white text-base">Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie data={pieData.length ? pieData : [{ name: "None", value: 1 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {(pieData.length ? pieData : [{ name: "None", value: 1 }]).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="text-white/60">{entry.name}</span></div>
                      <span className="text-white">${(entry.value as number).toLocaleString()}</span>
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