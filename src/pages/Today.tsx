import { useState, useEffect } from "react";
import { Sun, Clock, AlertCircle, CheckCircle2, Calendar, Phone, Mail, GitBranch, User, Activity, TrendingUp, ArrowRight, Loader2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TodayTask { id: string; subject: string; type: string; due_date: string; priority: string; status: string; contacts: { first_name: string; last_name: string } | null; deals: { name: string } | null; }
interface StalledDeal { id: string; name: string; value: number; stage: string; probability: number; daysOld: number; contacts: { company: string | null } | null; }
interface TodayContact { id: string; first_name: string; last_name: string; company: string | null; title: string | null; created_at: string; }
interface TodayCommunication { id: string; type: string; subject: string | null; occurred_at: string; contacts: { first_name: string; last_name: string } | null; sentiment: string | null; }

export default function Today() {
  const [loading, setLoading] = useState(true);
  const [overdueTasks, setOverdueTasks] = useState<TodayTask[]>([]);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [stalledDeals, setStalledDeals] = useState<StalledDeal[]>([]);
  const [newContacts, setNewContacts] = useState<TodayContact[]>([]);
  const [recentComms, setRecentComms] = useState<TodayCommunication[]>([]);
  const [stats, setStats] = useState({ tasksDue: 0, dealsStalled: 0, newContacts: 0, commsToday: 0 });
  const navigate = useNavigate();

  useEffect(() => { fetchTodayData(); }, []);
  async function fetchTodayData() { /* ... */ }
  async function completeTask(id: string) { /* ... */ }

  const priorityColors: Record<string, string> = { high: "bg-hp-red/20 text-hp-red", medium: "bg-hp-orange/20 text-hp-orange", low: "bg-hp-green/20 text-hp-green" };
  const typeIcons: Record<string, React.ElementType> = { email: Mail, call: Phone, meeting: Calendar, task: Activity };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  const totalItems = stats.tasksDue + stats.dealsStalled + stats.newContacts + stats.commsToday;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-3">
            <Sun className="w-7 h-7 text-primary" />Today
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <Badge variant="secondary" className="bg-primary/20 text-primary text-xs"><Zap className="w-3 h-3 mr-1" />{totalItems} items need attention</Badge>
      </div>

      {!totalItems && (
        <Card className="bg-hp-green/5 border-hp-green/20"><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-hp-green mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
          <p className="text-sm text-muted-foreground">No overdue tasks, stalled deals, or new activity today.</p>
        </CardContent></Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ icon: Clock, label: "Tasks Due", value: stats.tasksDue, color: "text-hp-red" }, { icon: GitBranch, label: "Stalled Deals", value: stats.dealsStalled, color: "text-hp-orange" }, { icon: User, label: "New Contacts", value: stats.newContacts, color: "text-hp-blue-light" }, { icon: Mail, label: "Communications", value: stats.commsToday, color: "text-primary" }].map((s) => (
          <Card key={s.label}><CardContent className="p-5"><s.icon className={`w-5 h-5 ${s.color} mb-3`} /><p className="text-2xl font-semibold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 text-hp-red" />Overdue Tasks</CardTitle></CardHeader><CardContent>{overdueTasks.map(task => { const Icon = typeIcons[task.type] || Activity; return (<div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border mb-2"><Icon className="w-4 h-4 text-muted-foreground" /><p className="text-sm text-foreground">{task.subject}</p><Button size="sm" onClick={() => completeTask(task.id)}>Done</Button></div>); })}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Today's Schedule</CardTitle></CardHeader><CardContent>{todayTasks.map(task => { const Icon = typeIcons[task.type] || Activity; return (<div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border mb-2"><Icon className="w-4 h-4 text-primary" /><p className="text-sm text-foreground">{task.subject}</p><Button size="sm" onClick={() => completeTask(task.id)}>Done</Button></div>); })}</CardContent></Card>
      </div>
    </div>
  );
}
