import { useState, useEffect } from "react";
import { FolderKanban, Plus, Loader2, LayoutGrid, List, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useOrganization } from "@/hooks/useOrganization";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  budget: number;
  actual_cost: number;
  start_date: string | null;
  end_date: string | null;
}

interface ProjectTask {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  estimated_hours: number | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  planning: "bg-primary/20 text-primary",
  active: "bg-hp-green/20 text-hp-green",
  on_hold: "bg-hp-orange/20 text-hp-orange",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-hp-red/20 text-hp-red",
};

const taskStatusColors: Record<string, string> = {
  todo: "bg-blue-500/15 text-blue-600",
  in_progress: "bg-orange-500/15 text-orange-600",
  done: "bg-emerald-500/15 text-emerald-600",
};

export default function Projects() {
  const { organizationId } = useOrganization();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: "", description: "", budget: "", priority: "medium", start_date: "", end_date: "" });
  const [newTask, setNewTask] = useState({ name: "", description: "", status: "todo", priority: "medium", due_date: "" });

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [organizationId]);
  useRealtimeTable("projects", fetchProjects);
  useRealtimeTable("project_tasks", fetchTasks);

  async function fetchProjects() {
    if (!organizationId) {
      setProjects([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error("Failed to load projects: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks() {
    if (!organizationId) return;
    try {
      const { data, error } = await supabase
        .from("project_tasks")
        .select("id,project_id,name,description,status,priority,due_date,estimated_hours,created_at")
        .in("project_id", projects.map(p => p.id).length ? projects.map(p => p.id) : ["00000000-0000-0000-0000-000000000000"]);
      if (error) throw error;
      setProjectTasks(data || []);
    } catch (error: any) {
      // silently fail for tasks - will retry when projects load
    }
  }

  // Fetch tasks whenever projects change
  useEffect(() => {
    if (projects.length) fetchTasks();
  }, [projects]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) { toast.error("No organization"); return; }
    try {
      if (editingProject) {
        const { error } = await supabase.from("projects").update({
          name: newProject.name,
          description: newProject.description || null,
          budget: parseFloat(newProject.budget) || 0,
          priority: newProject.priority,
          start_date: newProject.start_date || null,
          end_date: newProject.end_date || null,
        }).eq("id", editingProject.id);
        if (error) throw error;
        toast.success("Project updated");
      } else {
        const { error } = await supabase.from("projects").insert({
          name: newProject.name,
          description: newProject.description || null,
          budget: parseFloat(newProject.budget) || 0,
          priority: newProject.priority,
          start_date: newProject.start_date || null,
          end_date: newProject.end_date || null,
          status: "planning",
          organization_id: organizationId,
        });
        if (error) throw error;
        toast.success("Project created");
      }
      setDialogOpen(false);
      setEditingProject(null);
      setNewProject({ name: "", description: "", budget: "", priority: "medium", start_date: "", end_date: "" });
      fetchProjects();
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    }
  }

  async function deleteProject(id: string) {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Project deleted");
      if (selectedProjectId === id) setSelectedProjectId(null);
      fetchProjects();
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    }
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description || "",
      budget: String(project.budget || ""),
      priority: project.priority,
      start_date: project.start_date || "",
      end_date: project.end_date || "",
    });
    setDialogOpen(true);
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId) { toast.error("Select a project first"); return; }
    try {
      const { error } = await supabase.from("project_tasks").insert({
        project_id: selectedProjectId,
        name: newTask.name,
        description: newTask.description || null,
        status: newTask.status,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
      });
      if (error) throw error;
      toast.success("Task created");
      setNewTask({ name: "", description: "", status: "todo", priority: "medium", due_date: "" });
      fetchTasks();
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase.from("project_tasks").delete().eq("id", id);
      if (error) throw error;
      toast.success("Task deleted");
      fetchTasks();
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const selectedProjectTasks = projectTasks.filter(t => t.project_id === selectedProjectId);
  const todoTasks = selectedProjectTasks.filter(t => t.status === "todo");
  const inProgressTasks = selectedProjectTasks.filter(t => t.status === "in_progress");
  const doneTasks = selectedProjectTasks.filter(t => t.status === "done");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage projects and deliverables</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingProject(null); setNewProject({ name: "", description: "", budget: "", priority: "medium", start_date: "", end_date: "" }); } }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
            <form onSubmit={createProject} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input type="number" value={newProject.budget} onChange={e => setNewProject(p => ({ ...p, budget: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newProject.priority} onValueChange={v => setNewProject(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
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
                  <Label>Start Date</Label>
                  <Input type="date" value={newProject.start_date} onChange={e => setNewProject(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={newProject.end_date} onChange={e => setNewProject(p => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid"><LayoutGrid className="w-4 h-4 mr-2" />Grid</TabsTrigger>
          <TabsTrigger value="board"><FolderKanban className="w-4 h-4 mr-2" />Board</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No projects yet. Create your first project!</div>
            )}
            {projects.map(p => {
              const taskCount = projectTasks.filter(t => t.project_id === p.id).length;
              const doneCount = projectTasks.filter(t => t.project_id === p.id && t.status === "done").length;
              const progress = taskCount ? Math.round((doneCount / taskCount) * 100) : 0;
              return (
                <Card key={p.id} className={`cursor-pointer transition-all ${selectedProjectId === p.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedProjectId(p.id)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{p.name}</h3>
                        {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                      </div>
                      <Badge variant="secondary" className={`text-xs ${statusColors[p.status] || statusColors.planning}`}>{p.status}</Badge>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{taskCount} tasks</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEdit(p); }}>
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); deleteProject(p.id); }}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="board" className="mt-6">
          {!selectedProjectId ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Select a project from the Grid view to see its board</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{projects.find(p => p.id === selectedProjectId)?.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedProjectTasks.length} tasks</p>
                </div>
                <Button size="sm" onClick={() => { setNewTask({ name: "", description: "", status: "todo", priority: "medium", due_date: "" }); setTaskDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />Add Task
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "To Do", tasks: todoTasks, color: "bg-blue-500" },
                  { label: "In Progress", tasks: inProgressTasks, color: "bg-orange-500" },
                  { label: "Done", tasks: doneTasks, color: "bg-emerald-500" },
                ].map(col => (
                  <div key={col.label} className="bg-muted rounded-lg border border-border p-3 min-h-[300px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                        <span className="text-sm font-medium text-foreground">{col.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{col.tasks.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {col.tasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>}
                      {col.tasks.map(task => (
                        <Card key={task.id} className="bg-card border-border">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium text-foreground">{task.name}</p>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTask(task.id)}>
                                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                            {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                            <Badge variant="secondary" className={`text-xs mt-2 ${taskStatusColors[task.status] || taskStatusColors.todo}`}>{task.priority}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedProjectId && (
        <Dialog open={taskDialogOpen} onOpenChange={(open) => { setTaskDialogOpen(open); if (!open) setNewTask({ name: "", description: "", status: "todo", priority: "medium", due_date: "" }); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
            <form onSubmit={createTask} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Task Name</Label>
                <Input required value={newTask.name} onChange={e => setNewTask(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newTask.status} onValueChange={v => setNewTask(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full">Add Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
