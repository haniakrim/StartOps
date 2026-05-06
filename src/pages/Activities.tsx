import { useState, useEffect } from "react";
import {
  Activity,
  Check,
  Clock,
  Phone,
  Mail,
  Calendar,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Loader2,
  Pencil,
  Trash2,
  LayoutGrid,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ActivityBoard } from "@/components/activities/ActivityBoard";
import { useOrganization } from "@/hooks/useOrganization";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface ActivityItem {
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

const typeIcons: Record<string, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  task: Activity,
  note: Activity,
};

const typeColors: Record<string, string> = {
  email: "#6452db",
  call: "#8dc572",
  meeting: "#f0ad4e",
  task: "#5683da",
  note: "#ff8964",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/15 text-red-600 dark:text-red-400",
  medium: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  low: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

export default function Activities() {
  const { organizationId } = useOrganization();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [newActivity, setNewActivity] = useState({
    type: "task",
    subject: "",
    description: "",
    due_date: "",
    priority: "medium",
    contact_id: "",
    deal_id: "",
  });
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => { fetchActivities(); fetchContactsAndDeals(); }, []);
  useRealtimeTable("activities", fetchActivities);
  useRealtimeTable("contacts", fetchContactsAndDeals);
  useRealtimeTable("deals", fetchContactsAndDeals);

  async function fetchActivities() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select(
          `
          id, type, subject, description, due_date, completed_at, status, priority, created_at,
          contacts:contact_id (first_name, last_name),
          deals:deal_id (name)
        `
        )
        .order("created_at", { ascending: false });

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
    const { data: c } = await supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .order("first_name");
    setContacts(c || []);

    const { data: d } = await supabase.from("deals").select("id, name").order("name");
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

  async function toggleComplete(id: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const { error } = await supabase
        .from("activities")
        .update({
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
      fetchActivities();
    } catch (error: any) {
      toast.error("Failed to update activity: " + error.message);
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

  const filtered = activities.filter(
    (a) =>
      (a.subject.toLowerCase().includes(search.toLowerCase()) ||
      (a.description?.toLowerCase() || "").includes(search.toLowerCase())) &&
      (statusFilter === "all" || a.status === statusFilter) &&
      (typeFilter === "all" || a.type === typeFilter)
  );

  const pending = filtered.filter((a) => a.status !== "completed");
  const completed = filtered.filter((a) => a.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Activities
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tasks, calls, meetings, and emails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => {
            const exportData = activities.map(a => ({
              "Subject": a.subject,
              "Type": a.type,
              "Priority": a.priority,
              "Status": a.status,
              "Description": a.description || "",
              "Due Date": a.due_date,
              "Contact": a.contacts ? `${a.contacts.first_name} ${a.contacts.last_name}` : "",
              "Deal": a.deals?.name || "",
            }));
            import("@/lib/export").then(({ exportToCSV }) => {
              exportToCSV(exportData, "activities");
            });
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-card-foreground max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={createActivity} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newActivity.type}
                    onValueChange={(v) =>
                      setNewActivity((p) => ({ ...p, type: v }))
                    }
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newActivity.priority}
                    onValueChange={(v) =>
                      setNewActivity((p) => ({ ...p, priority: v }))
                    }
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  required
                  value={newActivity.subject}
                  onChange={(e) =>
                    setNewActivity((p) => ({ ...p, subject: e.target.value }))
                  }
                  className="bg-muted border-border"
                  placeholder="Follow up with Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  className="bg-muted border-border"
                  placeholder="Additional details..."
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="datetime-local"
                  value={newActivity.due_date}
                  onChange={(e) =>
                    setNewActivity((p) => ({ ...p, due_date: e.target.value }))
                  }
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Select
                    value={newActivity.contact_id}
                    onValueChange={(v) =>
                      setNewActivity((p) => ({ ...p, contact_id: v }))
                    }
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.first_name} {c.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deal</Label>
                  <Select
                    value={newActivity.deal_id}
                    onValueChange={(v) =>
                      setNewActivity((p) => ({ ...p, deal_id: v }))
                    }
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Select deal" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {deals.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create Activity
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm text-foreground">{selected.length} selected</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 h-8" onClick={async () => {
            try {
              const { error } = await supabase.from("activities").update({ status: "completed", completed_at: new Date().toISOString() }).in("id", selected);
              if (error) throw error;
              toast.success(`${selected.length} activities completed`);
              setSelected([]);
              fetchActivities();
            } catch (error: any) {
              toast.error("Failed to update: " + error.message);
            }
          }}>
            <Check className="w-4 h-4 mr-1" />Complete
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8" onClick={async () => {
            try {
              const { error } = await supabase.from("activities").delete().in("id", selected);
              if (error) throw error;
              toast.success(`${selected.length} activities deleted`);
              setSelected([]);
              fetchActivities();
            } catch (error: any) {
              toast.error("Failed to delete: " + error.message);
            }
          }}>
            <Trash2 className="w-4 h-4 mr-1" />Delete
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-card border-border text-foreground w-36 h-9 text-xs">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-card border-border text-foreground w-36 h-9 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
          >
            <Check className="w-4 h-4 mr-2" />
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
          >
            <Activity className="w-4 h-4 mr-2" />
            All ({filtered.length})
          </TabsTrigger>
          <TabsTrigger
            value="board"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Board
          </TabsTrigger>
        </TabsList>

        {(["pending", "completed", "all", "board"] as const).map((tab) => {
          const items =
            tab === "all"
              ? filtered
              : tab === "pending"
                ? pending
                : tab === "completed"
                  ? completed
                  : filtered;
          return (
            <TabsContent key={tab} value={tab} className="mt-6">
              {tab === "board" ? (
                <ActivityBoard activities={filtered} onUpdate={fetchActivities} />
              ) : (
              <div className="space-y-3">
                {items.map((activity) => {
                  const Icon = typeIcons[activity.type] || Activity;
                  const color = typeColors[activity.type] || "#5683da";
                  return (
                    <Card
                      key={activity.id}
                      className="bg-card border-border hover:border-primary/20 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            className="mt-0.5 rounded border-border bg-transparent"
                            checked={selected.includes(activity.id)}
                            onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, activity.id] : prev.filter((id) => id !== activity.id))}
                          />
                          <button
                            onClick={() =>
                              toggleComplete(activity.id, activity.status)
                            }
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              activity.status === "completed"
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-border hover:border-emerald-500"
                            }`}
                          >
                            {activity.status === "completed" && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-sm font-medium ${
                                  activity.status === "completed"
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground"
                                }`}
                              >
                                {activity.subject}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  priorityColors[activity.priority]
                                }`}
                              >
                                {activity.priority}
                              </Badge>
                            </div>
                            {activity.description && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {activity.contacts && (
                                <span>
                                  {activity.contacts.first_name}{" "}
                                  {activity.contacts.last_name}
                                </span>
                              )}
                              {activity.deals && (
                                <span>· {activity.deals.name}</span>
                              )}
                              {activity.due_date && (
                                <span className="flex items-center gap-1">
                                  · <Clock className="w-3 h-3" />
                                  {new Date(
                                    activity.due_date
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-accent"
                            onClick={() => deleteActivity(activity.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No {tab} activities
                  </p>
                )}
              </div>
            )}
          </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}