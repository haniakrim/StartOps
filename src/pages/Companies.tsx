import { useState, useEffect } from "react";
import {
  Search, Filter, Plus, MoreHorizontal, Building2, Globe, Users, MapPin, ArrowUpDown, Download, TrendingUp, Loader2, Pencil, Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  revenue: string | null;
  health: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  Customer: "bg-expo-green/15 text-expo-green",
  Prospect: "bg-expo-blue/15 text-expo-blue",
  "At Risk": "bg-expo-pink/15 text-expo-pink",
  Lead: "bg-expo-indigo/15 text-expo-indigo",
};

export default function Companies() {
  const { organizationId } = useOrganization();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: "", industry: "", size: "", location: "", website: "", revenue: "", health: "80", status: "Prospect", notes: "",
  });

  useEffect(() => { fetchCompanies(); }, [organizationId]);
  useRealtimeTable("companies", fetchCompanies, [organizationId], organizationId);

  async function fetchCompanies() {
    try {
      setLoading(true);
      let query = supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      const { data, error } = await query;

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast.error("Failed to load companies: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveCompany(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!organizationId) {
        toast.error("No organization found. Please sign out and sign in again.");
        return;
      }
      const payload = {
        name: form.name,
        industry: form.industry || null,
        size: form.size || null,
        location: form.location || null,
        website: form.website || null,
        revenue: form.revenue || null,
        health: parseInt(form.health) || 80,
        status: form.status,
        notes: form.notes || null,
        organization_id: organizationId,
      };

      if (editingCompany) {
        const { error } = await supabase.from("companies").update(payload).eq("id", editingCompany.id);
        if (error) throw error;
        toast.success("Company updated");
      } else {
        const { error } = await supabase.from("companies").insert(payload);
        if (error) throw error;
        toast.success("Company created");
      }

      setDialogOpen(false);
      setEditingCompany(null);
      resetForm();
      fetchCompanies();
    } catch (error: any) {
      toast.error("Failed to save company: " + error.message);
    }
  }

  async function deleteCompany(id: string) {
    try {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
      toast.success("Company deleted");
      fetchCompanies();
    } catch (error: any) {
      toast.error("Failed to delete company: " + error.message);
    }
  }

  async function bulkDelete() {
    if (!organizationId) {
      toast.error("No organization found");
      return;
    }
    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("organization_id", organizationId)
        .in("id", selected);
      if (error) throw error;
      toast.success(`${selected.length} companies deleted`);
      setSelected([]);
      fetchCompanies();
    } catch (error: any) {
      toast.error("Failed to delete companies: " + error.message);
    }
  }

  async function bulkUpdateStatus(status: string) {
    if (!organizationId) {
      toast.error("No organization found");
      return;
    }
    try {
      const { error } = await supabase
        .from("companies")
        .update({ status })
        .eq("organization_id", organizationId)
        .in("id", selected);
      if (error) throw error;
      toast.success(`${selected.length} companies updated`);
      setSelected([]);
      fetchCompanies();
    } catch (error: any) {
      toast.error("Failed to update companies: " + error.message);
    }
  }

  function resetForm() {
    setForm({ name: "", industry: "", size: "", location: "", website: "", revenue: "", health: "80", status: "Prospect", notes: "" });
  }

  function openEdit(company: Company) {
    setEditingCompany(company);
    setForm({
      name: company.name,
      industry: company.industry || "",
      size: company.size || "",
      location: company.location || "",
      website: company.website || "",
      revenue: company.revenue || "",
      health: company.health?.toString() || "80",
      status: company.status || "Prospect",
      notes: company.notes || "",
    });
    setDialogOpen(true);
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(search.toLowerCase())) ||
    (c.location && c.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Companies</h1>
          <p className="text-sm text-white/50 mt-1">Manage your accounts and prospects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader><DialogTitle>{editingCompany ? "Edit Company" : "Add Company"}</DialogTitle></DialogHeader>
            <form onSubmit={saveCompany} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Company Name</Label>
                <Input required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="bg-muted border-border text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Industry</Label>
                  <Input value={form.industry} onChange={(e) => setForm(p => ({ ...p, industry: e.target.value }))} className="bg-muted border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Size</Label>
                  <Select value={form.size} onValueChange={(v) => setForm(p => ({ ...p, size: v }))}>
                    <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent className="bg-popover border-border text-foreground">
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501-1000">501-1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Location</Label>
                  <Input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className="bg-muted border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Website</Label>
                  <Input value={form.website} onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Annual Revenue</Label>
                  <Input value={form.revenue} onChange={(e) => setForm(p => ({ ...p, revenue: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="$1M" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Health Score</Label>
                  <Input type="number" min="0" max="100" value={form.health} onChange={(e) => setForm(p => ({ ...p, health: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">{editingCompany ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-[#6452db]/10 border border-[#6452db]/20 rounded-lg">
          <span className="text-sm text-white">{selected.length} selected</span>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])} className="text-white/70 hover:text-white">Clear</Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => bulkUpdateStatus("Lead")} className="text-white/70 hover:text-white">Mark as Lead</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkUpdateStatus("Customer")} className="text-white/70 hover:text-white">Mark as Customer</Button>
          <Button variant="ghost" size="sm" onClick={bulkDelete} className="text-[#be6464] hover:text-[#be6464]">Delete</Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(company => (
            <Card key={company.id} className="bg-card border-border hover:border-border/80 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#6452db]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{company.name}</h3>
                      {company.industry && <p className="text-xs text-white/50">{company.industry}</p>}
                    </div>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${statusColors[company.status] || statusColors.Prospect}`}>{company.status}</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  {company.location && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <MapPin className="w-3.5 h-3.5 text-white/30" />
                      {company.location}
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Globe className="w-3.5 h-3.5 text-white/30" />
                      {company.website}
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Users className="w-3.5 h-3.5 text-white/30" />
                      {company.size} employees
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">Health</span>
                    <span className="text-xs text-white/50">{company.health || 0}%</span>
                  </div>
                  <Progress value={company.health || 0} className="h-1.5 bg-white/10" />
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(company)} className="text-white/70 hover:text-white">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCompany(company.id)} className="text-[#be6464] hover:text-[#be6464]">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-white/40">No companies found. Add your first company!</div>
          )}
        </div>
      )}
    </div>
  );
}