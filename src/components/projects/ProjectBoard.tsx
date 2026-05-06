import { useState, useEffect } from "react";
import { Plus, Clock, User, Calendar, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectTask {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  due_date: string;
  completed_at: string | null;
}

interface ProjectBoardProps {
  projectId: string;
  tasks: ProjectTask[];
  onUpdate: () => void;
}

const columnConfig = [
  { id: "todo", label: "To Do", color: "#5683da" },
  { id: "in_progress", label: "In Progress", color: "#f0ad4e" },
  { id: "done", label: "Done", color: "#8dc572" },
];

const priorityColors: Record<string, string> = {
  low: "bg-[#8dc572]/20 text-[#8dc572]",
  medium: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  high: "bg-[#ff8964]/20 text-[#ff8964]",
  urgent: "bg-[#be6464]/20 text-[#be6464]",
};

export function ProjectBoard({ projectId, tasks, onUpdate }: ProjectBoardProps) {
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>(tasks);
  const [draggedTask, setDraggedTask] = useState<ProjectTask | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    priority: "medium",
    status: "todo",
    due_date: "",
    estimated_hours: "",
  });

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  async function updateTaskStatus(taskId: string, newStatus: string) {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === "done") updates.completed_at = new Date().toISOString();
      else updates.completed_at = null;

      const { error } = await supabase.from("project_tasks").update(updates).eq("id", taskId);
      if (error) throw error;

      setLocalTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus, completed_at: newStatus === "done" ? new Date().toISOString() : null } : t));
      toast.success(`Task moved to ${columnConfig.find((c) => c.id === newStatus)?.label}`);
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update task: " + error.message);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("project_tasks").insert({
        project_id: projectId,
        name: newTask.name,
        description: newTask.description || null,
        priority: newTask.priority,
        status: newTask.status,
        due_date: newTask.due_date || null,
        estimated_hours: parseInt(newTask.estimated_hours) || null,
      });
      if (error) throw error;
      toast.success("Task created");
      setDialogOpen(false);
      setNewTask({ name: "", description: "", priority: "medium", status: "todo", due_date: "", estimated_hours: "" });
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to create task: " + error.message);
    }
  }

  async function updateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const { error } = await supabase.from("project_tasks").update({
        name: editingTask.name,
        description: editingTask.description || null,
        priority: editingTask.priority,
        due_date: editingTask.due_date || null,
        estimated_hours: editingTask.estimated_hours,
      }).eq("id", editingTask.id);
      if (error) throw error;
      toast.success("Task updated");
      setEditingTask(null);
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update task: " + error.message);
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase.from("project_tasks").delete().eq("id", id);
      if (error) throw error;
      toast.success("Task deleted");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to delete task: " + error.message);
    }
  }

  const handleDragStart = (task: ProjectTask) => setDraggedTask(task);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status);
      setDraggedTask(null);
    }
  };

  const projectTasks = localTasks.filter((t) => t.project_id === projectId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {columnConfig.map((col) => {
            const count = projectTasks.filter((t) => t.status === col.id).length;
            return (
              <div key={col.id} className="flex items-center gap-1.5 text-sm">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-white/60">{col.label}</span>
                <Badge variant="secondary" className="bg-white/10 text-white/50 text-xs">{count}</Badge>
              </div>
            );
          })}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />Add Task
          </Button>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <form onSubmit={createTask} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Task Name</Label>
                <Input required value={newTask.name} onChange={(e) => setNewTask((p) => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Design homepage mockups" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Input value={newTask.description} onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask((p) => ({ ...p, priority: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Due Date</Label>
                  <Input type="date" value={newTask.due_date} onChange={(e) => setNewTask((p) => ({ ...p, due_date: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Estimated Hours</Label>
                <Input type="number" value={newTask.estimated_hours} onChange={(e) => setNewTask((p) => ({ ...p, estimated_hours: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columnConfig.map((col) => {
          const colTasks = projectTasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="bg-[#0b0d10] rounded-lg border border-white/5 p-3 min-h-[300px]" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-sm font-medium text-white">{col.label}</span>
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white/50 text-xs">{colTasks.length}</Badge>
              </div>
              <div className="space-y-2">
                {colTasks.length === 0 && <div className="text-center py-8 text-xs text-white/20 border border-dashed border-white/10 rounded-md">Drop tasks here</div>}
                {colTasks.map((task) => (
                  <Card key={task.id} draggable onDragStart={() => handleDragStart(task)} className="bg-[#18191b] border-white/10 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-white flex-1 min-w-0">{task.name}</p>
                        <div className="flex items-center gap-1 ml-2">
                          <button onClick={() => setEditingTask(task)} className="text-white/30 hover:text-white p-1"><Pencil className="w-3 h-3" /></button>
                          <button onClick={() => deleteTask(task.id)} className="text-white/30 hover:text-[#be6464] p-1"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      {task.description && <p className="text-xs text-white/40 mb-2 line-clamp-2">{task.description}</p>}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority] || priorityColors.medium}`}>{task.priority}</Badge>
                        {task.estimated_hours && <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" />{task.estimated_hours}h</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/30">
                        {task.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString()}</span>}
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assignee_id ? "Assigned" : "Unassigned"}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="bg-[#18191b] border-white/10 text-white">
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          {editingTask && (
            <form onSubmit={updateTask} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Task Name</Label>
                <Input required value={editingTask.name} onChange={(e) => setEditingTask((p) => (p ? { ...p, name: e.target.value } : null))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Input value={editingTask.description || ""} onChange={(e) => setEditingTask((p) => (p ? { ...p, description: e.target.value } : null))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Priority</Label>
                  <Select value={editingTask.priority} onValueChange={(v) => setEditingTask((p) => (p ? { ...p, priority: v } : null))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Due Date</Label>
                  <Input type="date" value={editingTask.due_date || ""} onChange={(e) => setEditingTask((p) => (p ? { ...p, due_date: e.target.value } : null))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Estimated Hours</Label>
                <Input type="number" value={editingTask.estimated_hours || ""} onChange={(e) => setEditingTask((p) => (p ? { ...p, estimated_hours: parseInt(e.target.value) || null } : null))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}