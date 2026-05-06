import { useState, useEffect } from "react";
import {
  Search, Filter, Plus, MoreHorizontal, Mail, Phone, Building2, MapPin, ArrowUpDown, Download, Upload, Star, Loader2, Zap,
} from "lucide-react";
import { BulkActionBar } from "@/components/BulkActionBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContactDetail } from "@/components/ContactDetail";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  status: string | null;
  tags: string[] | null;
  created_at: string;
  lead_score?: number;
}

const statusColors: Record<string, string> = {
  Active: "bg-[#8dc572]/20 text-[#8dc572]", Prospect: "bg-[#5683da]/20 text-[#5683da]",
  Inactive: "bg-white/10 text-white/50", Lead: "bg-[#6452db]/20 text-[#6452db]", Customer: "bg-[#8dc572]/20 text-[#8dc572]",
};

function calculateLeadScore(contact: Contact): number {
  let score = 0;
  if (contact.email) score += 20;
  if (contact.phone) score += 15;
  if (contact.company) score += 15;
  if (contact.title) score += 10;
  if (contact.status === "Customer") score += 30;
  if (contact.status === "Active") score += 20;
  if (contact.status === "Prospect") score += 10;
  if (contact.tags && contact.tags.length > 0) score += contact.tags.length * 5;
  return Math.min(score, 100);
}

function getLeadScoreColor(score: number): string {
  if (score >= 80) return "text-[#8dc572]";
  if (score >= 50) return "text-[#f0ad4e]";
  return "text-white/40";
}

export default function Contacts() {
  const { user } = useAuth();
  const { organizationId } = useOrganization();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [starredContacts, setStarredContacts] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: "", last_name: "", email: "", company: "", title: "", phone: "" });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetchContacts(); }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const withScores = (data || []).map(c => ({ ...c, lead_score: calculateLeadScore(c) }));
      setContacts(withScores);
    } catch (error: any) {
      toast.error("Failed to load contacts: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!organizationId) {
        toast.error("No organization found. Please sign out and sign in again.");
        return;
      }
      const { error } = await supabase.from("contacts").insert({
        first_name: newContact.first_name, last_name: newContact.last_name, email: newContact.email || null,
        company: newContact.company || null, title: newContact.title || null, phone: newContact.phone || null,
        status: "Lead", organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Contact created successfully");
      setDialogOpen(false);
      setNewContact({ first_name: "", last_name: "", email: "", company: "", title: "", phone: "" });
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to create contact: " + error.message);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setImportPreview(parsed.slice(0, 5));
    };
    reader.readAsText(file);
  }

  function parseCSV(text: string) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(v => v.replace(/^"|"$/g, ''));
    };
    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    return lines.slice(1).map(line => {
      const values = parseLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    }).filter(row => Object.values(row).some(v => v.trim() !== ''));
  }

  async function importContacts() {
    if (!importFile || importPreview.length === 0) return;
    try {
      setImporting(true);
      const text = await importFile.text();
      const parsed = parseCSV(text);
      if (!organizationId) {
        toast.error("No organization found. Please sign out and sign in again.");
        return;
      }
      const contactsToInsert = parsed.map(row => ({
        first_name: row.first_name || row.firstname || row['first name'] || '',
        last_name: row.last_name || row.lastname || row['last name'] || '',
        email: row.email || null,
        phone: row.phone || null,
        company: row.company || null,
        title: row.title || null,
        status: row.status || 'Lead',
        organization_id: organizationId,
      })).filter(c => c.first_name || c.last_name);
      if (contactsToInsert.length === 0) {
        toast.error("No valid contacts found in CSV");
        return;
      }
      const { error } = await supabase.from("contacts").insert(contactsToInsert);
      if (error) throw error;
      toast.success(`${contactsToInsert.length} contacts imported successfully`);
      setImportDialogOpen(false);
      setImportFile(null);
      setImportPreview([]);
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to import contacts: " + error.message);
    } finally {
      setImporting(false);
    }
  }

  const filtered = contacts.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.company?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const toggleStar = (id: string) => {
    setStarredContacts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const openDetail = (contactId: string) => { setDetailContactId(contactId); setDetailOpen(true); };

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Contacts</h1>
          <p className="text-sm text-white/50 mt-1">Manage your contacts and relationships</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5" onClick={() => {
            const selectedContacts = contacts.filter((c) => selected.includes(c.id));
            const data = selectedContacts.length > 0 ? selectedContacts : contacts;
            const exportData = data.map(c => ({
              "First Name": c.first_name,
              "Last Name": c.last_name,
              "Email": c.email,
              "Phone": c.phone,
              "Company": c.company,
              "Title": c.title,
              "Status": c.status,
              "Tags": (c.tags || []).join(", "),
              "Lead Score": c.lead_score,
              "Created": c.created_at,
            }));
            import("@/lib/export").then(({ exportToCSV }) => {
              exportToCSV(exportData, "contacts");
            });
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)} className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"><Upload className="w-4 h-4 mr-2" />Import</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90"><Plus className="w-4 h-4 mr-2" />Add Contact</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-white/10 text-white">
              <DialogHeader><DialogTitle>Add New Contact</DialogTitle></DialogHeader>
              <form onSubmit={createContact} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-white/70">First Name</Label><Input required value={newContact.first_name} onChange={(e) => setNewContact((prev) => ({ ...prev, first_name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                  <div className="space-y-2"><Label className="text-white/70">Last Name</Label><Input required value={newContact.last_name} onChange={(e) => setNewContact((prev) => ({ ...prev, last_name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                </div>
                <div className="space-y-2"><Label className="text-white/70">Email</Label><Input type="email" value={newContact.email} onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <div className="space-y-2"><Label className="text-white/70">Phone</Label><Input value={newContact.phone} onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <div className="space-y-2"><Label className="text-white/70">Company</Label><Input value={newContact.company} onChange={(e) => setNewContact((prev) => ({ ...prev, company: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <div className="space-y-2"><Label className="text-white/70">Title</Label><Input value={newContact.title} onChange={(e) => setNewContact((prev) => ({ ...prev, title: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Contact</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
              <DialogHeader><DialogTitle>Import Contacts from CSV</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white/70">CSV File</Label>
                  <Input type="file" accept=".csv" onChange={handleFileChange} className="bg-[#0b0d10] border-white/10 text-white" />
                  <p className="text-xs text-white/40">Expected columns: first_name, last_name, email, phone, company, title</p>
                </div>
                {importPreview.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white/70">Preview ({importPreview.length} rows)</Label>
                    <div className="max-h-40 overflow-y-auto rounded-md bg-[#0b0d10] border border-white/10 p-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            {Object.keys(importPreview[0]).map(key => (
                              <th key={key} className="text-left py-1 px-2 text-white/50">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, i) => (
                            <tr key={i} className="border-b border-white/5">
                              {Object.values(row).map((val: any, j) => (
                                <td key={j} className="py-1 px-2 text-white/70">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <Button onClick={importContacts} disabled={importing || importPreview.length === 0} className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                  {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Import {importPreview.length > 0 ? `${importPreview.length}+ Contacts` : 'Contacts'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <BulkActionBar
        selectedCount={selected.length}
        onClear={() => setSelected([])}
        onDelete={async () => {
          try {
            const { error } = await supabase.from("contacts").delete().in("id", selected);
            if (error) throw error;
            toast.success(`${selected.length} contacts deleted`);
            setSelected([]);
            fetchContacts();
          } catch (error: any) {
            toast.error("Failed to delete contacts: " + error.message);
          }
        }}
        onStatusChange={async (status) => {
          try {
            const { error } = await supabase.from("contacts").update({ status }).in("id", selected);
            if (error) throw error;
            toast.success(`Status updated for ${selected.length} contacts`);
            setSelected([]);
            fetchContacts();
          } catch (error: any) {
            toast.error("Failed to update status: " + error.message);
          }
        }}
        onExport={() => {
          const selectedContacts = contacts.filter((c) => selected.includes(c.id));
          const csv = [
            ["First Name", "Last Name", "Email", "Phone", "Company", "Title", "Status", "Lead Score"].join(","),
            ...selectedContacts.map((c) =>
              [c.first_name, c.last_name, c.email || "", c.phone || "", c.company || "", c.title || "", c.status || "", c.lead_score || 0].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
            ),
          ].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `contacts-export-${new Date().toISOString().split("T")[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success(`${selected.length} contacts exported`);
          setSelected([]);
        }}
        onTagAdd={async (tag) => {
          try {
            const updates = contacts
              .filter((c) => selected.includes(c.id))
              .map((c) => ({
                id: c.id,
                tags: [...(c.tags || []), tag],
              }));
            for (const update of updates) {
              await supabase.from("contacts").update({ tags: update.tags }).eq("id", update.id);
            }
            toast.success(`Tag added to ${selected.length} contacts`);
            setSelected([]);
            fetchContacts();
          } catch (error: any) {
            toast.error("Failed to add tags: " + error.message);
          }
        }}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
        </div>
        <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"><Filter className="w-4 h-4 mr-2" />Filters</Button>
        <Button variant="ghost" size="sm" className="text-white/50 hover:text-white"><ArrowUpDown className="w-4 h-4 mr-2" />Sort</Button>
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-10">
                    <input type="checkbox" className="rounded border-white/20 bg-transparent" onChange={(e) => setSelected(e.target.checked ? filtered.map((c) => c.id) : [])} checked={selected.length > 0 && selected.length === filtered.length} />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Tags</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Lead Score</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Last Contact</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-sm text-white/40">{search ? "No contacts match your search" : "No contacts yet. Add your first contact!"}</td></tr>
                ) : (
                  filtered.map((contact) => (
                    <tr key={contact.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openDetail(contact.id)}>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-white/20 bg-transparent" checked={selected.includes(contact.id)} onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, contact.id] : prev.filter((id) => id !== contact.id))} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); toggleStar(contact.id); }} className="text-white/20 hover:text-[#ff8964] transition-colors">
                            <Star className={`w-4 h-4 ${starredContacts.includes(contact.id) ? "fill-[#ff8964] text-[#ff8964]" : ""}`} />
                          </button>
                          <Avatar className="w-8 h-8 bg-[#6452db]"><AvatarFallback className="bg-[#6452db] text-white text-xs">{contact.first_name[0]}{contact.last_name[0]}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">{contact.first_name} {contact.last_name}</p>
                            <p className="text-xs text-white/40">{contact.title || "No title"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-white/30" /><span className="text-sm text-white/70">{contact.company || "-"}</span></div>
                      </td>
                      <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${statusColors[contact.status || "Lead"] || statusColors.Lead}`}>{contact.status || "Lead"}</Badge></td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(contact.tags || []).map((tag) => (<Badge key={tag} variant="outline" className="text-xs border-white/10 text-white/50">{tag}</Badge>))}
                          {(!contact.tags || contact.tags.length === 0) && <span className="text-xs text-white/20">-</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Zap className={`w-3.5 h-3.5 ${getLeadScoreColor(contact.lead_score || 0)}`} />
                          <span className={`text-sm font-medium ${getLeadScoreColor(contact.lead_score || 0)}`}>{contact.lead_score || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/50">{contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "-"}</td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1f2126] border-white/10 text-white">
                            <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5"><Mail className="w-4 h-4 mr-2" />Send Email</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5"><Phone className="w-4 h-4 mr-2" />Call</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5"><MapPin className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ContactDetail contactId={detailContactId} open={detailOpen} onClose={() => setDetailOpen(false)} onUpdate={fetchContacts} />
    </div>
  );
}