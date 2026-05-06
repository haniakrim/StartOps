import { useState, useEffect } from "react";
import { Target, TrendingUp, CheckCircle2, Zap, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GoalStatCard } from "@/components/goals/GoalStatCard";
import { GoalChart } from "@/components/goals/GoalChart";
import { GoalCard, type Goal, type KeyResult } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";

const STORAGE_KEY = "startops_goals";

function loadLocalGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalGoals(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dbReady, setDbReady] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      setLoading(true);
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (goalsError) {
        if (
          goalsError.message?.includes("Could not find the table") ||
          goalsError.message?.includes("relation") ||
          goalsError.code === "PGRST116"
        ) {
          setDbReady(false);
          setGoals(loadLocalGoals());
          return;
        }
        throw goalsError;
      }

      setDbReady(true);

      const goalsWithKRs = await Promise.all(
        (goalsData || []).map(async (goal: any) => {
          const { data: krs } = await supabase
            .from("key_results")
            .select("*")
            .eq("goal_id", goal.id);
          return { ...goal, key_results: krs || [] };
        })
      );

      setGoals(goalsWithKRs);
      saveLocalGoals(goalsWithKRs);
    } catch (error: any) {
      toast.error("Failed to load goals: " + error.message);
      setGoals(loadLocalGoals());
    } finally {
      setLoading(false);
    }
  }

  async function createGoal(data: {
    name: string;
    description: string;
    period: string;
    status: string;
    key_results: { name: string; current_value: string; target_value: string; unit: string }[];
  }) {
    if (!dbReady) {
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description || null,
        period: data.period,
        status: data.status,
        progress: 0,
        owner_id: null,
        created_at: new Date().toISOString(),
        key_results: data.key_results.map((kr) => ({
          id: crypto.randomUUID(),
          goal_id: "",
          name: kr.name,
          current_value: parseFloat(kr.current_value) || 0,
          target_value: parseFloat(kr.target_value) || 100,
          unit: kr.unit,
          status: "on_track",
          progress: 0,
        })),
      };
      newGoal.key_results.forEach((kr) => (kr.goal_id = newGoal.id));
      const updated = [newGoal, ...goals];
      setGoals(updated);
      saveLocalGoals(updated);
      toast.success("Goal created locally (database unavailable)");
      setDialogOpen(false);
      return;
    }

    try {
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .insert({
          name: data.name,
          description: data.description || null,
          period: data.period,
          status: data.status,
          progress: 0,
        })
        .select()
        .single();

      if (goalError) throw goalError;

      const krsToInsert = data.key_results.map((kr) => ({
        goal_id: goalData.id,
        name: kr.name,
        current_value: parseFloat(kr.current_value) || 0,
        target_value: parseFloat(kr.target_value) || 100,
        unit: kr.unit,
        progress: 0,
        status: "on_track",
      }));

      if (krsToInsert.length > 0) {
        const { error: krError } = await supabase.from("key_results").insert(krsToInsert);
        if (krError) throw krError;
      }

      toast.success("Goal created with key results");
      setDialogOpen(false);
      fetchGoals();
    } catch (error: any) {
      toast.error("Failed to create goal: " + error.message);
    }
  }

  async function updateGoalProgress(goalId: string, krId: string, newCurrent: number) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const kr = goal.key_results.find((k) => k.id === krId);
    if (!kr) return;

    const progress = kr.target_value > 0 ? Math.min(100, (newCurrent / kr.target_value) * 100) : 0;
    const status = progress >= 100 ? "completed" : progress >= 70 ? "on_track" : progress >= 40 ? "at_risk" : "behind";

    const updatedGoals = goals.map((g) => {
      if (g.id !== goalId) return g;
      const updatedKRs = g.key_results.map((k) =>
        k.id === krId ? { ...k, current_value: newCurrent, progress, status } : k
      );
      const avgProgress = updatedKRs.reduce((sum, k) => sum + (k.target_value > 0 ? Math.min(100, (k.current_value / k.target_value) * 100) : 0), 0) / (updatedKRs.length || 1);
      const goalStatus = avgProgress >= 100 ? "completed" : avgProgress >= 70 ? "on_track" : avgProgress >= 40 ? "at_risk" : "behind";
      return { ...g, key_results: updatedKRs, progress: Math.round(avgProgress), status: goalStatus };
    });

    setGoals(updatedGoals);
    saveLocalGoals(updatedGoals);

    if (!dbReady) {
      toast.success("Progress updated locally");
      return;
    }

    try {
      const { error } = await supabase
        .from("key_results")
        .update({ current_value: newCurrent, progress, status })
        .eq("id", krId);
      if (error) throw error;

      const avgProgress = goal.key_results.reduce((sum, k) => {
        if (k.id === krId) return sum + progress;
        return sum + (k.target_value > 0 ? Math.min(100, (k.current_value / k.target_value) * 100) : 0);
      }, 0) / (goal.key_results.length || 1);

      const goalStatus = avgProgress >= 100 ? "completed" : avgProgress >= 70 ? "on_track" : avgProgress >= 40 ? "at_risk" : "behind";

      await supabase
        .from("goals")
        .update({ progress: Math.round(avgProgress), status: goalStatus })
        .eq("id", goalId);

      toast.success("Progress updated");
    } catch (error: any) {
      toast.error("Failed to sync progress: " + error.message);
    }
  }

  async function deleteGoal(id: string) {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveLocalGoals(updated);

    if (!dbReady) {
      toast.success("Goal deleted locally");
      return;
    }

    try {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
      toast.success("Goal deleted");
    } catch (error: any) {
      toast.error("Failed to delete goal: " + error.message);
    }
  }

  const filtered = goals.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const periods = [...new Set(goals.map((g) => g.period))].sort();
  const currentPeriod = periods[0] || "Q1 2024";

  const periodGoals = filtered.filter((g) => g.period === currentPeriod);
  const completedGoals = periodGoals.filter((g) => g.status === "completed").length;
  const avgProgress =
    periodGoals.length > 0
      ? Math.round(periodGoals.reduce((s, g) => s + (g.progress || 0), 0) / periodGoals.length)
      : 0;

  const chartData = periods.map((p) => ({
    period: p,
    goals: goals.filter((g) => g.period === p).length,
    completed: goals.filter((g) => g.period === p && g.status === "completed").length,
    avgProgress:
      goals.filter((g) => g.period === p).length > 0
        ? Math.round(
            goals
              .filter((g) => g.period === p)
              .reduce((s, g) => s + (g.progress || 0), 0) /
              goals.filter((g) => g.period === p).length
          )
        : 0,
  }));

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Goals & OKRs</h1>
          <p className="text-sm text-white/50 mt-1">
            Track objectives and key results across your organization
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create OKR</DialogTitle>
            </DialogHeader>
            <GoalForm
              onSubmit={createGoal}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!dbReady && (
        <Card className="bg-[#f0ad4e]/5 border-[#f0ad4e]/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f0ad4e]/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-[#f0ad4e]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Database Setup Required</h3>
                <p className="text-xs text-white/50 mt-1">
                  The goals and key_results tables need to be created in Supabase. Run the SQL provided in the chat to enable OKR tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GoalStatCard
          icon={Target}
          iconColor="#6452db"
          value={periodGoals.length.toString()}
          label="Active Objectives"
        />
        <GoalStatCard
          icon={CheckCircle2}
          iconColor="#8dc572"
          value={completedGoals.toString()}
          label="Completed"
        />
        <GoalStatCard
          icon={TrendingUp}
          iconColor="#ff8964"
          value={`${avgProgress}%`}
          label="Avg Progress"
        />
        <GoalStatCard
          icon={Zap}
          iconColor="#f0ad4e"
          value={periodGoals
            .filter((g) => g.status === "at_risk" || g.status === "behind")
            .length.toString()}
          label="Need Attention"
        />
      </div>

      <GoalChart data={chartData} />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search objectives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-white/40">
            No goals yet. Create your first OKR to start tracking objectives.
          </div>
        )}
        {filtered.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdateProgress={updateGoalProgress}
            onDelete={deleteGoal}
          />
        ))}
      </div>
    </div>
  );
}