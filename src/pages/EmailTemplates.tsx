import { useState, useEffect } from "react";
import { Mail, Plus, Search, Loader2, BookOpen, Trash2, Pencil, Eye, Copy, LayoutTemplate, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailTemplateForm } from "@/components/email-templates/EmailTemplateForm";
import { AIEmailComposer } from "@/components/email-templates/AIEmailComposer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";
import { useOrganization } from "@/hooks/useOrganization";

interface EmailTemplate {
  id: string; name: string; category: string; subject: string; body: string;
  usage_count: number; created_at: string; updated_at: string;
}

const categoryColors: Record<string, string> = {
  Sales: "bg-hp-green/20 text-hp-green",
  Support: "bg-hp-blue-light/20 text-hp-blue-light",
  Marketing: "bg-hp-orange/20 text-hp-orange",
  Onboarding: "bg-hp-red/20 text-hp-red",
  General: "bg-muted text-muted-foreground",
};

export default function EmailTemplates() {
  const { organizationId } = useOrganization();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [aiComposerOpen, setAiComposerOpen] = useState(false);

  useEffect(() => { fetchTemplates(); }, [organizationId]);
  useRealtimeTable("email_templates", fetchTemplates, [], organizationId);

  async function fetchTemplates() {
    if (!organizationId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from("email_templates").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) { await seedDefaults(); const { data: s } = await supabase.from("email_templates").select("*").eq("organization_id", organizationId); setTemplates(s || []); }
      else setTemplates(data);
    } catch (error: any) { toast.error("Failed to load templates: " + error.message); } finally { setLoading(false); }
  }

  async function seedDefaults() {
    if (!organizationId) return;
    const defaults = [
      { name: "Initial Outreach", category: "Sales", subject: "Following up on your interest", body: "Hi {{first_name}},\n\nI hope this email finds you well.\n\nBest regards,\nYour Name", organization_id: organizationId },
      { name: "Welcome Email", category: "Onboarding", subject: "Welcome!", body: "Hi {{first_name}},\n\nWelcome aboard!\n\nCheers,\nThe Team", organization_id: organizationId },
    ];
    for (const t of defaults) await supabase.from("email_templates").insert(t);
  }

  async function createTemplate(data: { name: string; category: string; subject: string; body: string }) {
    if (!organizationId) { toast.error("No organization found"); return; }
    try { await supabase.from("email_templates").insert({ ...data, organization_id: organizationId }); toast.success("Template created"); setDialogOpen(false); fetchTemplates(); } catch (error: any) { toast.error("Failed: " + error.message); }
  }

  async function updateTemplate(data: { name: string; category: string; subject: string; body: string }) {
    if (!editingTemplate) return;
    try { await supabase.from("email_templates").update(data).eq("id", editingTemplate.id); toast.success("Template updated"); setDialogOpen(false); setEditingTemplate(null); fetchTemplates(); } catch (error: any) { toast.error("Failed: " + error.message); }
  }

  async function deleteTemplate(id: string) {
    try { await supabase.from("email_templates").delete().eq("id", id); toast.success("Template deleted"); fetchTemplates(); } catch (error: any) { toast.error("Failed: " + error.message); }
  }

  async function duplicateTemplate(template: EmailTemplate) {
    if (!organizationId) return;
    try { await supabase.from("email_templates").insert({ name: `${template.name} (Copy)`, category: template.category, subject: template.subject, body: template.body, organization_id: organizationId }); toast.success("Template duplicated"); fetchTemplates(); } catch (error: any) { toast.error("Failed: " + error.message); }
  }

  function openEdit(template: EmailTemplate) { setEditingTemplate(template); setDialogOpen(true); }
  function openCreate() { setEditingTemplate(null); setDialogOpen(true); }

  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(templates.map(t => t.category))];

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Reusable email templates for consistent outreach</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-border hover:border-primary/50" onClick={() => setAiComposerOpen(true)}>
            <Sparkles className="w-4 h-4 mr-2 text-primary" />AI Compose
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5">
          <LayoutTemplate className="w-5 h-5 text-primary mb-3" />
          <p className="text-2xl font-semibold text-foreground">{templates.length}</p>
          <p className="text-sm text-muted-foreground">Total Templates</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <Mail className="w-5 h-5 text-hp-green mb-3" />
          <p className="text-2xl font-semibold text-foreground">{templates.reduce((s, t) => s + (t.usage_count || 0), 0)}</p>
          <p className="text-sm text-muted-foreground">Times Used</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <BookOpen className="w-5 h-5 text-hp-orange mb-3" />
          <p className="text-2xl font-semibold text-foreground">{categories.length}</p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-input border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <Card key={template.id} className="border-border hover:border-border/80 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="secondary" className={`text-xs ${categoryColors[template.category] || categoryColors.General}`}>{template.category}</Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setPreviewTemplate(template)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(template)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => duplicateTemplate(template)}><Copy className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-hp-red" onClick={() => deleteTemplate(template.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 truncate">{template.subject}</p>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{template.body}</p>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>Used {template.usage_count || 0} times</span>
                <span>Updated {new Date(template.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (<div className="col-span-full text-center py-12 text-sm text-muted-foreground">{search ? "No templates match your search" : "No templates yet. Create your first one!"}</div>)}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTemplate(null); }}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle></DialogHeader>
          <EmailTemplateForm template={editingTemplate} onSubmit={editingTemplate ? updateTemplate : createTemplate} onCancel={() => { setDialogOpen(false); setEditingTemplate(null); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-primary" />Preview: {previewTemplate?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Subject</p><p className="text-sm text-foreground">{previewTemplate?.subject}</p></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Body</p><div className="p-4 rounded-lg bg-muted border border-border"><p className="text-sm text-foreground whitespace-pre-wrap">{previewTemplate?.body}</p></div></div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-xs ${categoryColors[previewTemplate?.category || "General"]}`}>{previewTemplate?.category}</Badge>
              <span className="text-xs text-muted-foreground">Used {previewTemplate?.usage_count || 0} times</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AIEmailComposer
        open={aiComposerOpen}
        onOpenChange={setAiComposerOpen}
        onSaveAsTemplate={(subject, body) => {
          setEditingTemplate({
            id: "",
            name: "",
            category: "General",
            subject,
            body,
            usage_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setDialogOpen(true);
        }}
      />
    </div>
  );
}
