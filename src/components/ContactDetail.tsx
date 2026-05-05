import { useState, useEffect } from "react";
import { Mail, Phone, Building2, Tag, Loader2, Pencil, Trash2, DollarSign, GitBranch, MessageSquare, Clock, Calendar, BrainCircuit, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [communications, setCommunications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => { if (contactId && open) fetchContact(); }, [contactId, open]);

  async function fetchContact() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("contacts").select("*").eq("id", contactId).single();
      if (error) throw error;
      setContact(data);

      const [{ data: dealsData }, { data: commsData }, { data: actsData }] = await Promise.all([
        supabase.from("deals").select("*").eq("contact_id", contactId).order("created_at", { ascending: false }),
        supabase.from("communications").select("*").eq("contact_id", contactId).order("occurred_at", { ascending: false }).limit(10),
        supabase.from("activities").select("*").eq("contact_id", contactId).order("created_at", { ascending: false }).limit(10),
      ]);

      setDeals(dealsData || []);
      setCommunications(commsData || []);
      setActivities(actsData || []);
    } catch (error: any) {
      toast.error("Failed to load contact: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    try {
      const { error } = await supabase.from("contacts").update({
        first_name: contact.first_name, last_name: contact.last_name, email: contact.email,
        phone: contact.phone, company: contact.company, title: contact.title, status: contact.status,
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
    Inactive: "bg-white/10 text-white/50", Lead: "bg-[#6452db]/20 text-[#6452db]", Customer: "bg-[#8dc572]/20 text-[#8dc572]",
  };

  const sentimentColors: Record<string, string> = {
    positive: "text-[#8dc572]", negative: "text-[#be6464]", neutral: "text-[#5683da]",
  };

  const sentimentIcons: Record<string, React.ElementType> = {
    positive: TrendingUp, negative: TrendingDown, neutral: Minus,
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <p className="text-sm text-white/50">{contact.title || "No title"} · {contact.company || "No company"}</p>
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
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-[#0b0d10] border border-white/10">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">Overview</TabsTrigger>
                  <TabsTrigger value="timeline" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">Timeline</TabsTrigger>
                  <TabsTrigger value="deals" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">Deals ({deals.length})</TabsTrigger>
                  <TabsTrigger value="communications" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">Comms ({communications.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={`text-xs ${statusColors[contact.status || "Lead"] || statusColors.Lead}`}>{contact.status || "Lead"}</Badge>
                    {(contact.tags || []).map((tag: string) => (<Badge key={tag} variant="outline" className="text-xs border-white/10 text-white/50">{tag}</Badge>))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-white/70"><Mail className="w-4 h-4 text-white/30" /><span>{contact.email || "No email"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-white/70"><Phone className="w-4 h-4 text-white/30" /><span>{contact.phone || "No phone"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-white/70"><Building2 className="w-4 h-4 text-white/30" /><span>{contact.company || "No company"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-white/70"><Tag className="w-4 h-4 text-white/30" /><span>{contact.title || "No title"}</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5 text-center">
                      <p className="text-lg font-semibold text-white">{deals.length}</p>
                      <p className="text-xs text-white/40">Deals</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5 text-center">
                      <p className="text-lg font-semibold text-white">{communications.length}</p>
                      <p className="text-xs text-white/40">Comms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5 text-center">
                      <p className="text-lg font-semibold text-white">{activities.length}</p>
                      <p className="text-xs text-white/40">Activities</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-3">
                    {[...communications, ...activities].sort((a, b) => new Date(b.occurred_at || b.created_at).getTime() - new Date(a.occurred_at || a.created_at).getTime()).slice(0, 15).map((item: any, i: number) => {
                      const isComm = item.type === "email" || item.type === "call" || item.type === "meeting" || item.type === "note";
                      const date = new Date(item.occurred_at || item.created_at || item.due_date);
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            {isComm ? <MessageSquare className="w-4 h-4 text-white/40" /> : <Clock className="w-4 h-4 text-white/40" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{item.subject || item.summary || "Activity"}</p>
                            <p className="text-xs text-white/40 mt-0.5">{item.type} · {date.toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })}
                    {communications.length === 0 && activities.length === 0 && (
                      <p className="text-sm text-white/40 text-center py-8">No timeline activity yet</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="deals" className="mt-4">
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-4 h-4 text-white/30" />
                          <div>
                            <p className="text-sm text-white">{deal.name}</p>
                            <p className="text-xs text-white/40\">{deal.stage} · {deal.probability || 0}% probability</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-white flex items-center gap-1"><DollarSign className="w-3 h-3" />{(deal.value || 0).toLocaleString()}</span>
                      </div>
                    ))}
                    {deals.length === 0 && <p className="text-sm text-white/40 text-center py-8">No deals associated</p>}
                  </div>
                </TabsContent>

                <TabsContent value="communications" className="mt-4">
                  <div className="space-y-3">
                    {communications.map((comm) => {
                      const SentimentIcon = sentimentIcons[comm.sentiment || "neutral"] || Minus;
                      return (
                        <div key={comm.id} className="p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{comm.subject || "No subject"}</span>
                            <div className={`flex items-center gap-1 ${sentimentColors[comm.sentiment || "neutral"]}`}>
                              <SentimentIcon className="w-3 h-3" />
                              <span className="text-xs capitalize">{comm.sentiment || "neutral"}</span>
                            </div>
                          </div>
                          {comm.summary && <p className="text-xs text-white/50 mb-2">{comm.summary}</p>}
                          <div className="flex items-center gap-2 text-xs text-white/30">
                            <BrainCircuit className="w-3 h-3" />
                            <span>AI analyzed · {new Date(comm.occurred_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                    {communications.length === 0 && <p className="text-sm text-white/40 text-center py-8">No communications logged</p>}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}