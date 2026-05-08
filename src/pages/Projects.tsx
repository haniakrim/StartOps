import { useState, useEffect } from "react";
import { FolderKanban, Plus, Loader2, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectBoard } from "@/components/projects/ProjectBoard";
import { useOrganization } from "@/hooks/useOrganization";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Project { id: string; name: string; description: string; status: string; priority: string; progress: number; budget: number; actual_cost: number; start_date: string; end_date: string; }

const statusColors: Record<string, string> = { planning: "bg-primary/20 text-primary", active: "bg-hp-green/20 text-hp-green", on_hold: "bg-hp-orange/20 text-hp-orange", completed: "bg-muted text-muted-foreground", cancelled: "bg-hp-red/20 text-hp-red" };
const priorityColors: Record<string, string> = { low: "bg-hp-green/20 text-hp-green", medium: "bg-hp-orange/20 text-hp-orange", high: "bg-hp-red/20 text-hp-red", urgent: "bg-destructive/20 text-destructive" };

export default function Projects() {
  const { organizationId } = useOrganization();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: "", description: "", budget: "", priority: "medium", start_date: "", end_date: "" });

  useEffect(() => { fetchProjects(); }, [organizationId]);
  useRealtimeTable("projects", fetchProjects);

  async function fetchProjects() {
    try { setLoading(true); let query = supabase.from("projects").select("*").order("created_at", { ascending: false }); if (organizationId) query = query.eq("organization_id", organizationId); const { data, error } = await query; if (error) throw error; setProjects(data || []); } catch (error: any) { toast.error("Failed: " + error.message); } finally { setLoading(false); }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) { toast.error("No organization"); return; }
    try { await supabase.from("projects").insert({ name: newProject.name, description: newProject.description || null, budget: parseFloat(newProject.budget) || 0, priority: newProject.priority, start_date: newProject.start_date || null, end_date: newProject.end_date || null, status: "planning", organization_id: organizationId }); toast.success("Created"); setDialogOpen(false); fetchProjects(); } catch (error: any) { toast.error("Failed: " + error.message); }
  }

  function handleProjectUpdate() {
    fetchProjects();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground tracking-tight">Projects</h1><p className="text-sm text-muted-foreground mt-1">Manage projects and deliverables</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />New Project</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <form onSubmit={createProject} className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Name</Label><Input required value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Budget</Label><Input type="number" value={newProject.budget} onChange={e => setNewProject(p => ({ ...p, budget: e.target.value }))} /></div>
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
        <TabsContent value="grid"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{projects.map(p => (
          <Card key={p.id} className="cursor-pointer" onClick={() => setSelectedProjectId(p.id)}><CardContent className="p-5">
            <div className="flex items-start justify-between"><div><h3 className="text-sm font-medium text-foreground">{p.name}</h3></div><Badge variant="secondary" className={`text-xs ${statusColors[p.status]}`}>{p.status}</Badge></div>
            <div className="mt-4"><div className="flex items-center justify-between mb-1"><span className="text-xs text-muted-foreground">Progress</span><span className="text-xs text-muted-foreground">{p.progress || 0}%</span></div><Progress value={p.progress || 0} /></div>
          </CardContent></Card>
        ))}</div></TabsContent>
        <TabsContent value="board">{selectedProjectId && <ProjectBoard projectId={selectedProjectId} tasks={[]} onUpdate={handleProjectUpdate} />}</TabsContent>
      </Tabs>
    </div>
  );
}
