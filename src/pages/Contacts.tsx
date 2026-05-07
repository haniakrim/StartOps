import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { Upload, Plus, Trash2 } from "lucide-react";
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
  const { user, organizationId } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
  });

  const fetchContacts = useCallback(async () => {
    if (!organizationId) return;
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
        toast({
          title: "Invalid CSV",
          description: "CSV file must have a header row and at least one data row.",
          variant: "destructive",
        });
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
      const rows = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, i) => {
            row[header] = values[i] || "";
          });
          return row;
        })
        .filter((row) => Object.values(row).some((v) => v));

      // Validate all rows before inserting
      const { validContacts, skippedRows } = validateCsvData(rows);

      if (skippedRows.length > 0) {
        toast({
          title: "Import warnings",
          description: `${skippedRows.length} row(s) skipped due to validation errors. Check data format.`,
          variant: "destructive",
        });
      }

      if (validContacts.length === 0) {
        toast({
          title: "No valid contacts",
          description: "No valid contacts found in the CSV file.",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      const contactsToInsert = validContacts.map((contact) => ({
        ...contact,
        organization_id: organizationId,
      }));

      const { error } = await supabase.from("contacts").insert(contactsToInsert);

      if (error) {
        toast({
          title: "Import failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import successful",
          description: `${validContacts.length} contact(s) imported.${skippedRows.length > 0 ? ` ${skippedRows.length} row(s) skipped.` : ""}`,
        });
        fetchContacts();
      }
    } catch {
      toast({
        title: "Import failed",
        description: "Failed to parse CSV file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleAddContact = async () => {
    const { error } = await supabase.from("contacts").insert({
      ...newContact,
      organization_id: organizationId,
    });

    if (error) {
      toast({
        title: "Error adding contact",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Contact added" });
      setShowAddDialog(false);
      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: "",
        title: "",
      });
      fetchContacts();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error deleting contact",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchContacts();
    }
  };

  if (loading) {
    return <div className="p-8">Loading contacts...</div>;
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
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      value={newContact.first_name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, first_name: e.target.value })
                      }
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      value={newContact.last_name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, last_name: e.target.value })
                      }
                      maxLength={100}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                    maxLength={254}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                    maxLength={50}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      value={newContact.company}
                      onChange={(e) =>
                        setNewContact({ ...newContact, company: e.target.value })
                      }
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newContact.title}
                      onChange={(e) =>
                        setNewContact({ ...newContact, title: e.target.value })
                      }
                      maxLength={200}
                    />
                  </div>
                </div>
                <Button onClick={handleAddContact} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contacts ({contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No contacts yet. Add your first contact or import from CSV.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      {contact.first_name} {contact.last_name}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>{contact.title}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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