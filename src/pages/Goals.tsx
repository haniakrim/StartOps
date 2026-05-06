import { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  Circle,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Award,
  BarChart3,
  Trash2,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Goal {
  id: string;
  name: string;
  description: string | null;
  period: string;
  status: string;
  progress: number;
  owner_id: string | null;
  created_at: string;
  key_results: KeyResult[];
}

interface KeyResult {
  id: string;
  goal_id: string;
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  status: string;
  progress: number;
}

const statusColors: Record<string, string> = {
  on_track: "bg-[#8dc572]/20 text-[#8dc572]",
  at_risk: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  behind: "bg-[#be6464]/20 text-[#be6464]",
  completed: "bg-[#6452db]/20 text-[#6452db]",
};

const statusLabels: Record<string, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  behind: "Behind",
  completed: "Completed",
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
    period: "Q1 2024",
    status: "on_track",
  });
  const [newKRs, setNewKRs] = useState([
    { name: "", current_value: "0", target_value: "100", unit: "%" },
  ]);

  useEffect(() => { fetchGoals(); }, []);

  async function fetchGoals() {
    try {
      setLoading(true);
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });
      if (goalsError) throw goalsError;

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
    } catch (error: any) {
      toast.error("Failed to load goals: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .insert({
          name: newGoal.name,
          description: newGoal.description || null,
          period: newGoal.period,
          status: newGoal.status,
          progress: 0,
        })
        .select()
        .single();

      if (goalError) throw goalError;

      const krsToInsert = newKRs
        .filter((kr) => kr.name.trim())
        .map((kr) => ({
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
      setNewGoal({ name: "", description: "", period: "Q1 2024", status: "on_track" });
      setNewKRs([{ name: "", current_value: "0", target_value: "100", unit: "%" }]);
      fetchGoals();
    } catch (error: any) {
      toast.error("Failed to create goal: " + error.message);
    }
  }

  async function updateGoalProgress(goalId: string, krId: string, newCurrent: number) {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const kr = goal.key_results.find((k) => k.id === krId);
      if (!kr) return;

      const progress = kr.target_value > 0 ? Math.min(100, (newCurrent / kr.target_value) * 100) : 0;
      const status = progress >= 100 ? "completed" : progress >= 70 ? "on_track" : progress >= 40 ? "at_risk" : "behind";

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
      fetchGoals();
    } catch (error: any) {
      toast.error("Failed to update progress: " + error.message);
    }
  }

  async function deleteGoal(id: string) {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
      toast.success("Goal deleted");
      fetchGoals();
    } catch (error: any) {
      toast.error("Failed to delete goal: " + error.message);
    }
  }

  function addKRField() {
    setNewKRs((prev) => [...prev, { name: "", current_value: "0", target_value: "100", unit: "%" }]);
  }

  function updateKRField(index: number, field: string, value: string) {
    setNewKRs((prev) => prev.map((kr, i) => (i === index ? { ...kr, [field]: value } : kr)));
  }

  function removeKRField(index: number) {
    setNewKRs((prev) => prev.filter((_, i) => i !== index));
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
  const avgProgress = periodGoals.length > 0
    ? Math.round(periodGoals.reduce((s, g) => s + (g.progress || 0), 0) / periodGoals.length)
    : 0;

  const chartData = periods.map((p) => ({
    period: p,
    goals: goals.filter((g) => g.period === p).length,
    completed: goals.filter((g) => g.period === p && g.status === "completed").length,
    avgProgress: goals.filter((g) => g.period === p).length > 0
      ? Math.round(goals.filter((g) => g.period === p).reduce((s, g) => s + (g.progress || 0), 0) / goals.filter((g) => g.period === p).length)
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
          <p className="text-sm text-white/50 mt-1">Track objectives and key results across your organization</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create OKR</DialogTitle>
            </DialogHeader>
            <form onSubmit={createGoal} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Objective</Label>
                <Input
                  required
                  value={newGoal.name}
                  onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
                  className="bg-[#0b0d10] border-white/10 text-white"
                  placeholder="Increase monthly recurring revenue"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Input
                  value={newGoal.description}
                  onChange={(e) => setNewGoal((p) => ({ ...p, description: e.target.value }))}
                  className="bg-[#0b0d10] border-white/10 text-white"
                  placeholder="Grow revenue through expansion and new customers"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Period</Label>
                  <Select value={newGoal.period} onValueChange={(v) => setNewGoal((p) => ({ ...p, period: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                      <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                      <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                      <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                      <SelectItem value="FY 2024">FY 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Initial Status</Label>
                  <Select value={newGoal.status} onValueChange={(v) => setNewGoal((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="on_track">On Track</SelectItem>
                      <SelectItem value="at_risk">At Risk</SelectItem>
                      <SelectItem value="behind">Behind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white/70">Key Results</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addKRField} className="text-[#6452db] hover:text-[#6452db] hover:bg-[#6452db]/10">
                    <Plus className="w-4 h-4 mr-1" />Add KR
                  </Button>
                </div>
                {newKRs.map((kr, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#0b0d10] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={kr.name}
                        onChange={(e) => updateKRField(i, "name", e.target.value)}
                        className="bg-[#18191b] border-white/10 text-white flex-1"
                        placeholder="Achieve $100K MRR"
                      />
                      {newKRs.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeKRField(i)} className="text-white/30 hover:text-[#be6464] h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        value={kr.current_value}
                        onChange={(e) => updateKRField(i, "current_value", e.target.value)}
                        className="bg-[#18191b] border-white/10 text-white"
                        placeholder="Current"
                      />
                      <Input
                        type="number"
                        value={kr.target_value}
                        onChange={(e) => updateKRField(i, "target_value", e.target.value)}
                        className="bg-[#18191b] border-white/10 text-white"
                        placeholder="Target"
                      />
                      <Select value={kr.unit} onValueChange={(v) => updateKRField(i, "unit", v)}>
                        <SelectTrigger className="bg-[#18191b] border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                          <SelectItem value="%">%</SelectItem>
                          <SelectItem value="$">$</SelectItem>
                          <SelectItem value="#">#</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                Create OKR
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Target className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">{periodGoals.length}</p>
            <p className="text-sm text-white/50">Active Objectives</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <CheckCircle2 className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">{completedGoals}</p>
            <p className="text-sm text-white/50">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-[#ff8964] mb-3" />
            <p className="text-2xl font-semibold text-white">{avgProgress}%</p>
            <p className="text-sm text-white/50">Avg Progress</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Zap className="w-5 h-5 text-[#f0ad4e] mb-3" />
            <p className="text-2xl font-semibold text-white">
              {periodGoals.filter((g) => g.status === "at_risk" || g.status === "behind").length}
            </p>
            <p className="text-sm text-white/50">Need Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-[#18191b] border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#6452db]" />
            OKR Performance by Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
              />
              <Bar dataKey="goals" fill="#6452db" radius={[4, 4, 0, 0]} name="Total Goals" />
              <Bar dataKey="completed" fill="#8dc572" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search */}
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

      {/* Goals List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-sm text-white/40">No goals yet</p>
              <p className="text-xs text-white/30 mt-1">Create your first OKR to start tracking objectives</p>
            </CardContent>
          </Card>
        )}

        {filtered.map((goal) => (
          <Card key={goal.id} className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white">{goal.name}</h3>
                    <Badge variant="secondary" className={`text-xs ${statusColors[goal.status] || statusColors.on_track}`}>
                      {statusLabels[goal.status] || goal.status}
                    </Badge>
                  </div>
                  {goal.description && <p className="text-sm text-white/50">{goal.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{goal.period}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{goal.key_results.length} key results</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">{goal.progress || 0}%</p>
                    <p className="text-xs text-white/30">complete</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-[#be6464]" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <Progress value={goal.progress || 0} className="h-2 bg-white/10" />
              </div>

              {/* Key Results */}
              <div className="space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Key Results</p>
                {goal.key_results.length === 0 && (
                  <p className="text-sm text-white/30 py-2">No key results defined</p>
                )}
                {goal.key_results.map((kr) => {
                  const krProgress = kr.target_value > 0 ? Math.min(100, (kr.current_value / kr.target_value) * 100) : 0;
                  return (
                    <div key={kr.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                      <div className="flex-shrink-0">
                        {krProgress >= 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-[#8dc572]" />
                        ) : (
                          <Circle className="w-5 h-5 text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-white">{kr.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white/60">
                              {kr.unit === "$" ? "$" : ""}{kr.current_value}{kr.unit === "%" ? "%" : kr.unit === "#" ? "" : ` ${kr.unit}`}
                              {" / "}
                              {kr.unit === "$" ? "$" : ""}{kr.target_value}{kr.unit === "%" ? "%" : kr.unit === "#" ? "" : ` ${kr.unit}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={krProgress} className="h-1 bg-white/10" />
                          </div>
                          <span className="text-xs text-white/40 w-10 text-right">{Math.round(krProgress)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="w-20 h-7 bg-[#18191b] border-white/10 text-white text-xs px-2"
                          value={kr.current_value}
                          onChange={(e) => updateGoalProgress(goal.id, kr.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}