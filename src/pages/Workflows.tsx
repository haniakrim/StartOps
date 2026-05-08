import { useState, useEffect } from "react";
import {
  Zap, Plus, Play, Pause, Trash2, Edit3, Clock, Mail, Bell,
  GitBranch, UserPlus, AlertTriangle, CheckCircle2, Loader2,
  ChevronDown, ChevronRight, Copy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";
import { useOrganization } from "@/hooks/useOrganization";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: any;
  actions: any[];
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
}

const triggerTypes = [
  { id: "deal_stage_changed", label: "Deal Stage Changed", icon: GitBranch },
  { id: "contact_created", label: "Contact Created", icon: UserPlus },
  { id: "deal_value_threshold", label: "Deal Value Threshold", icon: Zap },
  { id: "task_overdue", label: "Task Overdue", icon: Clock },
  { id: "email_received", label: "Email Received", icon: Mail },
];

const actionTypes = [
  { id: "send_email", label: "Send Email", icon: Mail },
  { id: "send_notification", label: "Send Notification", icon: Bell },
  { id: "create_task", label: "Create Task", icon: CheckCircle2 },
  { id: "update_deal", label: "Update Deal", icon: Edit3 },
  { id: "assign_owner", label: "Assign Owner", icon: UserPlus },
  { id: "webhook", label: "Webhook", icon: Zap },
];

export default function Workflows() {
  const { organizationId } = useOrganization();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    trigger_type: string;
    trigger_config: Record<string, any>;
    actions: { type: string; config: Record<string, any> }[];
  }>({
    name: "",
    description: "",
    trigger_type: "deal_stage_changed",
    trigger_config: { stage: "lead" },
    actions: [{ type: "send_notification", config: { message: "" } }],
  });

  useEffect(() => { fetchWorkflows(); }, []);
  useRealtimeTable("workflows", fetchWorkflows);

  async function fetchWorkflows() {
    try {
      setLoading(true);
      let query = supabase.from("workflows").select("*").order("created_at", { ascending: false });
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setWorkflows(data || []);
    } catch (error: any) {
      toast.error("Failed to load workflows: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveWorkflow(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        trigger_type: form.trigger_type,
        trigger_config: form.trigger_config,
        actions: form.actions,
        is_active: true,
      };
      if (organizationId) payload.organization_id = organizationId;

      if (editingWorkflow) {
        const { error } = await supabase.from("workflows").update(payload).eq("id", editingWorkflow.id);
        if (error) throw error;
        toast.success("Workflow updated");
      } else {
        const { error } = await supabase.from("workflows").insert(payload);
        if (error) throw error;
        toast.success("Workflow created");
      }

      setDialogOpen(false);
      setEditingWorkflow(null);
      resetForm();
      fetchWorkflows();
    } catch (error: any) {
      toast.error("Failed to save workflow: " + error.message);
    }
  }

  async function toggleWorkflow(id: string, current: boolean) {
    try {
      const { error } = await supabase.from("workflows").update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_active: !current } : w));
      toast.success(!current ? "Workflow activated" : "Workflow paused");
    } catch (error: any) {
      toast.error("Failed to update workflow: " + error.message);
    }
  }

  async function deleteWorkflow(id: string) {
    try {
      const { error } = await supabase.from("workflows").delete().eq("id", id);
      if (error) throw error;
      toast.success("Workflow deleted");
      fetchWorkflows();
    } catch (error: any) {
      toast.error("Failed to delete workflow: " + error.message);
    }
  }

  async function duplicateWorkflow(workflow: Workflow) {
    try {
      const { error } = await supabase.from("workflows").insert({
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        trigger_type: workflow.trigger_type,
        trigger_config: workflow.trigger_config,
        actions: workflow.actions,
        is_active: false,
      });
      if (error) throw error;
      toast.success("Workflow duplicated");
      fetchWorkflows();
    } catch (error: any) {
      toast.error("Failed to duplicate workflow: " + error.message);
    }
  }

  function editWorkflow(workflow: Workflow) {
    setEditingWorkflow(workflow);
    setForm({
      name: workflow.name,
      description: workflow.description || "",
      trigger_type: workflow.trigger_type,
      trigger_config: workflow.trigger_config || {},
      actions: workflow.actions || [{ type: "send_notification", config: { message: "" } }],
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      trigger_type: "deal_stage_changed",
      trigger_config: { stage: "lead" },
      actions: [{ type: "send_notification", config: { message: "" } }],
    });
  }

  function addAction() {
    setForm(prev => ({
      ...prev,
      actions: [...prev.actions, { type: "send_notification", config: { message: "" } }],
    }));
  }

  function removeAction(index: number) {
    setForm(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  }

  function updateAction(index: number, updates: any) {
    setForm(prev => ({
      ...prev,
      actions: prev.actions.map((a, i) => i === index ? { ...a, ...updates } : a),
    }));
  }

  const getTriggerLabel = (type: string) => triggerTypes.find(t => t.id === type)?.label || type;
  const getActionLabel = (type: string) => actionTypes.find(a => a.id === type)?.label || type;

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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">Automate repetitive tasks and business processes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setEditingWorkflow(null); resetForm(); }
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWorkflow ? "Edit Workflow" : "Create Workflow"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveWorkflow} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., High-Value Deal Alert" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What does this workflow do?" />
              </div>

              <div className="space-y-3">
                <Label>Trigger</Label>
                <Select value={form.trigger_type} onValueChange={(v) => setForm(p => ({ ...p, trigger_type: v, trigger_config: {} }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <t.icon className="w-4 h-4" />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {form.trigger_type === "deal_stage_changed" && (
                  <Select value={form.trigger_config?.stage || "lead"} onValueChange={(v) => setForm(p => ({ ...p, trigger_config: { ...p.trigger_config, stage: v } }))}>
                    <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed-won">Closed Won</SelectItem>
                      <SelectItem value="closed-lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {form.trigger_type === "deal_value_threshold" && (
                  <Input type="number" value={form.trigger_config?.threshold || ""} onChange={(e) => setForm(p => ({ ...p, trigger_config: { ...p.trigger_config, threshold: parseFloat(e.target.value) } }))} placeholder="Minimum deal value ($)" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Actions</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addAction} className="text-primary hover:text-primary hover:bg-primary/10">
                    <Plus className="w-4 h-4 mr-1" />Add Action
                  </Button>
                </div>
                {form.actions.map((action, i) => (
                  <Card key={i} className="bg-muted border-border/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Select value={action.type} onValueChange={(v) => updateAction(i, { type: v, config: {} })}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map(a => (
                              <SelectItem key={a.id} value={a.id}>
                                <div className="flex items-center gap-2">
                                  <a.icon className="w-4 h-4" />
                                  {a.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAction(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {action.type === "send_notification" && (
                        <Input value={action.config?.message || ""} onChange={(e) => updateAction(i, { config: { ...action.config, message: e.target.value } })} placeholder="Notification message..." />
                      )}

                      {action.type === "send_email" && (
                        <div className="space-y-2">
                          <Input value={action.config?.subject || ""} onChange={(e) => updateAction(i, { config: { ...action.config, subject: e.target.value } })} placeholder="Email subject" />
                          <Input value={action.config?.body || ""} onChange={(e) => updateAction(i, { config: { ...action.config, body: e.target.value } })} placeholder="Email body" />
                        </div>
                      )}

                      {action.type === "create_task" && (
                        <div className="space-y-2">
                          <Input value={action.config?.subject || ""} onChange={(e) => updateAction(i, { config: { ...action.config, subject: e.target.value } })} placeholder="Task subject" />
                          <Select value={action.config?.priority || "medium"} onValueChange={(v) => updateAction(i, { config: { ...action.config, priority: v } })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {action.type === "webhook" && (
                        <Input value={action.config?.url || ""} onChange={(e) => updateAction(i, { config: { ...action.config, url: e.target.value } })} placeholder="Webhook URL" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button type="submit" className="w-full">
                {editingWorkflow ? "Update Workflow" : "Create Workflow"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {workflows.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No workflows yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Create your first automation to save time</p>
            </CardContent>
          </Card>
        )}

        {workflows.map((workflow) => {
          const TriggerIcon = triggerTypes.find(t => t.id === workflow.trigger_type)?.icon || Zap;
          const isExpanded = expandedWorkflow === workflow.id;

          return (
            <Card key={workflow.id} className="hover:border-border/80 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground">{workflow.name}</h3>
                      <Badge variant="secondary" className={`text-xs ${workflow.is_active ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {workflow.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{workflow.description || "No description"}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/50">
                      <span className="flex items-center gap-1"><TriggerIcon className="w-3 h-3" />{getTriggerLabel(workflow.trigger_type)}</span>
                      <span>·</span>
                      <span>{(workflow.actions || []).length} action{(workflow.actions || []).length !== 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" />{workflow.run_count || 0} runs</span>
                      {workflow.last_run_at && (
                        <>
                          <span>·</span>
                          <span>Last run {new Date(workflow.last_run_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={workflow.is_active} onCheckedChange={() => toggleWorkflow(workflow.id, workflow.is_active)} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => editWorkflow(workflow)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => duplicateWorkflow(workflow)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteWorkflow(workflow.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <button onClick={() => setExpandedWorkflow(isExpanded ? null : workflow.id)} className="text-muted-foreground hover:text-foreground">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pl-14 space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Actions</div>
                    {(workflow.actions || []).map((action: any, i: number) => {
                      const ActionIcon = actionTypes.find(a => a.id === action.type)?.icon || Zap;
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border/50">
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                            <ActionIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-foreground">{getActionLabel(action.type)}</p>
                            {action.config?.message && <p className="text-xs text-muted-foreground">{action.config.message}</p>}
                            {action.config?.subject && <p className="text-xs text-muted-foreground">{action.config.subject}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
