import { useState, useEffect } from "react";
import {
  Clock, Plus, Search, Loader2, Calendar, Briefcase, User,
  TrendingUp, CheckCircle2, AlertCircle, Trash2
} from "lucide-react";
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

  async function fetchData() {
    try {
      setLoading(true);
      const { data: entryData, error: entryError } = await supabase
        .from("time_entries")
        .select(`*, projects:project_id (name), project_tasks:task_id (name)`)
        .order("date", { ascending: false })
        .limit(100);
      if (entryError) throw entryError;
      setEntries((entryData || []).map((d: any) => ({
        ...d,
        projects: d.projects?.[0] ?? null,
        project_tasks: d.project_tasks?.[0] ?? null,
      })));

      const { data: projData } = await supabase.from("projects").select("id, name").order("name");
      setProjects(projData || []);

      const { data: taskData } = await supabase.from("project_tasks").select("id, name, project_id").order("name");
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
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Timesheets</h1>
          <p className="text-sm text-white/50 mt-1">Track time across projects and tasks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />Manual Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader><DialogTitle>Log Time Entry</DialogTitle></DialogHeader>
            <form onSubmit={createEntry} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Project</Label>
                <Select value={newEntry.project_id} onValueChange={(v) => {
                  setNewEntry(p => ({ ...p, project_id: v, task_id: "" }));
                  setSelectedProject(v);
                }}>
                  <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Task (optional)</Label>
                <Select value={newEntry.task_id} onValueChange={(v) => setNewEntry(p => ({ ...p, task_id: v }))}>
                  <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue placeholder="Select task" /></SelectTrigger>
                  <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                    {filteredTasks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Input value={newEntry.description} onChange={(e) => setNewEntry(p => ({ ...p, description: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="What did you work on?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Hours</Label>
                  <Input type="number" step="0.25" required value={newEntry.hours} onChange={(e) => setNewEntry(p => ({ ...p, hours: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="8.0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Date</Label>
                  <Input type="date" required value={newEntry.date} onChange={(e) => setNewEntry(p => ({ ...p, date: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newEntry.billable} onChange={(e) => setNewEntry(p => ({ ...p, billable: e.target.checked }))} className="rounded border-white/20 bg-transparent" />
                <Label className="text-white/70">Billable</Label>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Log Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer */}
      <TimeTracker projects={projects} tasks={tasks} onEntryCreated={fetchData} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Clock className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">{totalHours.toFixed(1)}</p>
            <p className="text-sm text-white/50">Total Hours Logged</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">{billableHours.toFixed(1)}</p>
            <p className="text-sm text-white/50">Billable Hours</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Calendar className="w-5 h-5 text-[#ff8964] mb-3" />
            <p className="text-2xl font-semibold text-white">{thisWeekHours.toFixed(1)}</p>
            <p className="text-sm text-white/50">This Week</p>
          </CardContent>
        </Card>
      </div>

      <RecentSessions sessions={entries} />

      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="entries" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Clock className="w-4 h-4 mr-2" />Entries</TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Briefcase className="w-4 h-4 mr-2" />By Project</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
            </div>
          </div>
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Project</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Task</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Hours</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-sm text-white/40">No time entries yet</td></tr>
                  )}
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-sm text-white/70">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm text-white">{entry.projects?.name || "-"}</td>
                      <td className="py-3 px-4 text-sm text-white/70">{entry.project_tasks?.name || "-"}</td>
                      <td className="py-3 px-4 text-sm text-white/70">{entry.description || "-"}</td>
                      <td className="py-3 px-4 text-sm font-medium text-white">{entry.hours || 0}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className={`text-xs ${entry.billable ? "bg-[#8dc572]/20 text-[#8dc572]" : "bg-white/10 text-white/50"}`}>
                          {entry.billable ? "Billable" : "Non-billable"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-[#be6464]" onClick={() => deleteEntry(entry.id)}>
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
                <Card key={name} className="bg-[#18191b] border-white/10">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-[#6452db]" />
                        </div>
                        <h3 className="text-sm font-medium text-white">{name}</h3>
                      </div>
                      <span className="text-sm font-semibold text-white">{hours.toFixed(1)}h</span>
                    </div>
                    <Progress value={pct} className="h-2 bg-white/10" />
                    <p className="text-xs text-white/40 mt-2">{pct.toFixed(0)}% of total tracked time</p>
                  </CardContent>
                </Card>
              );
            })}
            {Object.entries(projectHours).length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-white/40">No time tracked yet</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}