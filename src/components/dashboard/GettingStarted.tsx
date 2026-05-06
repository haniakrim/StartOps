import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  UserPlus,
  GitBranch,
  Activity,
  Building2,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  completed: boolean;
}

const STORAGE_KEY = "startops_onboarding";

const defaultItems: ChecklistItem[] = [
  {
    id: "contact",
    label: "Add your first contact",
    description: "Start building your contact database",
    icon: UserPlus,
    path: "/contacts",
    completed: false,
  },
  {
    id: "company",
    label: "Add a company",
    description: "Track accounts and organizations",
    icon: Building2,
    path: "/companies",
    completed: false,
  },
  {
    id: "deal",
    label: "Create your first deal",
    description: "Track sales opportunities",
    icon: GitBranch,
    path: "/deals",
    completed: false,
  },
  {
    id: "activity",
    label: "Log an activity",
    description: "Track calls, meetings, and tasks",
    icon: Activity,
    path: "/activities",
    completed: false,
  },
  {
    id: "dashboard",
    label: "Explore the dashboard",
    description: "View AI insights and analytics",
    icon: BarChart3,
    path: "/dashboard",
    completed: false,
  },
  {
    id: "assistant",
    label: "Try the AI Assistant",
    description: "Ask questions about your pipeline",
    icon: Sparkles,
    path: "/assistant",
    completed: false,
  },
];

export function GettingStarted() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || defaultItems);
        setDismissed(parsed.dismissed || false);
      } catch {
        setItems(defaultItems);
      }
    } else {
      setItems(defaultItems);
    }
  }, []);

  function save(items: ChecklistItem[], dismissed: boolean) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, dismissed }));
  }

  function toggleItem(id: string) {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    save(updated, dismissed);
  }

  function dismiss() {
    setDismissed(true);
    save(items, true);
  }

  const completedCount = items.filter((i) => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);
  const allComplete = completedCount === items.length;

  if (dismissed || allComplete) return null;

  return (
    <Card className="bg-[#18191b] border-[#6452db]/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6452db]" />
            Getting Started
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismiss}
            className="text-white/40 hover:text-white text-xs h-7"
          >
            Dismiss
          </Button>
        </div>
        <p className="text-xs text-white/40 mt-1">
          Complete these steps to get the most out of StartOps
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-white/50">
              {completedCount} of {items.length} completed
            </span>
            <span className="text-[#6452db] font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/10" />
        </div>

        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.completed
                      ? "bg-[#8dc572]/20"
                      : "bg-white/5 group-hover:bg-white/10"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#8dc572]" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      item.completed
                        ? "text-white/40 line-through"
                        : "text-white"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-white/30">{item.description}</p>
                </div>
                {!item.completed && (
                  <ArrowRight
                    className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.path);
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}