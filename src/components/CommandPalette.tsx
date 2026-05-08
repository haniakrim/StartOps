import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, GitBranch, FileText, Mail,
  Calendar as CalendarIcon, FolderKanban, Package, DollarSign, Clock,
  BrainCircuit, Target, BarChart3,
  Zap, Send, BookOpen, ListFilter, FolderOpen, Sparkles, Bell,
  CreditCard, Settings, Shield, Webhook, FileSearch, LifeBuoy, Cog,
  Search as SearchIcon
} from "lucide-react";

const RECENT_KEY = "startops_recent";
const MAX_RECENT = 5;

interface CommandItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

const commands: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "today", label: "Today", path: "/today", icon: Clock },
  { id: "activities", label: "Activities", path: "/activities", icon: Clock },
  { id: "contacts", label: "Contacts", path: "/contacts", icon: Users },
  { id: "companies", label: "Companies", path: "/companies", icon: Building2 },
  { id: "deals", label: "Deals", path: "/deals", icon: GitBranch },
  { id: "quotes", label: "Quotes", path: "/quotes", icon: FileText },
  { id: "communications", label: "Communications", path: "/communications", icon: Mail },
  { id: "calendar", label: "Calendar", path: "/calendar", icon: CalendarIcon },
  { id: "projects", label: "Projects", path: "/projects", icon: FolderKanban },
  { id: "inventory", label: "Inventory", path: "/inventory", icon: Package },
  { id: "finance", label: "Finance", path: "/finance", icon: DollarSign },
  { id: "timesheets", label: "Timesheets", path: "/timesheets", icon: Clock },
  { id: "employees", label: "People", path: "/employees", icon: Users },
  { id: "forecasts", label: "Forecasts", path: "/forecasts", icon: BrainCircuit },
  { id: "goals", label: "Goals", path: "/goals", icon: Target },
  { id: "analytics", label: "Analytics", path: "/analytics", icon: BarChart3 },
  { id: "reports", label: "Reports", path: "/reports", icon: BarChart3 },
  { id: "workflows", label: "Workflows", path: "/workflows", icon: Zap },
  { id: "campaigns", label: "Campaigns", path: "/campaigns", icon: Send },
  { id: "email-templates", label: "Email Templates", path: "/email-templates", icon: BookOpen },
  { id: "custom-fields", label: "Custom Fields", path: "/custom-fields", icon: ListFilter },
  { id: "documents", label: "Documents", path: "/documents", icon: FolderOpen },
  { id: "assistant", label: "AI Assistant", path: "/assistant", icon: Sparkles },
  { id: "notifications", label: "Notifications", path: "/notifications", icon: Bell },
  { id: "subscriptions", label: "Subscriptions", path: "/subscriptions", icon: CreditCard },
  { id: "staff-directory", label: "Staff Directory", path: "/staff-directory", icon: Users },
  { id: "organization", label: "Organization", path: "/organization", icon: Settings },
  { id: "security", label: "Security", path: "/security", icon: Shield },
  { id: "api", label: "API & Webhooks", path: "/api", icon: Webhook },
  { id: "audit", label: "Audit Logs", path: "/audit", icon: FileSearch },
  { id: "support", label: "Support", path: "/support", icon: LifeBuoy },
  { id: "settings", label: "Settings", path: "/settings", icon: Cog },
];

function getRecentCommands(): CommandItem[] {
  try {
    const stored = sessionStorage.getItem(RECENT_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Filter out any stored items that don't have a valid icon reference
    const validIds = new Set(commands.map(c => c.id));
    return parsed.filter((c: any) => validIds.has(c.id)).map((c: any) => {
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

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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

  const handleSelect = useCallback(
    (command: CommandItem) => {
      saveRecentCommand(command);
      navigate(command.path);
      setOpen(false);
      setSearch("");
    },
    [navigate]
  );

  const recentCommands = getRecentCommands();
  const filteredCommands = search
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type a command..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {search === "" && recentCommands.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Recent
                </p>
                {recentCommands.map((command) => (
                    <button
                      key={command.id}
                      onClick={() => handleSelect(command)}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
                    >
                      <command.icon className="w-4 h-4 text-muted-foreground" />
                      {command.label}
                    </button>
                  ))}
                <div className="border-t my-2" />
              </>
            )}
            {filteredCommands.map((command) => (
              <button
                key={command.id}
                onClick={() => handleSelect(command)}
                className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
              >
                <command.icon className="w-4 h-4 text-muted-foreground" />
                {command.label}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;