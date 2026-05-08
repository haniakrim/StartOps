import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Trash2, Pencil, Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { validateCsvData } from "@/lib/csv-validation";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  organization_id: string;
}

const Contacts = () => {
  const { organizationId } = useOrganization();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
  });
  const [selected, setSelected] = useState<string[]>([]);

  const fetchContacts = useCallback(async () => {
    if (!organizationId) {
      setContacts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("organization_id", organizationId)
      .order("last_name");
    if (data) setContacts(data);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        toast({ title: "Invalid CSV", description: "Must have header + data row.", variant: "destructive" });
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
      const rows = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, i) => { row[header] = values[i] || ""; });
          return row;
        })
        .filter((row) => Object.values(row).some((v) => v));

      const { validContacts, skippedRows } = validateCsvData(rows);

      if (skippedRows.length > 0) {
        toast({ title: "Import warnings", description: `${skippedRows.length} row(s) skipped.`, variant: "destructive" });
      }
      if (validContacts.length === 0) {
        toast({ title: "No valid contacts", variant: "destructive" });
        return;
      }

      const contactsToInsert = validContacts.map((contact) => ({
        ...contact,
        organization_id: organizationId,
      }));

      const { error } = await supabase.from("contacts").insert(contactsToInsert);
      if (error) throw error;
      toast({ title: "Import successful", description: `${validContacts.length} contact(s) imported.` });
      fetchContacts();
    } catch {
      toast({ title: "Import failed", description: "Failed to parse CSV file.", variant: "destructive" });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!organizationId) {
      toast({ title: "Error", description: "No organization found.", variant: "destructive" });
      return;
    }

    const payload = {
      ...newContact,
      organization_id: organizationId,
    };

    if (editingContact) {
      const { error } = await supabase.from("contacts").update(payload).eq("id", editingContact.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Contact updated" });
        setShowDialog(false);
        setEditingContact(null);
        setNewContact({ first_name: "", last_name: "", email: "", phone: "", company: "", title: "" });
        fetchContacts();
      }
    } else {
      const { error } = await supabase.from("contacts").insert(payload);
      if (error) {
        toast({ title: "Error adding contact", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Contact added" });
        setShowDialog(false);
        setNewContact({ first_name: "", last_name: "", email: "", phone: "", company: "", title: "" });
        fetchContacts();
      }
    }
  };

  const openEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      title: contact.title || "",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting contact", description: error.message, variant: "destructive" });
    } else {
      fetchContacts();
    }
  };

  const filtered = contacts.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.company?.toLowerCase() || "").includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your organization's contacts</p>
        </div>
        <div className="flex gap-2">
          <label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
              disabled={importing}
            />
            <Button variant="outline" asChild disabled={importing}>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Importing..." : "Import CSV"}
              </span>
            </Button>
          </label>
          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              setEditingContact(null);
              setNewContact({ first_name: "", last_name: "", email: "", phone: "", company: "", title: "" });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input value={newContact.first_name} onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input value={newContact.last_name} onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })} maxLength={100} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} maxLength={254} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} maxLength={50} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input value={newContact.title} onChange={(e) => setNewContact({ ...newContact, title: e.target.value })} maxLength={200} />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingContact ? "Update Contact" : "Add Contact"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
          <span className="text-sm text-foreground">{selected.length} selected</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => setSelected([])} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4 mr-1" />Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={async () => {
            const { error } = await supabase.from("contacts").delete().in("id", selected);
            if (error) toast({ title: "Error deleting", description: error.message, variant: "destructive" });
            else {
              toast({ title: `${selected.length} contacts deleted` });
              setSelected([]);
              fetchContacts();
            }
          }} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-1" />Delete Selected
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Contacts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No contacts yet. Add your first contact or import from CSV.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No contacts match your search.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={filtered.length > 0 && selected.length === filtered.length}
                      onCheckedChange={(checked) => {
                        if (checked) setSelected(filtered.map(c => c.id));
                        else setSelected([]);
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelected(prev => [...prev, contact.id]);
                          else setSelected(prev => prev.filter(id => id !== contact.id));
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {contact.first_name} {contact.last_name}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>{contact.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(contact)}>
                          <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Contacts;
