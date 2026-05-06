import { useState, useEffect } from "react";
import {
  Search, Filter, Plus, MoreHorizontal, Building2, Globe, Users, MapPin, ArrowUpDown, Download, TrendingUp, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Company {
  name: string;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  revenue: string | null;
  health: number;
  status: string;
  contactCount: number;
  dealValue: number;
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
  const [newCompany, setNewCompany] = useState({
    name: "", industry: "", size: "", location: "", website: "", revenue: "", health: "80", status: "Prospect",
  });

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    try {
      setLoading(true);
      
      // Derive companies from contacts and deals since companies table doesn't exist
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("company, title, status");
      if (contactsError) throw contactsError;

      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("value, contact_id, contacts:contact_id (company)");
      if (dealsError) throw dealsError;

      // Aggregate by company name
      const companyMap: Record<string, Company> = {};
      
      (contactsData || []).forEach((c: any) => {
        const name = c.company;
        if (!name) return;
        if (!companyMap[name]) {
          companyMap[name] = {
            name,
            industry: null,
            size: null,
            location: null,
            website: null,
            revenue: null,
            health: 80,
            status: c.status === "Customer" ? "Customer" : "Prospect",
            contactCount: 0,
            dealValue: 0,
          };
        }
        companyMap[name].contactCount++;
      });

      (dealsData || []).forEach((d: any) => {
        const companyName = d.contacts?.[0]?.company;
        if (!companyName || !companyMap[companyName]) return;
        companyMap[companyName].dealValue += (d.value || 0);
        if (companyMap[companyName].status !== "Customer") {
          companyMap[companyName].status = "Prospect";
        }
      });

      setCompanies(Object.values(companyMap));
    } catch (error: any) {
      toast.error("Failed to load companies: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry?.toLowerCase() || "").includes(search.toLowerCase())
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
                <Plus className="w-4 h-4 mr-2" />Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-white/10 text-white">
              <DialogHeader><DialogTitle>Add New Company</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); toast.info("Company table not yet created. Add company name to a contact instead."); setDialogOpen(false); }} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Company Name</Label>
                  <Input required value={newCompany.name} onChange={(e) => setNewCompany((p) => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Industry</Label>
                    <Input value={newCompany.industry} onChange={(e) => setNewCompany((p) => ({ ...p, industry: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Company Size</Label>
                    <Input value={newCompany.size} onChange={(e) => setNewCompany((p) => ({ ...p, size: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Location</Label>
                    <Input value={newCompany.location} onChange={(e) => setNewCompany((p) => ({ ...p, location: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Website</Label>
                    <Input value={newCompany.website} onChange={(e) => setNewCompany((p) => ({ ...p, website: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Company</Button>
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
          <Card key={company.name} className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors">
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
                      <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5">View Details</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5">Edit Company</DropdownMenuItem>
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
                  <div className="flex items-center gap-2 text-sm text-white/50"><Users className="w-4 h-4" /><span>{company.contactCount} contacts</span></div>
                  <div className="flex items-center gap-2 text-sm text-white/50"><Globe className="w-4 h-4" /><span>{company.website || "-"}</span></div>
                  <div className="flex items-center gap-2 text-sm text-white/50"><MapPin className="w-4 h-4" /><span>{company.location || "-"}</span></div>
                  <div className="flex items-center gap-2 text-sm text-white/50"><Building2 className="w-4 h-4" /><span>{company.revenue || "-"}</span></div>
                </div>
                {company.dealValue > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-white/40">Pipeline Value</p>
                    <p className="text-sm font-medium text-white">${company.dealValue.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-white/40">
            {search ? "No companies match your search" : "No companies yet. Add a company field to your contacts!"}
          </div>
        )}
      </div>
    </div>
  );
}