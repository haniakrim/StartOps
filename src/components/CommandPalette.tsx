import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Search, Clock } from "lucide-react";

const RECENT_KEY = "startops_recent";
const MAX_RECENT = 5;

interface CommandItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const commands: CommandItem[] = [
  { id: "dashboard", label: "Go to Dashboard", path: "/" },
  { id: "contacts", label: "Go to Contacts", path: "/contacts" },
  { id: "deals", label: "Go to Deals", path: "/deals" },
  { id: "organizations", label: "Go to Organizations", path: "/organizations" },
  { id: "settings", label: "Go to Settings", path: "/settings" },
  { id: "security", label: "Go to Security", path: "/security" },
  { id: "notifications", label: "Go to Notifications", path: "/notifications" },
];

function getRecentCommands(): CommandItem[] {
  try {
    const stored = sessionStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
                  >
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
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
              >
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