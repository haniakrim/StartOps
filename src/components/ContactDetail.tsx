import { useState, useEffect } from "react";
import { Mail, Phone, Building2, Tag, Loader2, Pencil, Trash2, DollarSign, GitBranch, MessageSquare, Clock, BrainCircuit, TrendingUp, TrendingDown, Minus, Calendar, CheckCircle2 } from "lucide-react";
import { CommentsSection } from "@/components/CommentsSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "task", subject: "", description: "", due_date: "", priority: "medium" });
  const [newDeal, setNewDeal] = useState({ name: "", value: "", probability: "50", stage: "lead", expected_close_date: "" });

  useEffect(() => { if (contactId && open) fetchContact(); }, [contactId, open]);

  async function fetchContact() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("contacts").select("*").eq("id", contactId).maybeSingle();
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

  async function createActivity(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("activities").insert({
        type: newActivity.type,
        subject: newActivity.subject,
        description: newActivity.description || null,
        due_date: newActivity.due_date || null,
        priority: newActivity.priority,
        contact_id: contactId,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Activity created");
      setActivityDialogOpen(false);
      setNewActivity({ type: "task", subject: "", description: "", due_date: "", priority: "medium" });
      fetchContact();
    } catch (error: any) {
      toast.error("Failed to create activity: " + error.message);
    }
  }

  async function createDeal(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("deals").insert({
        name: newDeal.name,
        value: parseFloat(newDeal.value) || 0,
        probability: parseInt(newDeal.probability) || 0,
        stage: newDeal.stage,
        expected_close_date: newDeal.expected_close_date || null,
        contact_id: contactId,
        status: "open",
      });
      if (error) throw error;
      toast.success("Deal created");
      setDealDialogOpen(false);
      setNewDeal({ name: "", value: "", probability: "50", stage: "lead", expected_close_date: "" });
      fetchContact();
    } catch (error: any) {
      toast.error("Failed to create deal: " + error.message);
    }
  }

  async function logCommunication(type: string) {
    try {
      const { error } = await supabase.from("communications").insert({
        type,
        direction: "outbound",
        subject: `${type} with ${contact?.first_name} ${contact?.last_name}`,
        contact_id: contactId,
        occurred_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success(`${type} logged`);
      fetchContact();
    } catch (error: any) {
      toast.error("Failed to log communication: " + error.message);
    }
  }

  const statusColors: Record<string, string> = {
    Active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    Prospect: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    Inactive: "bg-muted text-muted-foreground",
    Lead: "bg-primary/15 text-primary",
    Customer: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  };

  const sentimentColors: Record<string, string> = {
    positive: "text-emerald-500", negative: "text-red-500", neutral: "text-blue-500",
  };

  const sentimentIcons: Record<string, React.ElementType> = {
    positive: TrendingUp, negative: TrendingDown, neutral: Minus,
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{loading ? "Loading..." : `${contact?.first_name || ""} ${contact?.last_name || ""}`}</DialogTitle>
            {!loading && contact && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditing(!editing)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={deleteContact}><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : contact ? (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                {contact.first_name?.[0]}{contact.last_name?.[0]}
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{contact.first_name} {contact.last_name}</h3>
                <p className="text-sm text-muted-foreground">{contact.title || "No title"} · {contact.company || "No company"}</p>
              </div>
            </div>

            {/* Quick Actions */}
            {!editing && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => logCommunication("email")}>
                  <Mail className="w-3.5 h-3.5 mr-1.5" />Log Email
                </Button>
                <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => logCommunication("call")}>
                  <Phone className="w-3.5 h-3.5 mr-1.5" />Log Call
                </Button>
                <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => setActivityDialogOpen(true)}>
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />Add Task
                </Button>
                <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => setDealDialogOpen(true)}>
                  <DollarSign className="w-3.5 h-3.5 mr-1.5" />Add Deal
                </Button>
              </div>
            )}

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name</Label><Input value={contact.first_name} onChange={(e) => setContact({ ...contact, first_name: e.target.value })} className="bg-muted border-border" /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input value={contact.last_name} onChange={(e) => setContact({ ...contact, last_name: e.target.value })} className="bg-muted border-border" /></div>
                </div>
                <div className="space-y-2"><Label>Email</Label><Input value={contact.email || ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="bg-muted border-border" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={contact.phone || ""} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="bg-muted border-border" /></div>
                <div className="space-y-2"><Label>Company</Label><Input value={contact.company || ""} onChange={(e) => setContact({ ...contact, company: e.target.value })} className="bg-muted border-border" /></div>
                <div className="space-y-2"><Label>Title</Label><Input value={contact.title || ""} onChange={(e) => setContact({ ...contact, title: e.target.value })} className="bg-muted border-border" /></div>
                <div className="flex gap-2">
                  <Button onClick={saveChanges} className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">Cancel</Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted border border-border">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Overview</TabsTrigger>
                  <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Timeline</TabsTrigger>
                  <TabsTrigger value="deals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Deals ({deals.length})</TabsTrigger>
                  <TabsTrigger value="communications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Comms ({communications.length})</TabsTrigger>
                  <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={`text-xs ${statusColors[contact.status || "Lead"] || statusColors.Lead}`}>{contact.status || "Lead"}</Badge>
                    {(contact.tags || []).map((tag: string) => (<Badge key={tag} variant="outline" className="text-xs border-border text-muted-foreground">{tag}</Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-foreground"><Mail className="w-4 h-4 text-muted-foreground" /><span>{contact.email || "No email"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-foreground"><Phone className="w-4 h-4 text-muted-foreground" /><span>{contact.phone || "No phone"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-foreground"><Building2 className="w-4 h-4 text-muted-foreground" /><span>{contact.company || "No company"}</span></div>
                    <div className="flex items-center gap-3 text-sm text-foreground"><Tag className="w-4 h-4 text-muted-foreground" /><span>{contact.title || "No title"}</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted border border-border text-center">
                      <p className="text-lg font-semibold text-foreground">{deals.length}</p>
                      <p className="text-xs text-muted-foreground">Deals</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border border-border text-center">
                      <p className="text-lg font-semibold text-foreground">{communications.length}</p>
                      <p className="text-xs text-muted-foreground">Comms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border border-border text-center">
                      <p className="text-lg font-semibold text-foreground">{activities.length}</p>
                      <p className="text-xs text-muted-foreground">Activities</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-3">
                    {[...communications, ...activities].sort((a, b) => new Date(b.occurred_at || b.created_at).getTime() - new Date(a.occurred_at || a.created_at).getTime()).slice(0, 15).map((item: any, i: number) => {
                      const isComm = item.type === "email" || item.type === "call" || item.type === "meeting" || item.type === "note";
                      const date = new Date(item.occurred_at || item.created_at || item.due_date);
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
                          <div className="w-8 h-8 rounded-lg bg-muted-foreground/10 flex items-center justify-center flex-shrink-0">
                            {isComm ? <MessageSquare className="w-4 h-4 text-muted-foreground" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{item.subject || item.summary || "Activity"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.type} · {date.toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })}
                    {communications.length === 0 && activities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No timeline activity yet</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="deals" className="mt-4">
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-foreground">{deal.name}</p>
                            <p className="text-xs text-muted-foreground">{deal.stage} · {deal.probability || 0}% probability</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" />{(deal.value || 0).toLocaleString()}</span>
                      </div>
                    ))}
                    {deals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No deals associated</p>}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-4">
                  <CommentsSection entityType="contact" entityId={contactId} />
                </TabsContent>

                <TabsContent value="communications" className="mt-4">
                  <div className="space-y-3">
                    {communications.map((comm) => {
                      const SentimentIcon = sentimentIcons[comm.sentiment || "neutral"] || Minus;
                      return (
                        <div key={comm.id} className="p-3 rounded-lg bg-muted border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{comm.subject || "No subject"}</span>
                            <div className={`flex items-center gap-1 ${sentimentColors[comm.sentiment || "neutral"]}`}>
                              <SentimentIcon className="w-3 h-3" />
                              <span className="text-xs capitalize">{comm.sentiment || "neutral"}</span>
                            </div>
                          </div>
                          {comm.summary && <p className="text-xs text-muted-foreground mb-2">{comm.summary}</p>}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <BrainCircuit className="w-3 h-3" />
                            <span>AI analyzed · {new Date(comm.occurred_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                    {communications.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No communications logged</p>}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : null}
      </DialogContent>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground">
          <DialogHeader><DialogTitle>Add Activity</DialogTitle></DialogHeader>
          <form onSubmit={createActivity} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newActivity.type} onValueChange={(v) => setNewActivity(p => ({ ...p, type: v }))}>
                <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Subject</Label><Input required value={newActivity.subject} onChange={(e) => setNewActivity(p => ({ ...p, subject: e.target.value }))} className="bg-muted border-border" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={newActivity.description} onChange={(e) => setNewActivity(p => ({ ...p, description: e.target.value }))} className="bg-muted border-border" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Due Date</Label><Input type="datetime-local" value={newActivity.due_date} onChange={(e) => setNewActivity(p => ({ ...p, due_date: e.target.value }))} className="bg-muted border-border" /></div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newActivity.priority} onValueChange={(v) => setNewActivity(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create Activity</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deal Dialog */}
      <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground">
          <DialogHeader><DialogTitle>Add Deal</DialogTitle></DialogHeader>
          <form onSubmit={createDeal} className="space-y-4 pt-4">
            <div className="space-y-2"><Label>Deal Name</Label><Input required value={newDeal.name} onChange={(e) => setNewDeal(p => ({ ...p, name: e.target.value }))} className="bg-muted border-border" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Value ($)</Label><Input type="number" required value={newDeal.value} onChange={(e) => setNewDeal(p => ({ ...p, value: e.target.value }))} className="bg-muted border-border" /></div>
              <div className="space-y-2"><Label>Probability (%)</Label><Input type="number" min="0" max="100" value={newDeal.probability} onChange={(e) => setNewDeal(p => ({ ...p, probability: e.target.value }))} className="bg-muted border-border" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={newDeal.stage} onValueChange={(v) => setNewDeal(p => ({ ...p, stage: v }))}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Close Date</Label><Input type="date" value={newDeal.expected_close_date} onChange={(e) => setNewDeal(p => ({ ...p, expected_close_date: e.target.value }))} className="bg-muted border-border" /></div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create Deal</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}