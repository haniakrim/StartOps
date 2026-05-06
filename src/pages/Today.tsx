import { useState, useEffect } from "react";
import {
  Sun,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  GitBranch,
  User,
  Activity,
  TrendingUp,
  ArrowRight,
  Loader2,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TodayTask {
  id: string;
  subject: string;
  type: string;
  due_date: string;
  priority: string;
  status: string;
  contacts: { first_name: string; last_name: string } | null;
  deals: { name: string } | null;
}

interface StalledDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  daysOld: number;
  contacts: { company: string | null } | null;
}

interface TodayContact {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  title: string | null;
  created_at: string;
}

interface TodayCommunication {
  id: string;
  type: string;
  subject: string | null;
  occurred_at: string;
  contacts: { first_name: string; last_name: string } | null;
  sentiment: string | null;
}

export default function Today() {
  const [loading, setLoading] = useState(true);
  const [overdueTasks, setOverdueTasks] = useState<TodayTask[]>([]);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [stalledDeals, setStalledDeals] = useState<StalledDeal[]>([]);
  const [newContacts, setNewContacts] = useState<TodayContact[]>([]);
  const [recentComms, setRecentComms] = useState<TodayCommunication[]>([]);
  const [stats, setStats] = useState({ tasksDue: 0, dealsStalled: 0, newContacts: 0, commsToday: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayData();
  }, []);

  async function fetchTodayData() {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      // Overdue tasks
      const { data: overdueData } = await supabase
        .from("activities")
        .select("id, subject, type, due_date, priority, status, contacts:contact_id (first_name, last_name), deals:deal_id (name)")
        .lt("due_date", today)
        .neq("status", "completed")
        .order("due_date", { ascending: true })
        .limit(10);

      setOverdueTasks((overdueData || []).map((d: any) => ({
        ...d,
        contacts: d.contacts?.[0] ?? null,
        deals: d.deals?.[0] ?? null,
      })));

      // Today's tasks
      const { data: todayData } = await supabase
        .from("activities")
        .select("id, subject, type, due_date, priority, status, contacts:contact_id (first_name, last_name), deals:deal_id (name)")
        .gte("due_date", today)
        .lt("due_date", new Date(Date.now() + 86400000).toISOString())
        .neq("status", "completed")
        .order("due_date", { ascending: true })
        .limit(10);

      setTodayTasks((todayData || []).map((d: any) => ({
        ...d,
        contacts: d.contacts?.[0] ?? null,
        deals: d.deals?.[0] ?? null,
      })));

      // Stalled deals (14+ days no progress)
      const { data: dealsData } = await supabase
        .from("deals")
        .select("id, name, value, stage, probability, created_at, contacts:contact_id (company)")
        .eq("status", "open")
        .lt("created_at", yesterday)
        .order("created_at", { ascending: true })
        .limit(5);

      setStalledDeals((dealsData || []).map((d: any) => ({
        ...d,
        daysOld: Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000),
        contacts: d.contacts?.[0] ?? null,
      })));

      // New contacts today
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, company, title, created_at")
        .gte("created_at", today)
        .order("created_at", { ascending: false })
        .limit(5);

      setNewContacts(contactsData || []);

      // Recent communications
      const { data: commsData } = await supabase
        .from("communications")
        .select("id, type, subject, occurred_at, contacts:contact_id (first_name, last_name), sentiment")
        .gte("occurred_at", yesterday)
        .order("occurred_at", { ascending: false })
        .limit(5);

      setRecentComms((commsData || []).map((d: any) => ({
        ...d,
        contacts: d.contacts?.[0] ?? null,
      })));

      setStats({
        tasksDue: (overdueData || []).length + (todayData || []).length,
        dealsStalled: (dealsData || []).length,
        newContacts: (contactsData || []).length,
        commsToday: (commsData || []).length,
      });
    } catch (error: any) {
      toast.error("Failed to load today's briefing: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(id: string) {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Task completed");
      fetchTodayData();
    } catch (error: any) {
      toast.error("Failed to complete task: " + error.message);
    }
  }

  const priorityColors: Record<string, string> = {
    high: "bg-[#be6464]/20 text-[#be6464]",
    medium: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
    low: "bg-[#8dc572]/20 text-[#8dc572]",
  };

  const typeIcons: Record<string, React.ElementType> = {
    email: Mail, call: Phone, meeting: Calendar, task: Activity,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  const totalItems = stats.tasksDue + stats.dealsStalled + stats.newContacts + stats.commsToday;
  const hasWork = totalItems > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <Sun className="w-7 h-7 text-[#f0ad4e]" />
            Today
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {new Date().toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-[#6452db]/20 text-[#6452db] text-xs">
            <Zap className="w-3 h-3 mr-1" />
            {totalItems} items need attention
          </Badge>
        </div>
      </div>

      {!hasWork && (
        <Card className="bg-[#8dc572]/5 border-[#8dc572]/20">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#8dc572] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
            <p className="text-sm text-white/50">No overdue tasks, stalled deals, or new activity today. Enjoy your day!</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Clock className="w-5 h-5 text-[#be6464] mb-3" />
            <p className="text-2xl font-semibold text-white">{stats.tasksDue}</p>
            <p className="text-sm text-white/50">Tasks Due</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <GitBranch className="w-5 h-5 text-[#f0ad4e] mb-3" />
            <p className="text-2xl font-semibold text-white">{stats.dealsStalled}</p>
            <p className="text-sm text-white/50">Stalled Deals</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <User className="w-5 h-5 text-[#5683da] mb-3" />
            <p className="text-2xl font-semibold text-white">{stats.newContacts}</p>
            <p className="text-sm text-white/50">New Contacts</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Mail className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">{stats.commsToday}</p>
            <p className="text-sm text-white/50">Communications</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#be6464]" />
                Overdue Tasks
              </CardTitle>
              <Badge variant="secondary" className="bg-[#be6464]/20 text-[#be6464] text-xs">
                {overdueTasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.length === 0 && (
                <p className="text-sm text-white/40 text-center py-6">No overdue tasks!</p>
              )}
              {overdueTasks.map((task) => {
                const Icon = typeIcons[task.type] || Activity;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{task.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority] || priorityColors.medium}`}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-white/30">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => completeTask(task.id)}
                      className="text-[#8dc572] hover:text-[#8dc572] hover:bg-[#8dc572]/10 h-8"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Done
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5683da]" />
                Today's Schedule
              </CardTitle>
              <Badge variant="secondary" className="bg-[#5683da]/20 text-[#5683da] text-xs">
                {todayTasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayTasks.length === 0 && (
                <p className="text-sm text-white/40 text-center py-6">Nothing scheduled for today</p>
              )}
              {todayTasks.map((task) => {
                const Icon = typeIcons[task.type] || Activity;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#5683da]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#5683da]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{task.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority] || priorityColors.medium}`}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-white/30">
                          {new Date(task.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => completeTask(task.id)}
                      className="text-[#8dc572] hover:text-[#8dc572] hover:bg-[#8dc572]/10 h-8"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Done
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stalled Deals */}
        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#f0ad4e]" />
                Deals Needing Follow-up
              </CardTitle>
              <Badge variant="secondary" className="bg-[#f0ad4e]/20 text-[#f0ad4e] text-xs">
                {stalledDeals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stalledDeals.length === 0 && (
                <p className="text-sm text-white/40 text-center py-6">All deals are progressing well</p>
              )}
              {stalledDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
                  onClick={() => navigate("/deals")}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f0ad4e]/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#f0ad4e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{deal.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40">{deal.contacts?.company || "No company"}</span>
                      <span className="text-xs text-white/30">·</span>
                      <span className="text-xs text-[#f0ad4e]">{deal.daysOld} days old</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">${(deal.value || 0).toLocaleString()}</p>
                    <p className="text-xs text-white/30">{deal.probability || 0}% probability</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Activity */}
        <Card className="bg-[#18191b] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#8dc572]" />
                New Today
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newContacts.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">New Contacts</p>
                  <div className="space-y-2">
                    {newContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
                        onClick={() => navigate("/contacts")}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#5683da] flex items-center justify-center text-white text-xs font-medium">
                          {contact.first_name[0]}{contact.last_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{contact.first_name} {contact.last_name}</p>
                          <p className="text-xs text-white/40">{contact.title || "No title"} · {contact.company || "No company"}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentComms.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Recent Communications</p>
                  <div className="space-y-2">
                    {recentComms.map((comm) => {
                      const Icon = typeIcons[comm.type] || Mail;
                      return (
                        <div
                          key={comm.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-white/40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{comm.subject || "No subject"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-white/40">
                                {comm.contacts ? `${comm.contacts.first_name} ${comm.contacts.last_name}` : "Unknown"}
                              </span>
                              <span className="text-xs text-white/30">·</span>
                              <span className="text-xs text-white/30 capitalize">{comm.type}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {newContacts.length === 0 && recentComms.length === 0 && (
                <p className="text-sm text-white/40 text-center py-6">No new activity today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}