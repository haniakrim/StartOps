import { useState, useEffect } from "react";
import { X, Mail, Phone, Building2, Tag, Loader2, Pencil, Trash2, DollarSign, GitBranch } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContactDetailProps {
  contactId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ContactDetail({ contactId, open, onClose, onUpdate }: ContactDetailProps) {
  const [contact, setContact] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (contactId && open) fetchContact();
  }, [contactId, open]);

  async function fetchContact() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("contacts").select("*").eq("id", contactId).single();
      if (error) throw error;
      setContact(data);

      const { data: dealsData } = await supabase.from("deals").select("*").eq("contact_id", contactId).order("created_at", { ascending: false });
      setDeals(dealsData || []);
    } catch (error: any) {
      toast.error("Failed to load contact: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    try {
      const { error } = await supabase.from("contacts").update({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        title: contact.title,
        status: contact.status,
      }).eq("id", contactId);
      if (error) throw error;
      toast.success("Contact updated");
      setEditing(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error("Failed to update contact: " + error.message);
    }
  }

  async function deleteContact() {
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", contactId);
      if (error) throw error;
      toast.success("Contact deleted");
      onClose();
      onUpdate?.();
    } catch (error: any) {
      toast.error("Failed to delete contact: " + error.message);
    }
  }

  const statusColors: Record<string, string> = {
    Active: "bg-[#8dc572]/20 text-[#8dc572]", Prospect: "bg-[#5683da]/20 text-[#5683da]",
    Inactive: "bg-white/10 text-white/50", Lead: "bg-[#6452db]/20 text-[#6452db]",
    Customer: "bg-[#8dc572]/20 text-[#8dc572]",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">{loading ? "Loading..." : `${contact?.first_name || ""} ${contact?.last_name || ""}`}</DialogTitle>
            {!loading && contact && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => setEditing(!editing)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-[#be6464]" onClick={deleteContact}><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-[#6452db] animate-spin" /></div>
        ) : contact ? (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#6452db] flex items-center justify-center text-white font-semibold text-lg">
                {contact.first_name?.[0]}{contact.last_name?.[0]}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{contact.first_name} {contact.last_name}</h3>
                <p className="text-sm text-white/50">{contact.title || "No title"}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-white/70">First Name</Label><Input value={contact.first_name} onChange={(e) => setContact({ ...contact, first_name: e.target.value })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                  <div className="space-y-2"><Label className="text-white/70">Last Name</Label><Input value={contact.last_name} onChange={(e) => setContact({ ...contact, last_name: e.target.value })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                </div>
                <div className="space-y-2"><Label className="text-white/70">Email</Label><Input value={contact.email || ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <div className="space-y-2"><Label className="text-white/70">Phone</Label><Input value={contact.phone || ""} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <div className="space-y-2"><Label className="text-white/70">Company</Label><Input value={contact.company || ""} onChange={(e) => setContact({ ...contact, company: e.target.value })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <div className="space-y-2"><Label className="text-white/70">Title</Label><Input value={contact.title || ""} onChange={(e) => setContact({ ...contact, title: e.target.value })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <div className="flex gap-2">
                  <Button onClick={saveChanges} className="bg-[#6452db] text-white hover:bg-[#6452db]/90">Save Changes</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)} className="text-white/70 hover:text-white">Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={`text-xs ${statusColors[contact.status || "Lead"] || statusColors.Lead}`}>{contact.status || "Lead"}</Badge>
                  {(contact.tags || []).map((tag: string) => (<Badge key={tag} variant="outline" className="text-xs border-white/10 text-white/50">{tag}</Badge>))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-white/70"><Mail className="w-4 h-4 text-white/30" /><span>{contact.email || "No email"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-white/70"><Phone className="w-4 h-4 text-white/30" /><span>{contact.phone || "No phone"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-white/70"><Building2 className="w-4 h-4 text-white/30" /><span>{contact.company || "No company"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-white/70"><Tag className="w-4 h-4 text-white/30" /><span>{contact.title || "No title"}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Associated Deals ({deals.length})</h4>
                  {deals.length === 0 && <p className="text-sm text-white/40">No deals associated with this contact.</p>}
                  {deals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                      <div className="flex items-center gap-3">
                        <GitBranch className="w-4 h-4 text-white/30" />
                        <div>
                          <p className="text-sm text-white">{deal.name}</p>
                          <p className="text-xs text-white/40">{deal.stage} · {deal.probability || 0}% probability</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-white flex items-center gap-1"><DollarSign className="w-3 h-3" />{(deal.value || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}