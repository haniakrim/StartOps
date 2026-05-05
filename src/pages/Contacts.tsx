import { useState, useEffect } from "react";
import {
  Search, Filter, Plus, MoreHorizontal, Mail, Phone, Building2, MapPin, ArrowUpDown, Download, Star, Loader2,
} from "lucide-react";
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
}

const statusColors: Record<string, string> = {
  Active: "bg-[#8dc572]/20 text-[#8dc572]", Prospect: "bg-[#5683da]/20 text-[#5683da]",
  Inactive: "bg-white/10 text-white/50", Lead: "bg-[#6452db]/20 text-[#6452db]", Customer: "bg-[#8dc572]/20 text-[#8dc572]",
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [starredContacts, setStarredContacts] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: "", last_name: "", email: "", company: "", title: "", phone: "" });

  useEffect(() => { fetchContacts(); }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast.error("Failed to load contacts: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("contacts").insert({
        first_name: newContact.first_name, last_name: newContact.last_name, email: newContact.email || null,
        company: newContact.company || null, title: newContact.title || null, phone: newContact.phone || null,
        status: "Lead", organization_id: (await supabase.auth.getUser()).data.user?.id,
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
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"><Download className="w-4 h-4 mr-2" />Export</Button>
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
        </div>
      </div>

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
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">Last Contact</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-white/40">{search ? "No contacts match your search" : "No contacts yet. Add your first contact!"}</td></tr>
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