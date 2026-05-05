import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  TrendingUp,
  Activity,
  DollarSign,
  Target,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalContacts: number;
  totalDeals: number;
  totalValue: number;
  openDeals: number;
  wonDeals: number;
  recentActivities: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalDeals: 0,
    totalValue: 0,
    openDeals: 0,
    wonDeals: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { count: contactsCount } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true });

      const { count: dealsCount } = await supabase
        .from("deals")
        .select("*", { count: "exact", head: true });

      const { data: deals } = await supabase.from("deals").select("value, status");

      const totalValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      const openDeals = deals?.filter((d) => d.status === "open").length || 0;
      const wonDeals = deals?.filter((d) => d.status === "won").length || 0;

      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalContacts: contactsCount || 0,
        totalDeals: dealsCount || 0,
        totalValue,
        openDeals,
        wonDeals,
        recentActivities: activities || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: Users,
      color: "#6452db",
      path: "/contacts",
    },
    {
      title: "Total Deals",
      value: stats.totalDeals,
      icon: Briefcase,
      color: "#5683da",
      path: "/deals",
    },
    {
      title: "Pipeline Value",
      value: `$${(stats.totalValue / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: "#ff8964",
      path: "/deals",
    },
    {
      title: "Open Deals",
      value: stats.openDeals,
      icon: Target,
      color: "#8dc572",
      path: "/deals",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6452db]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
        <p className="text-white/60 mt-1">Overview of your CRM performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-[#18191b] border-[#303236] cursor-pointer hover:border-[rgba(255,255,255,0.20)] transition-all"
            onClick={() => navigate(stat.path)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{stat.title}</p>
                  <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview */}
        <Card className="lg:col-span-2 bg-[#18191b] border-[#303236]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Pipeline Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: "Lead", count: Math.round(stats.totalDeals * 0.4), color: "#6452db", width: "40%" },
                { stage: "Qualified", count: Math.round(stats.totalDeals * 0.3), color: "#5683da", width: "30%" },
                { stage: "Proposal", count: Math.round(stats.totalDeals * 0.2), color: "#ff8964", width: "20%" },
                { stage: "Negotiation", count: Math.round(stats.totalDeals * 0.08), color: "#f0ad4e", width: "8%" },
                { stage: "Closed Won", count: stats.wonDeals, color: "#8dc572", width: `${stats.totalDeals > 0 ? (stats.wonDeals / stats.totalDeals * 100) : 0}%` },
              ].map((item) => (
                <div key={item.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/85">{item.stage}</span>
                    <span className="text-white/60">{item.count} deals</span>
                  </div>
                  <div className="h-2 bg-[#0b0d10] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ backgroundColor: item.color, width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#18191b] border-[#303236]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6452db]/20 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-[#6452db]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white/85 truncate">{activity.subject}</p>
                      <p className="text-xs text-white/45 mt-0.5">{activity.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-sm text-white/45">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="bg-[#18191b] border-[#303236] cursor-pointer hover:border-[#6452db]/50 transition-all"
          onClick={() => navigate("/contacts")}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#6452db]" />
            </div>
            <div>
              <p className="text-white font-medium">Add Contact</p>
              <p className="text-sm text-white/60">Create a new lead or customer</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-[#18191b] border-[#303236] cursor-pointer hover:border-[#ff8964]/50 transition-all"
          onClick={() => navigate("/deals")}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#ff8964]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#ff8964]" />
            </div>
            <div>
              <p className="text-white font-medium">New Deal</p>
              <p className="text-sm text-white/60">Track a new opportunity</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-[#18191b] border-[#303236] cursor-pointer hover:border-[#8dc572]/50 transition-all"
          onClick={() => navigate("/workflows")}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#8dc572]/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#8dc572]" />
            </div>
            <div>
              <p className="text-white font-medium">Automation</p>
              <p className="text-sm text-white/60">Set up workflow rules</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
