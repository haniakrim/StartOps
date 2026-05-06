import { useState, useEffect } from "react";
import {
  FolderKanban, Clock, Users, AlertTriangle, CheckCircle2, Plus,
  Search, Loader2, TrendingUp, BarChart3, Calendar, LayoutGrid
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectBoard } from "@/components/projects/ProjectBoard";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  contacts: { first_name: string; last_name: string; company: string | null } | null;
}

interface ProjectTask {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  assignee_id: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  due_date: string;
  completed_at: string | null;
}

const statusColors: Record<string, string> = {
  planning: "bg-[#5683da]/20 text-[#5683da]",
  active: "bg-[#8dc572]/20 text-[#8dc572]",
  on_hold: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  completed: "bg-white/10 text-white/50",
  cancelled: "bg-[#be6464]/20 text-[#be6464]",
};

const priorityColors: Record<string, string> = {
  low: "bg-[#8dc572]/20 text-[#8dc572]",
  medium: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  high: "bg-[#ff8964]/20 text-[#ff8964]",
  urgent: "bg-[#be6464]/20 text-[#be6464]",
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: "", description: "", budget: "", priority: "medium", start_date: "", end_date: "" });

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(`*, contacts:client_id (first_name, last_name, company)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProjects((data || []).map((d: any) => ({ ...d, contacts: d.contacts?.[0] ?? null })));

      const { data: taskData } = await supabase.from("project_tasks").select("*").order("created_at", { ascending: false });
      setTasks(taskData || []);

      if (data && data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (error: any) {
      toast.error("Failed to load projects: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("projects").insert({
        name: newProject.name,
        description: newProject.description || null,
        budget: parseFloat(newProject.budget) || 0,
        priority: newProject.priority,
        start_date: newProject.start_date || null,
        end_date: newProject.end_date || null,
        status: "planning",
      });
      if (error) throw error;
      toast.success("Project created");
      setDialogOpen(false);
      setNewProject({ name: "", description: "", budget: "", priority: "medium", start_date: "", end_date: "" });
      fetchProjects();
    } catch (error: any) {
      toast.error("Failed to create project: " + error.message);
    }
  }

  const atRiskProjects = projects.filter(p => {
    const progress = p.progress || 0;
    const daysLeft = p.end_date ? Math.ceil((new Date(p.end_date).getTime() - Date.now()) / 86400000) : 999;
    return (progress < 50 && daysLeft < 14) || (p.actual_cost || 0) > (p.budget || 0) * 0.9;
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Projects</h1>
          <p className="text-sm text-white/50 mt-1">Project delivery intelligence and resource optimization</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <form onSubmit={createProject} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Project Name</Label>
                <Input required value={newProject.name} onChange={(e) => setNewProject(p => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Input value={newProject.description} onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Budget ($)</Label>
                  <Input type="number" value={newProject.budget} onChange={(e) => setNewProject(p => ({ ...p, budget: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Priority</Label>
                  <Select value={newProject.priority} onValueChange={(v) => setNewProject(p => ({ ...p, priority: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Start Date</Label>
                  <Input type="date" value={newProject.start_date} onChange={(e) => setNewProject(p => ({ ...p, start_date: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">End Date</Label>
                  <Input type="date" value={newProject.end_date} onChange={(e) => setNewProject(p => ({ ...p, end_date: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delivery Risk Alert */}
      {atRiskProjects.length > 0 && (
        <Card className="bg-[#f0ad4e]/5 border-[#f0ad4e]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#f0ad4e]" />
              <div>
                <p className="text-sm font-medium text-white">Delivery Risk Detected</p>
                <p className="text-xs text-white/50">{atRiskProjects.length} project{atRiskProjects.length > 1 ? "s" : ""} at risk of late delivery or budget overrun</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="active" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><FolderKanban className="w-4 h-4 mr-2" />Active</TabsTrigger>
          <TabsTrigger value="planning" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Calendar className="w-4 h-4 mr-2" />Planning</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><CheckCircle2 className="w-4 h-4 mr-2" />Completed</TabsTrigger>
          <TabsTrigger value="board" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><LayoutGrid className="w-4 h-4 mr-2" />Task Board</TabsTrigger>
        </TabsList>

        {["active", "planning", "completed"].map(tab => {
          const filtered = tab === "active" ? projects.filter(p => p.status === "active" || p.status === "on_hold")
            : tab === "planning" ? projects.filter(p => p.status === "planning")
            : projects.filter(p => p.status === "completed" || p.status === "cancelled");
          return (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const completedTasks = projectTasks.filter(t => t.status === "done").length;
                  const budgetUsed = project.budget > 0 ? ((project.actual_cost || 0) / project.budget) * 100 : 0;
                  const isAtRisk = atRiskProjects.some(p => p.id === project.id);
                  return (
                    <Card key={project.id} className={`bg-[#18191b] border-white/10 hover:border-white/20 transition-colors cursor-pointer ${isAtRisk ? "border-[#f0ad4e]/30" : ""}`} onClick={() => setSelectedProjectId(project.id)}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary" className={`text-xs ${statusColors[project.status] || statusColors.planning}`}>{project.status}</Badge>
                          <Badge variant="secondary" className={`text-xs ${priorityColors[project.priority] || priorityColors.medium}`}>{project.priority}</Badge>
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">{project.name}</h3>
                        <p className="text-sm text-white/50 mb-4 line-clamp-2">{project.description || "No description"}</p>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-white/40">Progress</span>
                              <span className="text-white">{project.progress || 0}%</span>
                            </div>
                            <Progress value={project.progress || 0} className="h-1.5 bg-white/10" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-white/40">Budget</span>
                              <span className={`${budgetUsed > 90 ? "text-[#be6464]" : "text-white"}`}>${(project.actual_cost || 0).toLocaleString()} / ${(project.budget || 0).toLocaleString()}</span>
                            </div>
                            <Progress value={Math.min(budgetUsed, 100)} className="h-1.5 bg-white/10" />
                          </div>
                          <div className="flex items-center justify-between text-xs text-white/40 pt-2">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{project.end_date ? new Date(project.end_date).toLocaleDateString() : "No deadline"}</span>
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{completedTasks}/{projectTasks.length} tasks</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center py-12 text-sm text-white/40">No {tab} projects</div>
                )}
              </div>
            </TabsContent>
          );
        })}

        <TabsContent value="board" className="mt-6">
          {selectedProject ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedProject.name}</h2>
                  <p className="text-sm text-white/50">Task board</p>
                </div>
                <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="bg-[#18191b] border-white/10 text-white w-64">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ProjectBoard
                projectId={selectedProject.id}
                tasks={tasks}
                onUpdate={fetchProjects}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-white/40">No project selected. Create a project first!</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}