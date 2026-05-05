import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Zap, Play, Pause, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  is_active: boolean;
  run_count: number;
  last_run_at: string;
  created_at: string;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    trigger_type: "deal_created",
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase.from("workflows").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("workflows").insert([
        {
          name: newWorkflow.name,
          description: newWorkflow.description,
          trigger_type: newWorkflow.trigger_type,
          organization_id: (await supabase.from("organizations").select("id").limit(1)).data?.[0]?.id,
        },
      ]);

      if (error) throw error;

      toast({ title: "Workflow created successfully" });
      setShowAddDialog(false);
      setNewWorkflow({ name: "", description: "", trigger_type: "deal_created" });
      fetchWorkflows();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleWorkflow = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("workflows").update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      fetchWorkflows();
      toast({ title: `Workflow ${current ? "paused" : "activated"}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const triggerTypes = [
    { value: "deal_created", label: "Deal Created" },
    { value: "deal_updated", label: "Deal Updated" },
    { value: "contact_created", label: "Contact Created" },
    { value: "stage_changed", label: "Stage Changed" },
    { value: "scheduled", label: "Scheduled" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Workflows</h1>
          <p className="text-white/60 mt-1">Automate your sales processes</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#6452db] hover:bg-[#5645c7] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-[#303236] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Workflow</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddWorkflow} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  className="bg-[#0b0d10] border-[#303236] text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  className="bg-[#0b0d10] border-[#303236] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select
                  value={newWorkflow.trigger_type}
                  onValueChange={(v) => setNewWorkflow({ ...newWorkflow, trigger_type: v })}
                >
                  <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18191b] border-[#303236]">
                    {triggerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white">
                Create Workflow
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="bg-[#18191b] border-[#303236]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    workflow.is_active ? "bg-[#8dc572]/20" : "bg-[#f0ad4e]/20"
                  }`}>
                    <Zap className={`w-5 h-5 ${workflow.is_active ? "text-[#8dc572]" : "text-[#f0ad4e]"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-medium">{workflow.name}</h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          workflow.is_active
                            ? "border-[#8dc572]/40 text-[#8dc572]"
                            : "border-[#f0ad4e]/40 text-[#f0ad4e]"
                        }`}
                      >
                        {workflow.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/60 mt-1">{workflow.description || "No description"}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-white/45">
                        <CheckCircle2 className="w-3 h-3" />
                        {workflow.run_count} runs
                      </div>
                      {workflow.last_run_at && (
                        <div className="flex items-center gap-1.5 text-xs text-white/45">
                          <Clock className="w-3 h-3" />
                          Last run {new Date(workflow.last_run_at).toLocaleDateString()}
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs border-[#303236] text-white/60">
                        {triggerTypes.find((t) => t.value === workflow.trigger_type)?.label || workflow.trigger_type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={workflow.is_active}
                    onCheckedChange={() => toggleWorkflow(workflow.id, workflow.is_active)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/45 hover:text-[#eb5757] hover:bg-[#eb5757]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {workflows.length === 0 && !loading && (
          <Card className="bg-[#18191b] border-[#303236]">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#6452db]/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-[#6452db]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No workflows yet</h3>
              <p className="text-sm text-white/60 mb-4">Create automated workflows to streamline your sales process</p>
              <Button
                className="bg-[#6452db] hover:bg-[#5645c7] text-white"
                onClick={() => setShowAddDialog(true)}
              >
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
