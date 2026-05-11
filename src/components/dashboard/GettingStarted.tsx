import { useState, useEffect, useCallback } from "react";
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
  ChevronRight,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  actionLabel: string;
  completed: boolean;
}

const STORAGE_KEY = "startops_onboarding_dismissed";

const allSteps: Omit<ChecklistItem, "completed">[] = [
  {
    id: "contact",
    label: "Add your first contact",
    description: "Start building your contact database with names, emails, and companies.",
    icon: UserPlus,
    path: "/contacts",
    actionLabel: "Add Contact",
  },
  {
    id: "company",
    label: "Add a company",
    description: "Track accounts and organizations you work with.",
    icon: Building2,
    path: "/companies",
    actionLabel: "Add Company",
  },
  {
    id: "deal",
    label: "Create your first deal",
    description: "Track sales opportunities through your pipeline.",
    icon: GitBranch,
    path: "/deals",
    actionLabel: "Create Deal",
  },
  {
    id: "activity",
    label: "Log an activity",
    description: "Track calls, meetings, and tasks related to your deals.",
    icon: Activity,
    path: "/activities",
    actionLabel: "Log Activity",
  },
  {
    id: "dashboard",
    label: "Explore the dashboard",
    description: "View AI insights, analytics, and deal health monitoring.",
    icon: BarChart3,
    path: "/dashboard",
    actionLabel: "View Dashboard",
  },
  {
    id: "assistant",
    label: "Try the AI Assistant",
    description: "Ask questions about your pipeline and get AI-powered insights.",
    icon: Sparkles,
    path: "/assistant",
    actionLabel: "Open Assistant",
  },
];

export function GettingStarted() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const { organizationId } = useOrganization();

  const checkCompletion = useCallback(async () => {
    if (!organizationId) {
      setItems(allSteps.map((s) => ({ ...s, completed: false })));
      setLoading(false);
      return;
    }

    try {
      const [
        { count: contactCount },
        { count: companyCount },
        { count: dealCount },
        { count: activityCount },
      ] = await Promise.all([
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
        supabase.from("companies").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
        supabase.from("deals").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
        supabase.from("activities").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
      ]);

      const hasContacts = (contactCount ?? 0) > 0;
      const hasCompanies = (companyCount ?? 0) > 0;
      const hasDeals = (dealCount ?? 0) > 0;
      const hasActivities = (activityCount ?? 0) > 0;

      // Dashboard and assistant are always marked complete after user has some data
      const hasData = hasContacts || hasCompanies || hasDeals || hasActivities;

      const updated = allSteps.map((s) => {
        let completed = false;
        switch (s.id) {
          case "contact":
            completed = hasContacts;
            break;
          case "company":
            completed = hasCompanies;
            break;
          case "deal":
            completed = hasDeals;
            break;
          case "activity":
            completed = hasActivities;
            break;
          case "dashboard":
          case "assistant":
            completed = hasData;
            break;
        }
        return { ...s, completed };
      });

      setItems(updated);
    } catch {
      setItems(allSteps.map((s) => ({ ...s, completed: false })));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
    checkCompletion();
  }, [checkCompletion]);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const allComplete = items.length > 0 && completedCount === items.length;

  // Find the first incomplete step to highlight
  const nextStep = items.find((i) => !i.completed);

  if (dismissed || allComplete || loading) return null;

  return (
    <Card className="bg-card border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Getting Started</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={dismiss}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              {completedCount} of {items.length} completed
            </span>
            <span className="text-primary font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-muted" />
        </div>

        {/* Next Step - Highlighted */}
        {nextStep && (
          <div className="mb-5 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <nextStep.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Step {completedCount + 1}: {nextStep.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{nextStep.description}</p>
                <Button
                  size="sm"
                  className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs"
                  onClick={() => navigate(nextStep.path)}
                >
                  {nextStep.actionLabel}
                  <ArrowRight className="w-3 h-3 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* All Steps - Collapsible list */}
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isNext = item.id === nextStep?.id;
            if (isNext) return null; // Already shown above

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.completed) navigate(item.path);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors text-left group"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.completed
                      ? "bg-emerald-500/15"
                      : "bg-muted group-hover:bg-muted/80"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      item.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
                {!item.completed && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
