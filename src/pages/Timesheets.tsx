import { useState, useEffect } from "react";
import {
  Clock, Plus, Search, Loader2, Calendar, Briefcase, User,
  TrendingUp, CheckCircle2, AlertCircle, Trash2, Download
} from "lucide-react";
import { exportToCSV } from "@/lib/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TimeTracker } from "@/components/timesheets/TimeTracker";
import { RecentSessions } from "@/components/timesheets/RecentSessions";
import { useRealtimeTable } from "@/hooks/useRealtime";
import { useOrganization } from "@/hooks/useOrganization";

interface TimeEntry {
  id: string;
  project_id: string;
  task_id: string | null;
  user_id: string;
  description: string | null;
  hours: number;
  date: string;
  billable: boolean;
  projects: { name: string } | null;
  project_tasks: { name: string } | null;
}

interface Project {
  id: string;
  name: string;
}

interface ProjectTask {
  id: string;
  name: string;
  project_id: string;
}

export default function Timesheets() {
  const { organizationId } = useOrganization();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");

  const [newEntry, setNewEntry] = useState({
    project_id: "",
    task_id: "",
    description: "",
    hours: "",
    date: new Date().toISOString().split("T")[0],
    billable: true,
  });

  useEffect(() => { fetchData(); }, []);
  useRealtimeTable("time_entries", fetchData);
  useRealtimeTable("projects", fetchData);

  async function fetchData() {
    try {
      setLoading(true);
      let entryQuery = supabase.from("time_entries").select(`*, projects:project_id (name), project_tasks:task_id (name)`).order("date", { ascending: false }).limit(100);
      let projQuery = supabase.from("projects").select("id, name").order("name");
      let taskQuery = supabase.from("project_tasks").select("id, name, project_id").order("name");

      if (organizationId) {
        entryQuery = entryQuery.eq("organization_id", organizationId);
        projQuery = projQuery.eq("organization_id", organizationId);
        taskQuery = taskQuery.eq("organization_id", organizationId);
      }

      const { data: entryData, error: entryError } = await entryQuery;
      if (entryError) throw entryError;
      setEntries((entryData || []).map((d: any) => ({
        ...d,
        projects: d.projects?.[0] ?? null,
        project_tasks: d.project_tasks?.[0] ?? null,
      })));

      const { data: projData } = await projQuery;
      setProjects(projData || []);

      const { data: taskData } = await taskQuery;
      setTasks(taskData || []);
    } catch (error: any) {
      toast.error("Failed to load timesheets: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createEntry(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("time_entries").insert({
        project_id: newEntry.project_id,
        task_id: newEntry.task_id || null,
        description: newEntry.description || null,
        hours: parseFloat(newEntry.hours) || 0,
        date: newEntry.date,
        billable: newEntry.billable,
        user_id: userData.user?.id,
      });
      if (error) throw error;
      toast.success("Time entry logged");
      setDialogOpen(false);
      setNewEntry({ project_id: "", task_id: "", description: "", hours: "", date: new Date().toISOString().split("T")[0], billable: true });
      fetchData();
    } catch (error: any) {
      toast.error("Failed to log time: " + error.message);
    }
  }

  async function deleteEntry(id: string) {
    try {
      const { error } = await supabase.from("time_entries").delete().eq("id", id);
      if (error) throw error;
      toast.success("Entry deleted");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete entry: " + error.message);
    }
  }

  const filteredEntries = entries.filter(e =>
    (e.description?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (e.projects?.name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const totalHours = entries.reduce((s, e) => s + (e.hours || 0), 0);
  const billableHours = entries.filter(e => e.billable).reduce((s, e) => s + (e.hours || 0), 0);
  const thisWeekHours = entries.filter(e => {
    const entryDate = new Date(e.date);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return entryDate >= weekAgo;
  }).reduce((s, e) => s + (e.hours || 0), 0);

  const projectHours = entries.reduce((acc: Record<string, number>, e) => {
    const name = e.projects?.name || "Unknown";
    acc[name] = (acc[name] || 0) + (e.hours || 0);
    return acc;
  }, {});

  const filteredTasks = tasks.filter(t => t.project_id === selectedProject);

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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Timesheets</h1>
          <p className="text-sm text-muted-foreground mt-1">Track time across projects and tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const exportData = entries.map(e => ({
              "Date": e.date,
              "Project": e.projects?.name || "",
              "Task": e.project_tasks?.name || "",
              "Description": e.description || "",
              "Hours": e.hours,
              "Billable": e.billable ? "Yes" : "No",
            }));
            exportToCSV(exportData, "timesheets");
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Time Entry</DialogTitle></DialogHeader>
              <form onSubmit={createEntry} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={newEntry.project_id} onValueChange={(v) => {
                    setNewEntry(p => ({ ...p, project_id: v, task_id: "" }));
                    setSelectedProject(v);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Task (optional)</Label>
                  <Select value={newEntry.task_id} onValueChange={(v) => setNewEntry(p => ({ ...p, task_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
                    <SelectContent>
                      {filteredTasks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={newEntry.description} onChange={(e) => setNewEntry(p => ({ ...p, description: e.target.value }))} placeholder="What did you work on?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hours</Label>
                    <Input type="number" step="0.25" required value={newEntry.hours} onChange={(e) => setNewEntry(p => ({ ...p, hours: e.target.value }))} placeholder="8.0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" required value={newEntry.date} onChange={(e) => setNewEntry(p => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={newEntry.billable} onChange={(e) => setNewEntry(p => ({ ...p, billable: e.target.checked }))} className="rounded border-border bg-background" />
                  <Label className="text-muted-foreground">Billable</Label>
                </div>
                <Button type="submit" className="w-full">Log Entry</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Timer */}
      <TimeTracker projects={projects} tasks={tasks} onEntryCreated={fetchData} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <Clock className="w-5 h-5 text-primary mb-3" />
            <p className="text-2xl font-semibold text-foreground">{totalHours.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Total Hours Logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-emerald-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{billableHours.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Billable Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Calendar className="w-5 h-5 text-orange-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{thisWeekHours.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
      </div>

      <RecentSessions sessions={entries} />

      <Tabs defaultValue="entries" className="w-full">
        <TabsList>
          <TabsTrigger value="entries"><Clock className="w-4 h-4 mr-2" />Entries</TabsTrigger>
          <TabsTrigger value="projects"><Briefcase className="w-4 h-4 mr-2" />By Project</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Project</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Task</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Hours</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground/50">No time entries yet</td></tr>
                  )}
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{entry.projects?.name || "-"}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{entry.project_tasks?.name || "-"}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{entry.description || "-"}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{entry.hours || 0}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className={`text-xs ${entry.billable ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                          {entry.billable ? "Billable" : "Non-billable"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteEntry(entry.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(projectHours).map(([name, hours]) => {
              const maxHours = Math.max(...Object.values(projectHours));
              const pct = maxHours > 0 ? (hours / maxHours) * 100 : 0;
              return (
                <Card key={name}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-medium text-foreground">{name}</h3>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{hours.toFixed(1)}h</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{pct.toFixed(0)}% of total tracked time</p>
                  </CardContent>
                </Card>
              );
            })}
            {Object.entries(projectHours).length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground/50">No time tracked yet</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
