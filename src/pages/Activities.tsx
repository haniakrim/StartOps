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
  high: "bg-[#be6464]/20 text-[#be6464]",
  medium: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  low: "bg-[#8dc572]/20 text-[#8dc572]",
};

export default function Activities() {
  const { organizationId } = useOrganization();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);
  const [newActivity, setNewActivity] = useState({
    type: "task",
    subject: "",
    description: "",
    due_date: "",
    priority: "medium",
    contact_id: "",
    deal_id: "",
  });

  useEffect(() => { fetchActivities(); fetchContactsAndDeals(); }, []);

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
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      (a.description?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const pending = filtered.filter((a) => a.status !== "completed");
  const completed = filtered.filter((a) => a.status === "completed");

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Activities
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Manage tasks, calls, meetings, and emails
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={createActivity} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Type</Label>
                  <Select
                    value={newActivity.type}
                    onValueChange={(v) =>
                      setNewActivity((p) => ({ ...p, type: v }))
                    }
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Priority</Label>
                  <Select
                    value={newActivity.priority}
                    onValueChange={(v) =>
                      setNewActivity((p) => ({ ...p, priority: v }))
                    }
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Subject</Label>
                <Input
                  required
                  value={newActivity.subject}
                  onChange={(e) =>
                    setNewActivity((p) => ({ ...p, subject: e.target.value }))
                  }
                  className="bg-[#0b0d10] border-white/10 text-white"
                  placeholder="Follow up with Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Input
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  className="bg-[#0b0d10] border-white/10 text-white"
                  placeholder="Additional details..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Due Date</Label>
                <Input
                  type="datetime-local"
                  value={newActivity.due_date}
                  onChange={(e) =>
                    setNewActivity((p) => ({ ...p, due_date: e.target.value }))
                  }
                  className="bg-[#0b0d10] border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Contact</Label>
                  <Select
                    value={newActivity.contact_id}
                    onValueChange={(v) =>
                      setNewActivity((p) => ({ ...p, contact_id: v }))
                    }
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.first_name} {c.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Deal</Label>
                  <Select
                    value={newActivity.deal_id}
                    onValueChange={(v) =>
                      setNewActivity((p) => ({ ...p, deal_id: v }))
                    }
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue placeholder="Select deal" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
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
                className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90"
              >
                Create Activity
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Check className="w-4 h-4 mr-2" />
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Activity className="w-4 h-4 mr-2" />
            All ({filtered.length})
          </TabsTrigger>
          <TabsTrigger
            value="board"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
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
                      className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() =>
                              toggleComplete(activity.id, activity.status)
                            }
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              activity.status === "completed"
                                ? "bg-[#8dc572] border-[#8dc572]"
                                : "border-white/20 hover:border-[#8dc572]"
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
                                    ? "text-white/40 line-through"
                                    : "text-white"
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
                              <p className="text-xs text-white/40 mb-2">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-white/30">
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
                            className="h-7 w-7 text-white/30 hover:text-[#be6464] hover:bg-white/5"
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
                  <p className="text-sm text-white/40 text-center py-12">
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