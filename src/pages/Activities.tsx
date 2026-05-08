import { useState, useEffect } from "react";
import {
  CheckCircle2, Clock, AlertCircle, Plus, Search, Loader2, Filter, Trash2, Calendar, Phone, Mail, MessageSquare, Video, FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Activity {
  id: string;
  type: string;
  subject: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  status: string;
  priority: string;
  created_at: string;
  contacts: { first_name: string; last_name: string } | null;
  deals: { name: string } | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  task: <FileText className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Video className="w-4 h-4" />,
  note: <MessageSquare className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
  low: "bg-emerald-500/20 text-emerald-500",
  medium: "bg-amber-500/20 text-amber-500",
  high: "bg-orange-500/20 text-orange-500",
  urgent: "bg-red-500/20 text-red-500",
};

export default function Activities() {
  const { organizationId } = useOrganization();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);
  const [newActivity, setNewActivity] = useState({
    type: "task", subject: "", description: "", due_date: "", priority: "medium", contact_id: "", deal_id: "",
  });

  useEffect(() => { fetchActivities(); fetchContactsAndDeals(); }, [organizationId]);
  useRealtimeTable("activities", fetchActivities);
  useRealtimeTable("deals", fetchContactsAndDeals);

  async function fetchActivities() {
    try {
      setLoading(true);
      let query = supabase
        .from("activities")
        .select(
          `
          id, type, subject, description, due_date, completed_at, status, priority, created_at,
          contacts:contact_id (first_name, last_name),
          deals:deal_id (name)
        `
        )
        .order("created_at", { ascending: false });
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      const { data, error } = await query;

      if (error) throw error;
      setActivities(
        (data || []).map((d: any) => ({
          ...d,
          contacts: d.contacts?.[0] ?? null,
          deals: d.deals?.[0] ?? null,
        }))
      );
    } catch (error: any) {
      toast.error("Failed to load activities: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContactsAndDeals() {
    let cQuery = supabase.from("contacts").select("id, first_name, last_name").order("first_name");
    if (organizationId) {
      cQuery = cQuery.eq("organization_id", organizationId);
    }
    const { data: c } = await cQuery;
    setContacts(c || []);

    let dQuery = supabase.from("deals").select("id, name").order("name");
    if (organizationId) {
      dQuery = dQuery.eq("organization_id", organizationId);
    }
    const { data: d } = await dQuery;
    setDeals(d || []);
  }

  async function createActivity(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!organizationId) {
        toast.error("No organization found. Please sign out and sign in again.");
        return;
      }
      const { error } = await supabase.from("activities").insert({
        type: newActivity.type,
        subject: newActivity.subject,
        description: newActivity.description || null,
        due_date: newActivity.due_date || null,
        priority: newActivity.priority,
        contact_id: newActivity.contact_id || null,
        deal_id: newActivity.deal_id || null,
        status: "pending",
        organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Activity created");
      setDialogOpen(false);
      setNewActivity({
        type: "task",
        subject: "",
        description: "",
        due_date: "",
        priority: "medium",
        contact_id: "",
        deal_id: "",
      });
      fetchActivities();
    } catch (error: any) {
      toast.error("Failed to create activity: " + error.message);
    }
  }

  async function completeActivity(id: string) {
    try {
      const { error } = await supabase.from("activities").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      toast.success("Activity completed");
      fetchActivities();
    } catch (error: any) {
      toast.error("Failed to complete activity: " + error.message);
    }
  }

  async function deleteActivity(id: string) {
    try {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
      toast.success("Activity deleted");
      fetchActivities();
    } catch (error: any) {
      toast.error("Failed to delete activity: " + error.message);
    }
  }

  async function bulkComplete() {
    try {
      const { error } = await supabase.from("activities").update({ status: "completed", completed_at: new Date().toISOString() }).in("id", selected);
      if (error) throw error;
      toast.success(`${selected.length} activities completed`);
      setSelected([]);
      fetchActivities();
    } catch (error: any) {
      toast.error("Failed to complete activities: " + error.message);
    }
  }

  async function bulkDelete() {
    try {
      const { error } = await supabase.from("activities").delete().in("id", selected);
      if (error) throw error;
      toast.success(`${selected.length} activities deleted`);
      setSelected([]);
      fetchActivities();
    } catch (error: any) {
      toast.error("Failed to delete activities: " + error.message);
    }
  }

  const filtered = activities.filter(a =>
    a.subject.toLowerCase().includes(search.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Activities</h1>
          <p className="text-sm text-muted-foreground mt-1">Track tasks, calls, meetings, and more</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Activity</DialogTitle></DialogHeader>
            <form onSubmit={createActivity} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Type</Label>
                <Select value={newActivity.type} onValueChange={(v) => setNewActivity(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Subject</Label>
                <Input required value={newActivity.subject} onChange={(e) => setNewActivity(p => ({ ...p, subject: e.target.value }))} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Description</Label>
                <Input value={newActivity.description} onChange={(e) => setNewActivity(p => ({ ...p, description: e.target.value }))} className="bg-input border-border text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Due Date</Label>
                  <Input type="date" value={newActivity.due_date} onChange={(e) => setNewActivity(p => ({ ...p, due_date: e.target.value }))} className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Priority</Label>
                  <Select value={newActivity.priority} onValueChange={(v) => setNewActivity(p => ({ ...p, priority: v }))}>
                    <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border-border text-foreground">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Contact</Label>
                <Select value={newActivity.contact_id} onValueChange={(v) => setNewActivity(p => ({ ...p, contact_id: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Select contact" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Deal</Label>
                <Select value={newActivity.deal_id} onValueChange={(v) => setNewActivity(p => ({ ...p, deal_id: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Select deal" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    {deals.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create Activity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm text-foreground">{selected.length} selected</span>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])} className="text-muted-foreground hover:text-foreground">Clear</Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={bulkComplete} className="text-hp-green hover:text-hp-green">Complete</Button>
          <Button variant="ghost" size="sm" onClick={bulkDelete} className="text-hp-red hover:text-hp-red">Delete</Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(activity => (
            <Card key={activity.id} className={`bg-card border-border hover:border-border/80 transition-colors ${activity.status === "completed" ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {typeIcons[activity.type] || <FileText className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-medium ${activity.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>{activity.subject}</h3>
                        <Badge variant="secondary" className={`text-xs ${priorityColors[activity.priority] || priorityColors.medium}`}>{activity.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.status !== "completed" && (
                          <Button variant="ghost" size="sm" onClick={() => completeActivity(activity.id)} className="text-hp-green hover:text-hp-green">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteActivity(activity.id)} className="text-hp-red hover:text-hp-red">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {activity.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(activity.due_date).toLocaleDateString()}</span>}
                      {activity.contacts && <span>{activity.contacts.first_name} {activity.contacts.last_name}</span>}
                      {activity.deals && <span>{activity.deals.name}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">No activities found. Add your first activity!</div>
          )}
        </div>
      )}
    </div>
  );
}
