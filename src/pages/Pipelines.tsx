import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, GripVertical, Trash2, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pipeline {
  id: string;
  name: string;
  description: string;
  stages: any[];
  created_at: string;
}

export default function Pipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [newPipeline, setNewPipeline] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const { data, error } = await supabase.from("pipelines").select("*");
      if (error) throw error;
      setPipelines(data || []);
    } catch (error) {
      console.error("Error fetching pipelines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("pipelines").insert([
        {
          name: newPipeline.name,
          description: newPipeline.description,
          organization_id: (await supabase.from("organizations").select("id").limit(1)).data?.[0]?.id,
        },
      ]);

      if (error) throw error;

      toast({ title: "Pipeline created successfully" });
      setShowAddDialog(false);
      setNewPipeline({ name: "", description: "" });
      fetchPipelines();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const defaultStages = [
    { id: "lead", name: "Lead", order: 1, color: "#6452db" },
    { id: "qualified", name: "Qualified", order: 2, color: "#5683da" },
    { id: "proposal", name: "Proposal", order: 3, color: "#ff8964" },
    { id: "negotiation", name: "Negotiation", order: 4, color: "#f0ad4e" },
    { id: "closed", name: "Closed Won", order: 5, color: "#8dc572" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Pipelines</h1>
          <p className="text-white/60 mt-1">Manage your sales stages and processes</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#6452db] hover:bg-[#5645c7] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-[#303236] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Pipeline</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPipeline} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newPipeline.name}
                  onChange={(e) => setNewPipeline({ ...newPipeline, name: e.target.value })}
                  className="bg-[#0b0d10] border-[#303236] text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newPipeline.description}
                  onChange={(e) => setNewPipeline({ ...newPipeline, description: e.target.value })}
                  className="bg-[#0b0d10] border-[#303236] text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white">
                Create Pipeline
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="bg-[#18191b] border-[#303236]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">{pipeline.name}</CardTitle>
                <p className="text-sm text-white/60 mt-1">{pipeline.description || "No description"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white/45 hover:text-white hover:bg-[#1f2126]">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white/45 hover:text-[#eb5757] hover:bg-[#eb5757]/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(pipeline.stages || defaultStages).map((stage: any) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-3 p-3 rounded-md bg-[#0b0d10] border border-[#303236]"
                  >
                    <GripVertical className="w-4 h-4 text-white/30 cursor-grab" />
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm text-white/85 flex-1">{stage.name}</span>
                    <span className="text-xs text-white/45">Stage {stage.order}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {pipelines.length === 0 && !loading && (
          <Card className="lg:col-span-2 bg-[#18191b] border-[#303236]">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#6452db]/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-[#6452db]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No pipelines yet</h3>
              <p className="text-sm text-white/60 mb-4">Create your first sales pipeline to get started</p>
              <Button
                className="bg-[#6452db] hover:bg-[#5645c7] text-white"
                onClick={() => setShowAddDialog(true)}
              >
                Create Pipeline
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
