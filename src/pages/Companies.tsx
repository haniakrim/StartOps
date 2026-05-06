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
  Customer: "bg-[#8dc572]/20 text-[#8dc572]",
  Prospect: "bg-[#5683da]/20 text-[#5683da]",
  "At Risk": "bg-[#be6464]/20 text-[#be6464]",
  Lead: "bg-[#6452db]/20 text-[#6452db]",
};

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: "", industry: "", size: "", location: "", website: "", revenue: "", health: "80", status: "Prospect", notes: "",
  });

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

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

  function editCompany(company: Company) {
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

  function resetForm() {
    setForm({ name: "", industry: "", size: "", location: "", website: "", revenue: "", health: "80", status: "Prospect", notes: "" });
  }

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.location?.toLowerCase() || "").includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Companies</h1>
          <p className="text-sm text-white/50 mt-1">Manage your accounts and organizations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) { setEditingCompany(null); resetForm(); }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
                <Plus className="w-4 h-4 mr-2" />Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle></DialogHeader>
              <form onSubmit={saveCompany} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Company Name</Label>
                  <Input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Industry</Label>
                    <Input value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="e.g., SaaS" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Company Size</Label>
                    <Input value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="e.g., 50-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Location</Label>
                    <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="e.g., San Francisco" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Website</Label>
                    <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="https://..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Annual Revenue</Label>
                    <Input value={form.revenue} onChange={(e) => setForm((p) => ({ ...p, revenue: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="e.g., $10M" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Health Score</Label>
                    <Input type="number" min="0" max="100" value={form.health} onChange={(e) => setForm((p) => ({ ...p, health: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
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
                  <Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Additional notes..." />
                </div>
                <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                  {editingCompany ? "Update Company" : "Create Company"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
        </div>
        <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"><Filter className="w-4 h-4 mr-2" />Filters</Button>
        <Button variant="ghost" size="sm" className="text-white/50 hover:text-white"><ArrowUpDown className="w-4 h-4 mr-2" />Sort</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <Card key={company.id} className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#6452db]" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${statusColors[company.status] || statusColors.Prospect}`}>{company.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1f2126] border-white/10 text-white">
                      <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5" onClick={() => editCompany(company)}>
                        <Pencil className="w-4 h-4 mr-2" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 text-[#be6464]" onClick={() => deleteCompany(company.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{company.name}</h3>
              <p className="text-sm text-white/50 mb-4">{company.industry || "No industry"}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Account Health</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{company.health}%</span>
                    <TrendingUp className="w-4 h-4 text-[#8dc572]" />
                  </div>
                </div>
                <Progress value={company.health} className="h-1.5 bg-white/10" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm text-white/50"><Users className="w-4 h-4" /><span>{company.size || "-"}</span></div>
                  <div className="flex items-center gap-2 text-sm text-white/50"><Globe className="w-4 h-4" /><span className="truncate">{company.website || "-"}</span></div>
                  <div className="flex items-center gap-2 text-sm text-white/50"><MapPin className="w-4 h-4" /><span>{company.location || "-"}</span></div>
                  <div className="flex items-center gap-2 text-sm text-white/50"><Building2 className="w-4 h-4" /><span>{company.revenue || "-"}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={Building2}
              title={search ? "No companies match your search" : "No companies yet"}
              description={search ? "Try adjusting your search terms" : "Add your first company to start tracking accounts"}
              actionLabel={!search ? "Add Company" : undefined}
              onAction={!search ? () => setDialogOpen(true) : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}