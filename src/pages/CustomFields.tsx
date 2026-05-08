import { useState, useEffect } from "react";
import {
  Settings, Plus, Trash2, GripVertical, Type, Hash, ToggleLeft,
  List, Calendar, CheckSquare, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomField {
  id: string;
  entity_type: string;
  name: string;
  label: string;
  field_type: string;
  options: any[];
  is_required: boolean;
  default_value: string | null;
  order_index: number;
  is_active: boolean;
}

const fieldTypeIcons: Record<string, React.ElementType> = {
  text: Type,
  number: Hash,
  boolean: ToggleLeft,
  select: List,
  date: Calendar,
  multiselect: CheckSquare,
};

const fieldTypeLabels: Record<string, string> = {
  text: "Text",
  number: "Number",
  boolean: "Yes/No",
  select: "Dropdown",
  date: "Date",
  multiselect: "Multi-select",
};

const entityTypes = [
  { id: "contacts", label: "Contacts" },
  { id: "deals", label: "Deals" },
  { id: "companies", label: "Companies" },
  { id: "projects", label: "Projects" },
];

export default function CustomFields() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState("contacts");

  const [form, setForm] = useState({
    entity_type: "contacts",
    name: "",
    label: "",
    field_type: "text",
    options: "",
    is_required: false,
    default_value: "",
  });

  useEffect(() => { fetchFields(); }, []);

  async function fetchFields() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      setFields(data || []);
    } catch (error: any) {
      toast.error("Failed to load custom fields: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createField(e: React.FormEvent) {
    e.preventDefault();
    try {
      const options = form.options ? form.options.split(",").map(s => s.trim()).filter(Boolean) : [];
      const { error } = await supabase.from("custom_fields").insert({
        entity_type: form.entity_type,
        name: form.name.toLowerCase().replace(/\s+/g, "_"),
        label: form.label,
        field_type: form.field_type,
        options: options.length > 0 ? options : null,
        is_required: form.is_required,
        default_value: form.default_value || null,
        order_index: fields.filter(f => f.entity_type === form.entity_type).length,
      });
      if (error) throw error;
      toast.success("Custom field created");
      setDialogOpen(false);
      resetForm();
      fetchFields();
    } catch (error: any) {
      toast.error("Failed to create field: " + error.message);
    }
  }

  async function deleteField(id: string) {
    try {
      const { error } = await supabase.from("custom_fields").delete().eq("id", id);
      if (error) throw error;
      toast.success("Field deleted");
      fetchFields();
    } catch (error: any) {
      toast.error("Failed to delete field: " + error.message);
    }
  }

  async function toggleField(id: string, current: boolean) {
    try {
      const { error } = await supabase.from("custom_fields").update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      setFields(prev => prev.map(f => f.id === id ? { ...f, is_active: !current } : f));
    } catch (error: any) {
      toast.error("Failed to update field: " + error.message);
    }
  }

  function resetForm() {
    setForm({
      entity_type: selectedEntity,
      name: "",
      label: "",
      field_type: "text",
      options: "",
      is_required: false,
      default_value: "",
    });
  }

  const filteredFields = fields.filter(f => f.entity_type === selectedEntity);

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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Custom Fields</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure custom data fields for your records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />Add Field
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader><DialogTitle>Add Custom Field</DialogTitle></DialogHeader>
            <form onSubmit={createField} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Applies To</Label>
                <Select value={form.entity_type} onValueChange={(v) => setForm(p => ({ ...p, entity_type: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    {entityTypes.map(e => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Field Label</Label>
                <Input required value={form.label} onChange={(e) => setForm(p => ({ ...p, label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, "_") }))} className="bg-input border-border text-foreground" placeholder="e.g., Customer Lifetime Value" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Field Type</Label>
                <Select value={form.field_type} onValueChange={(v) => setForm(p => ({ ...p, field_type: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Yes/No</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="multiselect">Multi-select</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(form.field_type === "select" || form.field_type === "multiselect") && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Options (comma-separated)</Label>
                  <Input value={form.options} onChange={(e) => setForm(p => ({ ...p, options: e.target.value }))} className="bg-input border-border text-foreground" placeholder="Option 1, Option 2, Option 3" />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Default Value (optional)</Label>
                <Input value={form.default_value} onChange={(e) => setForm(p => ({ ...p, default_value: e.target.value }))} className="bg-input border-border text-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_required} onCheckedChange={(v) => setForm(p => ({ ...p, is_required: v }))} />
                <Label className="text-muted-foreground">Required field</Label>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create Field</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        {entityTypes.map(entity => (
          <button
            key={entity.id}
            onClick={() => setSelectedEntity(entity.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedEntity === entity.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {entity.label}
          </button>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filteredFields.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No custom fields for {entityTypes.find(e => e.id === selectedEntity)?.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add your first custom field above</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredFields.map((field) => {
                const Icon = fieldTypeIcons[field.field_type] || Type;
                return (
                  <div key={field.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
                    <GripVertical className="w-4 h-4 text-muted-foreground/20 cursor-grab" />
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{field.label}</p>
                        {field.is_required && <Badge variant="secondary" className="bg-hp-red/20 text-hp-red text-xs">Required</Badge>}
                        {!field.is_active && <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fieldTypeLabels[field.field_type]} · {field.name}
                        {field.options && ` · ${(field.options as string[]).length} options`}
                      </p>
                    </div>
                    <Switch checked={field.is_active} onCheckedChange={() => toggleField(field.id, field.is_active)} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-hp-red" onClick={() => deleteField(field.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
