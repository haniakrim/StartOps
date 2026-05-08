import { useState, useEffect, useCallback } from "react";
import { Sun, Clock, AlertCircle, CheckCircle2, Calendar, Phone, Mail, GitBranch, User, Activity, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";

interface QuickTask { id: string; subject: string; type: string; due_date: string; priority: string; status: string; contacts: { first_name: string; last_name: string } | null; }
interface QuickDeal { id: string; name: string; value: number; stage: string; probability: number; daysOld: number; contacts: { company: string | null } | null; }
interface QuickContact { id: string; first_name: string; last_name: string; company: string | null; created_at: string; }

export default function Today() {
  const { organizationId } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [overdueTasks, setOverdueTasks] = useState<QuickTask[]>([]);
  const [todayTasks, setTodayTasks] = useState<QuickTask[]>([]);
  const [stalledDeals, setStalledDeals] = useState<QuickDeal[]>([]);
  const [newContacts, setNewContacts] = useState<QuickContact[]>([]);
  const [stats, setStats] = useState({ tasksDue: 0, dealsStalled: 0, newContacts: 0 });
  const navigate = useNavigate();

  const fetchTodayData = useCallback(async () => {
    if (!organizationId) { setLoading(false); return; }
    try {
      setLoading(true);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      const overdueCutoff = new Date(now.getTime() - 30 * 86400000).toISOString(); // 30 days

      const [tasksRes, dealsRes, contactsRes] = await Promise.all([
        supabase.from("activities")
          .select("id,subject,type,due_date,priority,status,contacts:contact_id(first_name,last_name)")
          .eq("organization_id", organizationId)
          .eq("status", "pending")
          .order("due_date", { ascending: true })
          .limit(10),
        supabase.from("deals")
          .select("id,name,value,stage,probability,created_at,contacts:contact_id(company)")
          .eq("organization_id", organizationId)
          .eq("status", "open")
          .order("created_at", { ascending: true })
          .limit(5),
        supabase.from("contacts")
          .select("id,first_name,last_name,company,created_at")
          .eq("organization_id", organizationId)
          .gte("created_at", startOfDay)
          .lte("created_at", endOfDay)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const tasks = ((tasksRes.data || []).map((d: any) => ({ ...d, contacts: d.contacts?.[0] ?? null })) as QuickTask[]);
      const overdue = tasks.filter((t: any) => t.due_date && new Date(t.due_date) < now);
      const today = tasks.filter((t: any) => t.due_date && new Date(t.due_date) >= new Date(startOfDay) && new Date(t.due_date) < new Date(endOfDay));

      setOverdueTasks(overdue);
      setTodayTasks(today.length ? today : tasks.slice(0, 5));

      const deals = (dealsRes.data || []).map((d: any) => ({
        ...d,
        daysOld: Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000),
        contacts: d.contacts?.[0] ?? null,
      }));
      setStalledDeals(deals.filter((d: any) => d.daysOld > 14).slice(0, 5));

      setNewContacts((contactsRes.data || []) as QuickContact[]);

      setStats({
        tasksDue: overdue.length,
        dealsStalled: deals.filter((d: any) => d.daysOld > 14).length,
        newContacts: (contactsRes.data || []).length,
      });
    } catch (error: any) {
      toast.error("Failed to load today's data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  async function completeTask(id: string) {
    try {
      const { error } = await supabase.from("activities").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      toast.success("Task completed");
      fetchTodayData();
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    }
  }

  const priorityColors: Record<string, string> = {
    high: "bg-red-500/20 text-red-500",
    medium: "bg-orange-500/20 text-orange-500",
    low: "bg-emerald-500/20 text-emerald-500",
  };

  const typeIcons: Record<string, React.ElementType> = {
    email: Mail,
    call: Phone,
    meeting: Calendar,
    task: Activity,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const totalItems = stats.tasksDue + stats.dealsStalled + stats.newContacts;

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
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground">No overdue tasks, stalled deals, or new activity today.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Clock, label: "Tasks Due", value: stats.tasksDue, color: "text-red-500" },
          { icon: GitBranch, label: "Stalled Deals", value: stats.dealsStalled, color: "text-orange-500" },
          { icon: User, label: "New Contacts", value: stats.newContacts, color: "text-blue-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No overdue tasks</p>}
            {overdueTasks.map((task) => {
              const Icon = typeIcons[task.type] || Activity;
              return (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{task.subject}</p>
                    {task.contacts && <p className="text-xs text-muted-foreground">{task.contacts.first_name} {task.contacts.last_name}</p>}
                  </div>
                  <Button size="sm" onClick={() => completeTask(task.id)}>Done</Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>}
            {todayTasks.map((task) => {
              const Icon = typeIcons[task.type] || Activity;
              return (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{task.subject}</p>
                    <p className="text-xs text-muted-foreground">{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</p>
                  </div>
                  <Button size="sm" onClick={() => completeTask(task.id)}>Done</Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-orange-500" />
              Stalled Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stalledDeals.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No stalled deals</p>}
            {stalledDeals.map((deal) => (
              <div key={deal.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border mb-2 cursor-pointer hover:border-primary/30" onClick={() => navigate("/deals")}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{deal.name}</p>
                  <p className="text-xs text-muted-foreground">${(deal.value || 0).toLocaleString()} · {deal.stage} · {deal.daysOld} days old</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              New Contacts Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newContacts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No new contacts today</p>}
            {newContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border mb-2 cursor-pointer hover:border-primary/30" onClick={() => navigate("/contacts")}>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs text-primary">{contact.first_name?.[0]}{contact.last_name?.[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{contact.first_name} {contact.last_name}</p>
                  <p className="text-xs text-muted-foreground">{contact.company || "No company"}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
