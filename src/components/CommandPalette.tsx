import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { isAIConfigured, callAI } from "@/lib/ai";
import {
  LayoutDashboard, Users, Building2, GitBranch, FileText, Mail,
  Calendar as CalendarIcon, FolderKanban, Package, DollarSign, Clock,
  BrainCircuit, Target, BarChart3,
  Zap, Send, BookOpen, ListFilter, FolderOpen, Sparkles, Bell,
  CreditCard, Settings, Shield, Webhook, FileSearch, LifeBuoy, Cog,
  Search as SearchIcon, Wand2, ArrowRight, Bot, Loader2, UserPlus,
  PlusCircle, Navigation, X, ChevronRight
} from "lucide-react";

const RECENT_KEY = "startops_recent_commands";
const MAX_RECENT = 5;

interface CommandItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  keywords: string[];
}

const commands: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, keywords: ["home", "overview", "main"] },
  { id: "today", label: "Today", path: "/today", icon: Clock, keywords: ["daily", "agenda", "now"] },
  { id: "activities", label: "Activities", path: "/activities", icon: Clock, keywords: ["tasks", "todo", "actions"] },
  { id: "contacts", label: "Contacts", path: "/contacts", icon: Users, keywords: ["people", "leads", "customers", "persons"] },
  { id: "companies", label: "Companies", path: "/companies", icon: Building2, keywords: ["accounts", "organizations", "businesses"] },
  { id: "deals", label: "Deals", path: "/deals", icon: GitBranch, keywords: ["opportunities", "pipeline", "sales"] },
  { id: "quotes", label: "Quotes", path: "/quotes", icon: FileText, keywords: ["proposals", "estimates"] },
  { id: "communications", label: "Communications", path: "/communications", icon: Mail, keywords: ["emails", "messages", "inbox"] },
  { id: "calendar", label: "Calendar", path: "/calendar", icon: CalendarIcon, keywords: ["schedule", "events", "meetings"] },
  { id: "projects", label: "Projects", path: "/projects", icon: FolderKanban, keywords: ["initiatives", "work"] },
  { id: "inventory", label: "Inventory", path: "/inventory", icon: Package, keywords: ["stock", "products", "items"] },
  { id: "finance", label: "Finance", path: "/finance", icon: DollarSign, keywords: ["money", "revenue", "expenses", "invoices"] },
  { id: "timesheets", label: "Timesheets", path: "/timesheets", icon: Clock, keywords: ["time", "hours", "tracking"] },
  { id: "employees", label: "People", path: "/employees", icon: Users, keywords: ["staff", "team", "hr"] },
  { id: "forecasts", label: "Forecasts", path: "/forecasts", icon: BrainCircuit, keywords: ["predictions", "projections"] },
  { id: "goals", label: "Goals", path: "/goals", icon: Target, keywords: ["objectives", "targets", "okrs"] },
  { id: "analytics", label: "Analytics", path: "/analytics", icon: BarChart3, keywords: ["reports", "metrics", "data"] },
  { id: "reports", label: "Reports", path: "/reports", icon: BarChart3, keywords: ["insights", "analysis"] },
  { id: "workflows", label: "Workflows", path: "/workflows", icon: Zap, keywords: ["automation", "processes"] },
  { id: "campaigns", label: "Campaigns", path: "/campaigns", icon: Send, keywords: ["marketing", "outreach"] },
  { id: "email-templates", label: "Email Templates", path: "/email-templates", icon: BookOpen, keywords: ["templates", "emails"] },
  { id: "custom-fields", label: "Custom Fields", path: "/custom-fields", icon: ListFilter, keywords: ["fields", "attributes"] },
  { id: "documents", label: "Documents", path: "/documents", icon: FolderOpen, keywords: ["files", "docs"] },
  { id: "assistant", label: "AI Assistant", path: "/assistant", icon: Sparkles, keywords: ["ai", "chat", "help", "ask"] },
  { id: "notifications", label: "Notifications", path: "/notifications", icon: Bell, keywords: ["alerts", "updates"] },
  { id: "subscriptions", label: "Subscriptions", path: "/subscriptions", icon: CreditCard, keywords: ["billing", "plans"] },
  { id: "staff-directory", label: "Staff Directory", path: "/staff-directory", icon: Users, keywords: ["directory", "org chart"] },
  { id: "organization", label: "Organization", path: "/organization", icon: Settings, keywords: ["org", "company settings"] },
  { id: "security", label: "Security", path: "/security", icon: Shield, keywords: ["permissions", "roles", "access"] },
  { id: "api", label: "API & Webhooks", path: "/api", icon: Webhook, keywords: ["api", "integrations", "hooks"] },
  { id: "audit", label: "Audit Logs", path: "/audit", icon: FileSearch, keywords: ["logs", "history", "tracking"] },
  { id: "support", label: "Support", path: "/support", icon: LifeBuoy, keywords: ["help", "ticket"] },
  { id: "settings", label: "Settings", path: "/settings", icon: Cog, keywords: ["preferences", "config"] },
  { id: "ai-api-settings", label: "AI API Settings", path: "/ai-api-settings", icon: BrainCircuit, keywords: ["ai provider", "openai", "ollama"] },
];

interface AIResult {
  type: "navigate" | "create" | "search" | "answer" | "error";
  content: string;
  action?: {
    label: string;
    path?: string;
    handler?: () => void;
  };
}

function getRecentCommands(): CommandItem[] {
  try {
    const stored = sessionStorage.getItem(RECENT_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    const validIds = new Set(commands.map(c => c.id));
    return parsed.filter((c: { id: string }) => validIds.has(c.id)).map((c: { id: string }) => {
      const full = commands.find(cmd => cmd.id === c.id);
      return full || c;
    });
  } catch {
    return [];
  }
}

function saveRecentCommand(command: CommandItem) {
  try {
    const recent = getRecentCommands().filter((c) => c.id !== command.id);
    recent.unshift(command);
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // Ignore storage errors
  }
}

function scoreCommandMatch(command: CommandItem, query: string): number {
  const q = query.toLowerCase();
  const label = command.label.toLowerCase();

  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;

  for (const keyword of command.keywords) {
    if (keyword === q) return 50;
    if (keyword.startsWith(q)) return 40;
    if (keyword.includes(q)) return 30;
  }

  return 0;
}

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"commands" | "ai">("commands");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiHistory, setAiHistory] = useState<{ query: string; result: AIResult }[]>([]);
  const navigate = useNavigate();
  const { organizationId } = useOrganization();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, mode]);

  const handleSelect = useCallback(
    (command: CommandItem) => {
      saveRecentCommand(command);
      navigate(command.path);
      setOpen(false);
      setSearch("");
      setAiResult(null);
    },
    [navigate]
  );

  async function processAIQuery(query: string) {
    if (!isAIConfigured()) {
      setAiResult({
        type: "error",
        content: "No AI provider configured. Please add one in AI API Settings.",
        action: { label: "Open AI Settings", path: "/ai-api-settings" },
      });
      return;
    }

    if (!organizationId) {
      setAiResult({
        type: "error",
        content: "Please select an organization first.",
      });
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      // First: try local navigation matching
      const navMatch = commands.find(c =>
        c.label.toLowerCase() === query.toLowerCase() ||
        c.keywords.some(k => k.toLowerCase() === query.toLowerCase())
      );
      if (navMatch) {
        setAiResult({
          type: "navigate",
          content: `Opening ${navMatch.label}...`,
          action: {
            label: `Go to ${navMatch.label}`,
            handler: () => handleSelect(navMatch),
          },
        });
        setAiLoading(false);
        return;
      }

      // Gather CRM context
      const [deals, contacts, activities] = await Promise.all([
        supabase.from("deals").select("id, name, value, stage, status").eq("organization_id", organizationId).limit(20).then(r => r.data || []),
        supabase.from("contacts").select("id, first_name, last_name, company").eq("organization_id", organizationId).limit(20).then(r => r.data || []),
        supabase.from("activities").select("id, subject, type, status").eq("organization_id", organizationId).eq("status", "pending").limit(10).then(r => r.data || []),
      ]);

      const context = {
        deals: deals.map(d => ({ name: d.name, value: d.value, stage: d.stage })),
        contacts: contacts.map(c => `${c.first_name} ${c.last_name}${c.company ? ` (${c.company})` : ""}`),
        pendingActivities: activities.length,
      };

      const systemPrompt = `You are StartOps Command AI. The user typed a natural language query in a command palette. Analyze it and respond with a JSON object:

{
  "intent": "navigate" | "create" | "search" | "answer",
  "target": "page name or entity type",
  "summary": "A brief, helpful response (1-2 sentences). Use the CRM data provided.",
  "suggestion": "A specific next-step suggestion"
}

Available pages: ${commands.map(c => c.label).join(", ")}

CRM Data:
- Deals: ${JSON.stringify(context.deals.slice(0, 5))}
- Contacts: ${context.contacts.slice(0, 5).join(", ")}
- Pending tasks: ${context.pendingActivities}

Rules:
- For "navigate", the target should match an available page name.
- For "create", suggest what to create and where.
- For "search", describe what they'd find.
- For "answer", use the CRM data to give a data-driven answer.
- Keep summary under 120 characters.
- Respond ONLY with valid JSON.`;

      const response = await callAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ]);

      let parsed: { intent: string; target?: string; summary: string; suggestion?: string };
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: "answer", summary: response };
      } catch {
        parsed = { intent: "answer", summary: response };
      }

      // Build actionable result
      const navPage = commands.find(c => c.label.toLowerCase() === (parsed.target || "").toLowerCase());

      const result: AIResult = {
        type: parsed.intent as AIResult["type"],
        content: parsed.summary,
      };

      if (navPage && parsed.intent === "navigate") {
        result.action = {
          label: `Go to ${navPage.label}`,
          handler: () => handleSelect(navPage),
        };
      } else if (parsed.intent === "create" && parsed.target) {
        const createPath = commands.find(c => c.label.toLowerCase().includes(parsed.target!.toLowerCase()));
        if (createPath) {
          result.action = {
            label: `Open ${createPath.label}`,
            handler: () => handleSelect(createPath),
          };
        }
      } else if (parsed.intent === "answer" && parsed.suggestion) {
        result.action = {
          label: "Open AI Assistant",
          path: "/assistant",
        };
      }

      setAiResult(result);
      setAiHistory((prev) => [...prev, { query, result }]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAiResult({
        type: "error",
        content: "I couldn't process that request. " + message,
      });
    } finally {
      setAiLoading(false);
    }
  }

  function handleAISubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = search.trim();
    if (!trimmed || aiLoading) return;
    processAIQuery(trimmed);
  }

  const recentCommands = getRecentCommands();
  const filteredCommands = search
    ? commands
        .map((c) => ({ command: c, score: scoreCommandMatch(c, search) }))
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((c) => c.command)
    : commands;

  const hasExactMatch = filteredCommands.some(
    (c) => c.label.toLowerCase() === search.toLowerCase()
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSearch(""); setAiResult(null); setMode("commands"); } }}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => { setMode("commands"); setAiResult(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "commands"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Navigate
            </button>
            <button
              onClick={() => { setMode("ai"); setAiResult(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "ai"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI
            </button>
          </div>
        </DialogHeader>

        <div className="px-4 py-3">
          {mode === "commands" ? (
            <>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Type a command..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 bg-muted border-border"
                  autoFocus
                />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1 mt-2">
                {search === "" && recentCommands.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground px-2 py-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Recent
                    </p>
                    {recentCommands.map((command) => (
                      <button
                        key={command.id}
                        onClick={() => handleSelect(command)}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors"
                      >
                        <command.icon className="w-4 h-4 text-muted-foreground" />
                        {command.label}
                        <ChevronRight className="w-3 h-3 text-muted-foreground/50 ml-auto" />
                      </button>
                    ))}
                    <div className="border-t my-2" />
                  </>
                )}
                {filteredCommands.map((command) => (
                  <button
                    key={command.id}
                    onClick={() => handleSelect(command)}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors"
                  >
                    <command.icon className="w-4 h-4 text-muted-foreground" />
                    {command.label}
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50 ml-auto" />
                  </button>
                ))}
                {search && !hasExactMatch && (
                  <button
                    onClick={() => { setMode("ai"); processAIQuery(search); }}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors border border-dashed border-border mt-2"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Ask AI about "{search}"</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/50 ml-auto" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleAISubmit} className="relative">
                <Bot className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
                <Input
                  ref={inputRef}
                  placeholder="Ask anything about your business..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 bg-muted border-border pr-20"
                  autoFocus
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={aiLoading || !search.trim()}
                  className="absolute right-1 top-1 h-7 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </form>

              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto">
                {aiLoading && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                )}

                {aiResult && !aiLoading && (
                  <div className={`p-3 rounded-lg border transition-all ${
                    aiResult.type === "error"
                      ? "bg-destructive/10 border-destructive/20"
                      : aiResult.type === "navigate"
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted border-border"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        aiResult.type === "error" ? "bg-destructive/15" : "bg-primary/15"
                      }`}>
                        {aiResult.type === "error" ? (
                          <X className="w-3.5 h-3.5 text-destructive" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{aiResult.content}</p>
                        {aiResult.action && (
                          <div className="mt-2">
                            {aiResult.action.handler ? (
                              <Button
                                size="sm"
                                onClick={aiResult.action.handler}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs"
                              >
                                {aiResult.action.label}
                                <ArrowRight className="w-3 h-3 ml-1.5" />
                              </Button>
                            ) : aiResult.action.path ? (
                              <Button
                                size="sm"
                                onClick={() => { navigate(aiResult.action!.path!); setOpen(false); setSearch(""); }}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs"
                              >
                                {aiResult.action.label}
                                <ArrowRight className="w-3 h-3 ml-1.5" />
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {aiHistory.length > 0 && !aiResult && !aiLoading && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground px-1">Recent queries</p>
                    {aiHistory.slice(-3).map((h, i) => (
                      <button
                        key={i}
                        onClick={() => { setSearch(h.query); processAIQuery(h.query); }}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary/50" />
                        {h.query}
                      </button>
                    ))}
                  </div>
                )}

                {!aiResult && !aiLoading && aiHistory.length === 0 && (
                  <div className="py-6 text-center">
                    <Sparkles className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Try: "How's my pipeline?", "Go to deals", "Create a task"
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
