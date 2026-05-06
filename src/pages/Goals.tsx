import { useState, useEffect } from "react";
import { Target, TrendingUp, CheckCircle2, Zap, Search, Plus, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GoalStatCard } from "@/components/goals/GoalStatCard";
import { GoalChart } from "@/components/goals/GoalChart";
import { GoalCard, type Goal } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";
import { useRealtimeTable } from "@/hooks/useRealtime";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);
  useRealtimeTable("goals", fetchGoals);
  useRealtimeTable("key_results", fetchGoals);

  async function fetchGoals() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("goals")
        .select(`
          *,
          key_results (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((g: any) => ({
        ...g,
        key_results: g.key_results || [],
      }));

      setGoals(mapped);
    } catch (error: any) {
      toast.error("Failed to load goals: " + error.message);
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
    try {
      // Insert goal
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

      // Insert key results
      if (data.key_results.length > 0 && goalData) {
        const krs = data.key_results
          .filter((kr) => kr.name.trim())
          .map((kr) => ({
            goal_id: goalData.id,
            name: kr.name,
            current_value: parseFloat(kr.current_value) || 0,
            target_value: parseFloat(kr.target_value) || 100,
            unit: kr.unit,
            status: "on_track",
            progress: 0,
          }));

        if (krs.length > 0) {
          const { error: krError } = await supabase.from("key_results").insert(krs);
          if (krError) throw krError;
        }
      }

      toast.success("Goal created with key results");
      setDialogOpen(false);
      fetchGoals();
    } catch (error: any) {
      toast.error("Failed to create goal: " + error.message);
    }
  }

  async function updateGoalProgress(goalId: string, krId: string, newCurrent: number) {
    try {
      // Update the key result
      const { error: krError } = await supabase
        .from("key_results")
        .update({ current_value: newCurrent })
        .eq("id", krId);

      if (krError) throw krError;

      // Recalculate goal progress
      const { data: krs } = await supabase
        .from("key_results")
        .select("current_value, target_value")
        .eq("goal_id", goalId);

      const avgProgress =
        (krs || []).length > 0
          ? Math.round(
              (krs || []).reduce(
                (sum, kr) =>
                  sum +
                  (kr.target_value > 0
                    ? Math.min(100, (kr.current_value / kr.target_value) * 100)
                    : 0),
                0
              ) / (krs || []).length
            )
          : 0;

      const goalStatus =
        avgProgress >= 100
          ? "completed"
          : avgProgress >= 70
            ? "on_track"
            : avgProgress >= 40
              ? "at_risk"
              : "behind";

      const { error: goalError } = await supabase
        .from("goals")
        .update({ progress: avgProgress, status: goalStatus })
        .eq("id", goalId);

      if (goalError) throw goalError;

      toast.success("Progress updated");
      fetchGoals();
    } catch (error: any) {
      toast.error("Failed to update progress: " + error.message);
    }
  }

  async function deleteGoal(id: string) {
    try {
      // Key results will be cascade deleted if FK is set up, otherwise delete manually
      const { error: krError } = await supabase
        .from("key_results")
        .delete()
        .eq("goal_id", id);
      if (krError) throw krError;

      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;

      toast.success("Goal deleted");
      fetchGoals();
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
      ? Math.round(
          periodGoals.reduce((s, g) => s + (g.progress || 0), 0) /
            periodGoals.length
        )
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5" onClick={() => {
            const exportData = goals.map(g => ({
              "Name": g.name,
              "Description": g.description || "",
              "Period": g.period,
              "Status": g.status,
              "Progress": g.progress,
              "Key Results": (g.key_results || []).map((kr: any) => kr.name).join("; "),
            }));
            import("@/lib/export").then(({ exportToCSV }) => {
              exportToCSV(exportData, "goals");
            });
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
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
            <GoalForm onSubmit={createGoal} onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GoalStatCard icon={Target} iconColor="#6452db" value={periodGoals.length.toString()} label="Active Objectives" />
        <GoalStatCard icon={CheckCircle2} iconColor="#8dc572" value={completedGoals.toString()} label="Completed" />
        <GoalStatCard icon={TrendingUp} iconColor="#ff8964" value={`${avgProgress}%`} label="Avg Progress" />
        <GoalStatCard icon={Zap} iconColor="#f0ad4e" value={periodGoals.filter((g) => g.status === "at_risk" || g.status === "behind").length.toString()} label="Need Attention" />
      </div>

      <GoalChart data={chartData} />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search objectives..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-white/40">
            No goals yet. Create your first OKR to start tracking objectives.
          </div>
        )}
        {filtered.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onUpdateProgress={updateGoalProgress} onDelete={deleteGoal} />
        ))}
      </div>
    </div>
  );
}