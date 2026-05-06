import { useState, useEffect } from "react";
import { Target, TrendingUp, CheckCircle2, Zap, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { GoalStatCard } from "@/components/goals/GoalStatCard";
import { GoalChart } from "@/components/goals/GoalChart";
import { GoalCard, type Goal } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";

const STORAGE_KEY = "startops_goals";

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const saved = loadGoals();
    setGoals(saved);
    setLoading(false);
  }, []);

  function createGoal(data: {
    name: string;
    description: string;
    period: string;
    status: string;
    key_results: { name: string; current_value: string; target_value: string; unit: string }[];
  }) {
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
    saveGoals(updated);
    toast.success("Goal created with key results");
    setDialogOpen(false);
  }

  function updateGoalProgress(goalId: string, krId: string, newCurrent: number) {
    const updated = goals.map((goal) => {
      if (goal.id !== goalId) return goal;

      const updatedKRs = goal.key_results.map((kr) => {
        if (kr.id !== krId) return kr;
        const progress = kr.target_value > 0 ? Math.min(100, (newCurrent / kr.target_value) * 100) : 0;
        const status = progress >= 100 ? "completed" : progress >= 70 ? "on_track" : progress >= 40 ? "at_risk" : "behind";
        return { ...kr, current_value: newCurrent, progress, status };
      });

      const avgProgress = updatedKRs.reduce((sum, k) => sum + (k.target_value > 0 ? Math.min(100, (k.current_value / k.target_value) * 100) : 0), 0) / (updatedKRs.length || 1);
      const goalStatus = avgProgress >= 100 ? "completed" : avgProgress >= 70 ? "on_track" : avgProgress >= 40 ? "at_risk" : "behind";

      return { ...goal, key_results: updatedKRs, progress: Math.round(avgProgress), status: goalStatus };
    });

    setGoals(updated);
    saveGoals(updated);
    toast.success("Progress updated");
  }

  function deleteGoal(id: string) {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
    toast.success("Goal deleted");
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