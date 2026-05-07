import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, X, Plus, ArrowRight, User, GitBranch, Building2,
  Activity, FolderKanban, DollarSign, Mail, Calendar,
  Target, FileText, BarChart3, Settings, Shield, Webhook,
  Clock, Briefcase, Package, Zap, LifeBuoy, Sparkles,
  TrendingUp, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CommandItem {
  id: string;
  type: "navigate" | "create" | "action" | "recent";
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  shortcut?: string;
  action: () => void;
}

const navItems = [
  { path: "/dashboard", icon: TrendingUp, label: "Dashboard", color: "#6452db" },
  { path: "/contacts", icon: User, label: "Contacts", color: "#5683da" },
  { path: "/companies", icon: Building2, label: "Companies", color: "#ff8964" },
  { path: "/deals", icon: GitBranch, label: "Deals", color: "#8dc572" },
  { path: "/activities", icon: Activity, label: "Activities", color: "#f0ad4e" },
  { path: "/projects", icon: FolderKanban, label: "Projects", color: "#6452db" },
  { path: "/finance", icon: DollarSign, label: "Finance", color: "#8dc572" },
  { path: "/inventory", icon: Package, label: "Inventory", color: "#ff8964" },
  { path: "/employees", icon: Briefcase, label: "People", color: "#5683da" },
  { path: "/communications", icon: Mail, label: "Communications", color: "#6452db" },
  { path: "/calendar", icon: Calendar, label: "Calendar", color: "#f0ad4e" },
  { path: "/forecasts", icon: Target, label: "Forecasts", color: "#8dc572" },
  { path: "/timesheets", icon: Clock, label: "Timesheets", color: "#ff8964" },
  { path: "/goals", icon: CheckCircle2, label: "Goals", color: "#6452db" },
  { path: "/analytics", icon: BarChart3, label: "Analytics", color: "#5683da" },
  { path: "/reports", icon: FileText, label: "Reports", color: "#f0ad4e" },
  { path: "/workflows", icon: Zap, label: "Workflows", color: "#8dc572" },
  { path: "/assistant", icon: Sparkles, label: "AI Assistant", color: "#ff8964" },
  { path: "/settings", icon: Settings, label: "Settings", color: "#6452db" },
  { path: "/security", icon: Shield, label: "Security", color: "#5683da" },
  { path: "/support", icon: LifeBuoy, label: "Support", color: "#f0ad4e" },
];

const createActions = [
  { type: "contact", title: "New Contact", subtitle: "Add a new contact to your CRM", icon: User, color: "#5683da", path: "/contacts" },
  { type: "deal", title: "New Deal", subtitle: "Create a new sales opportunity", icon: GitBranch, color: "#8dc572", path: "/deals" },
  { type: "activity", title: "New Activity", subtitle: "Log a task, call, or meeting", icon: Activity, color: "#f0ad4e", path: "/activities" },
  { type: "project", title: "New Project", subtitle: "Start a new project", icon: FolderKanban, color: "#6452db", path: "/projects" },
  { type: "invoice", title: "New Invoice", subtitle: "Create a customer invoice", icon: DollarSign, color: "#8dc572", path: "/finance" },
  { type: "goal", title: "New Goal", subtitle: "Set an OKR objective", icon: CheckCircle2, color: "#ff8964", path: "/goals" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const recentItems: CommandItem[] = (() => {
    try {
      const raw = localStorage.getItem("startops_recent");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item: any) =>
          item &&
          typeof item === "object" &&
          typeof item.title === "string" &&
          typeof item.path === "string" &&
          item.title.length < 200 &&
          item.path.length < 500
        )
        .slice(0, 5)
        .map((item: any, i: number) => ({
          id: `recent-${i}`,
          type: "recent" as const,
          title: item.title,
          subtitle: item.subtitle && typeof item.subtitle === "string" ? item.subtitle : "Recent",
          icon: navItems.find((n) => n.path === item.path)?.icon || ArrowRight,
          iconColor: navItems.find((n) => n.path === item.path)?.color || "#6452db",
          action: () => navigate(item.path),
        }));
    } catch {
      return [];
    }
  })();

  const navigationCommands: CommandItem[] = navItems.map((item) => ({
    id: `nav-${item.path}`,
    type: "navigate",
    title: `Go to ${item.label}`,
    subtitle: `Navigate to ${item.label}`,
    icon: item.icon,
    iconColor: item.color,
    shortcut: undefined,
    action: () => {
      navigate(item.path);
      setOpen(false);
      addRecent(item.label, item.path);
    },
  }));

  const createCommands: CommandItem[] = createActions.map((action) => ({
    id: `create-${action.type}`,
    type: "create",
    title: action.title,
    subtitle: action.subtitle,
    icon: action.icon,
    iconColor: action.color,
    action: () => {
      navigate(action.path);
      setOpen(false);
      toast.info(`Create ${action.type} — click the + button on the page`);
      addRecent(action.title, action.path);
    },
  }));

  const actionCommands: CommandItem[] = [
    {
      id: "action-refresh",
      type: "action",
      title: "Refresh Data",
      subtitle: "Reload all dashboard data",
      icon: TrendingUp,
      iconColor: "#6452db",
      action: () => {
        window.location.reload();
        setOpen(false);
      },
    },
    {
      id: "action-profile",
      type: "action",
      title: "Open Profile",
      subtitle: "View your account settings",
      icon: User,
      iconColor: "#5683da",
      action: () => {
        navigate("/profile");
        setOpen(false);
      },
    },
  ];

  const allCommands = [...recentItems, ...navigationCommands, ...createCommands, ...actionCommands];

  const filtered = query.trim()
    ? allCommands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(query.toLowerCase()) ||
          cmd.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.type]) acc[cmd.type] = [];
      acc[cmd.type].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  const flatItems = Object.values(grouped).flat();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    setQuery("");
    setSelectedIndex(0);
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = flatItems[selectedIndex];
        if (item) item.action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, flatItems, selectedIndex]);

  function addRecent(title: string, path: string) {
    try {
      if (typeof title !== "string" || typeof path !== "string") return;
      if (title.length > 200 || path.length > 500) return;
      const raw = localStorage.getItem("startops_recent") || "[]";
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.setItem("startops_recent", JSON.stringify([{ title, path, time: Date.now() }]));
        return;
      }
      const filtered = parsed.filter((r: any) => r?.path !== path);
      const updated = [{ title, path, time: Date.now() }, ...filtered].slice(0, 10);
      localStorage.setItem("startops_recent", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border-border text-card-foreground p-0 gap-0 max-w-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, pages, or actions..."
            className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-muted border border-border">ESC</kbd>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {flatItems.length === 0 && query.trim() && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results for "{query}"
            </div>
          )}

          {Object.entries(grouped).map(([type, items]) => {
            if (items.length === 0) return null;
            const label =
              type === "recent"
                ? "Recent"
                : type === "navigate"
                  ? "Navigation"
                  : type === "create"
                    ? "Quick Create"
                    : "Actions";

            return (
              <div key={type}>
                <div className="px-4 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </div>
                {items.map((item) => {
                  const globalIndex = flatItems.findIndex((fi) => fi.id === item.id);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-accent"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${item.iconColor}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: item.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                      {item.type === "navigate" && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                      )}
                      {item.type === "create" && (
                        <Plus className="w-4 h-4 text-muted-foreground/30" />
                      )}
                      {isSelected && (
                        <kbd className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-muted border border-border">↵</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-muted border border-border">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-muted border border-border">↵</kbd> Select</span>
          </div>
          <span>{flatItems.length} commands</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}