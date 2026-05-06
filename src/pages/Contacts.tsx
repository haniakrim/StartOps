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
import { useRealtimeTable } from "@/hooks/useRealtime";

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
  Active: "bg-expo-green/15 text-expo-green",
  Prospect: "bg-expo-blue/15 text-expo-blue",
  Inactive: "bg-muted text-muted-foreground",
  Lead: "bg-expo-blue/15 text-expo-blue",
  Customer: "bg-expo-green/15 text-expo-green",
};

function calculateLeadScore(contact: Contact): number {
  let score = 0;
  if (contact.email) score += 20;
  if (contact.phone) score += 15;
  if (contact.company) score += 15;
  if (contact.title) score += 10;
  if (contact.status === "Customer") score += 30;
  if (contact.status === "Active") score += 20;
  return Math.min(score, 100);
}

export default function Contacts() {
  const { user } = useAuth();
  const { organizationId } = useOrganization();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: "", last_name: "", email: "", company: "", title: "", phone: "" });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<string[][]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => { fetchContacts(); }, [organizationId]);
  useRealtimeTable("contacts", fetchContacts);

  async function fetchContacts() {
    try {
      setLoading(true);
      let query = supabase.from("contacts").select("*").order("created_at", { ascending: false });
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      const { data, error } = await query;
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
    return lines.map(parseLine);
  }

  async function importContacts() {
    if (!importFile || !organizationId) return;
    try {
      const text = await importFile.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        toast.error("CSV file is empty or invalid");
        return;
      }
      const headers = rows[0].map(h => h.toLowerCase().trim());
      const contactsToInsert = rows.slice(1).map(row => {
        const obj: any = {};
        headers.forEach((h, i) => {
          if (row[i]) obj[h] = row[i];
        });
        return {
          first_name: obj.first_name || obj.firstname || obj.name?.split(' ')[0] || '',
          last_name: obj.last_name || obj.lastname || obj.name?.split(' ').slice(1).join(' ') || '',
          email: obj.email || null,
          phone: obj.phone || null,
          company: obj.company || null,
          title: obj.title || null,
          status: obj.status || 'Lead',
          organization_id: organizationId,
        };
      }).filter(c => c.first_name || c.last_name);

      const { error } = await supabase.from("contacts").insert(contactsToInsert);
      if (error) throw error;
      toast.success(`${contactsToInsert.length} contacts imported`);
      setImportDialogOpen(false);
      setImportFile(null);
      setImportPreview([]);
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to import contacts: " + error.message);
    }
  }

  async function deleteContact(id: string) {
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Contact deleted");
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to delete contact: " + error.message);
    }
  }

  async function bulkDelete() {
    try {
      const { error } = await supabase.from("contacts").delete().in("id", selected);
      if (error) throw error;
      toast.success(`${selected.length} contacts deleted`);
      setSelected([]);
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to delete contacts: " + error.message);
    }
  }

  async function bulkUpdateStatus(status: string) {
    try {
      const { error } = await supabase.from("contacts").update({ status }).in("id", selected);
      if (error) throw error;
      toast.success(`${selected.length} contacts updated`);
      setSelected([]);
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to update contacts: " + error.message);
    }
  }

  const filtered = contacts.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your leads and customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Import Contacts</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <Input type="file" accept=".csv" onChange={handleFileChange} />
                {importPreview.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Preview (first 5 rows):</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border">{importPreview[0].map((h, i) => <th key={i} className="text-left py-2 px-2 text-muted-foreground">{h}</th>)}</tr></thead>
                        <tbody>{importPreview.slice(1).map((row, i) => <tr key={i} className="border-b border-border/50">{row.map((cell, j) => <td key={j} className="py-2 px-2 text-foreground/70">{cell}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  </div>
                )}
                <Button onClick={importContacts} disabled={!importFile} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Import Contacts
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
              <form onSubmit={createContact} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input required value={newContact.first_name} onChange={(e) => setNewContact(p => ({ ...p, first_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input required value={newContact.last_name} onChange={(e) => setNewContact(p => ({ ...p, last_name: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newContact.email} onChange={(e) => setNewContact(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={newContact.phone} onChange={(e) => setNewContact(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={newContact.company} onChange={(e) => setNewContact(p => ({ ...p, company: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newContact.title} onChange={(e) => setNewContact(p => ({ ...p, title: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full">Create Contact</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {selected.length > 0 && (
        <BulkActionBar
          selectedCount={selected.length}
          onClear={() => setSelected([])}
          onDelete={bulkDelete}
          onStatusChange={bulkUpdateStatus}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(contact => (
            <Card key={contact.id} className="cursor-pointer" onClick={() => { setDetailContactId(contact.id); setDetailOpen(true); }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-primary text-sm font-medium">{contact.first_name[0]}{contact.last_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{contact.first_name} {contact.last_name}</h3>
                      {contact.title && <p className="text-xs text-muted-foreground">{contact.title}</p>}
                    </div>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${statusColors[contact.status || ''] || statusColors.Lead}`}>{contact.status || 'Lead'}</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground/50" />
                      {contact.email}
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground/50" />
                      {contact.phone}
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Building2 className="w-3.5 h-3.5 text-white/30" />
                      {contact.company}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-white/50">{contact.lead_score || 0}/100</span>
                  </div>
                  <span className="text-xs text-white/30">{new Date(contact.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-white/40">No contacts found. Add your first contact!</div>
          )}
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {detailContactId && <ContactDetail contactId={detailContactId} open={true} onClose={() => setDetailOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}