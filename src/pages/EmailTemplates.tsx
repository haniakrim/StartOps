import { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Search,
  Loader2,
  BookOpen,
  Trash2,
  Pencil,
  Eye,
  Copy,
  LayoutTemplate,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailTemplateForm } from "@/components/email-templates/EmailTemplateForm";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "startops_email_templates";

const categoryColors: Record<string, string> = {
  Sales: "bg-[#8dc572]/20 text-[#8dc572]",
  Support: "bg-[#5683da]/20 text-[#5683da]",
  Marketing: "bg-[#ff8964]/20 text-[#ff8964]",
  Onboarding: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  General: "bg-white/10 text-white/50",
};

function loadTemplates(): EmailTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultTemplates();
    return JSON.parse(raw);
  } catch {
    return getDefaultTemplates();
  }
}

function saveTemplates(templates: EmailTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function getDefaultTemplates(): EmailTemplate[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Initial Outreach",
      category: "Sales",
      subject: "Following up on your interest",
      body: "Hi {{first_name}},\n\nI hope this email finds you well. I wanted to follow up on your recent interest in our solutions.\n\nWould you be available for a quick call next week?\n\nBest regards,\nYour Name",
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: "Demo Follow-up",
      category: "Sales",
      subject: "Thanks for attending the demo",
      body: "Hi {{first_name}},\n\nThank you for taking the time to attend our demo today. It was great learning more about {{company}}'s needs.\n\nAs discussed, I've attached the proposal for your review.\n\nLet me know if you have any questions!\n\nBest,\nYour Name",
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: "Welcome Email",
      category: "Onboarding",
      subject: "Welcome to the team!",
      body: "Hi {{first_name}},\n\nWelcome aboard! We're excited to have {{company}} as a partner.\n\nYour account manager will reach out shortly to kick off the onboarding process.\n\nCheers,\nThe Team",
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null,
  );
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null,
  );

  useEffect(() => {
    const saved = loadTemplates();
    setTemplates(saved);
    setLoading(false);
  }, []);

  function createTemplate(data: {
    name: string;
    category: string;
    subject: string;
    body: string;
  }) {
    const newTemplate: EmailTemplate = {
      id: crypto.randomUUID(),
      ...data,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
    toast.success("Template created");
    setDialogOpen(false);
  }

  function updateTemplate(data: {
    name: string;
    category: string;
    subject: string;
    body: string;
  }) {
    if (!editingTemplate) return;
    const updated = templates.map((t) =>
      t.id === editingTemplate.id
        ? { ...t, ...data, updatedAt: new Date().toISOString() }
        : t,
    );
    setTemplates(updated);
    saveTemplates(updated);
    toast.success("Template updated");
    setDialogOpen(false);
    setEditingTemplate(null);
  }

  function deleteTemplate(id: string) {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    toast.success("Template deleted");
  }

  function duplicateTemplate(template: EmailTemplate) {
    const duplicated: EmailTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
    toast.success("Template duplicated");
  }

  function openEdit(template: EmailTemplate) {
    setEditingTemplate(template);
    setDialogOpen(true);
  }

  function openCreate() {
    setEditingTemplate(null);
    setDialogOpen(true);
  }

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  const categories = [...new Set(templates.map((t) => t.category))];

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Email Templates
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Reusable email templates for consistent outreach
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <LayoutTemplate className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">
              {templates.length}
            </p>
            <p className="text-sm text-white/50">Total Templates</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Mail className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">
              {templates.reduce((s, t) => s + t.usageCount, 0)}
            </p>
            <p className="text-sm text-white/50">Times Used</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <BookOpen className="w-5 h-5 text-[#ff8964] mb-3" />
            <p className="text-2xl font-semibold text-white">
              {categories.length}
            </p>
            <p className="text-sm text-white/50">Categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <Card
            key={template.id}
            className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge
                  variant="secondary"
                  className={`text-xs ${categoryColors[template.category] || categoryColors.General}`}
                >
                  {template.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/40 hover:text-white"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/40 hover:text-white"
                    onClick={() => openEdit(template)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/40 hover:text-white"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/40 hover:text-[#be6464]"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <h3 className="text-base font-semibold text-white mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-white/50 mb-3 truncate">
                {template.subject}
              </p>

              <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                <p className="text-xs text-white/40 line-clamp-3 whitespace-pre-wrap">
                  {template.body}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-white/30">
                <span>Used {template.usageCount} times</span>
                <span>
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-white/40">
            {search
              ? "No templates match your search"
              : "No templates yet. Create your first one!"}
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTemplate(null);
        }}
      >
        <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <EmailTemplateForm
            template={editingTemplate}
            onSubmit={editingTemplate ? updateTemplate : createTemplate}
            onCancel={() => {
              setDialogOpen(false);
              setEditingTemplate(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!previewTemplate}
        onOpenChange={() => setPreviewTemplate(null)}
      >
        <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#6452db]" />
              Preview: {previewTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                Subject
              </p>
              <p className="text-sm text-white">{previewTemplate?.subject}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                Body
              </p>
              <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                <p className="text-sm text-white/80 whitespace-pre-wrap">
                  {previewTemplate?.body}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`text-xs ${categoryColors[previewTemplate?.category || "General"]}`}
              >
                {previewTemplate?.category}
              </Badge>
              <span className="text-xs text-white/30">
                Used {previewTemplate?.usageCount || 0} times
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}