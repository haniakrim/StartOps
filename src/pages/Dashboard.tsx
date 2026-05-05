import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { TopDeals } from "@/components/dashboard/TopDeals";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ExecutiveBriefing } from "@/components/dashboard/ExecutiveBriefing";
import { DealHealth } from "@/components/dashboard/DealHealth";
import {
  DollarSign,
  Target,
  Users,
  Building2,
} from "lucide-react";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("month");
  const { stats, recentActivity, topDeals, loading } = useDashboardData();

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "#ff8964",
    },
    {
      title: "Active Deals",
      value: stats.activeDeals.toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: Target,
      color: "#5683da",
    },
    {
      title: "Contacts",
      value: stats.totalContacts.toLocaleString(),
      change: "+24.1%",
      trend: "up" as const,
      icon: Users,
      color: "#6452db",
    },
    {
      title: "Companies",
      value: stats.totalCompanies.toString(),
      change: "-2.4%",
      trend: "down" as const,
      icon: Building2,
      color: "#8dc572",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Welcome back. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month", "quarter", "year"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? "bg-[#6452db] text-white hover:bg-[#6452db]/90"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart />
        <PipelineChart />
      </div>

      {/* AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExecutiveBriefing />
        <DealHealth />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopDeals deals={topDeals} />
        <RecentActivity items={recentActivity} />
      </div>
    </div>
  );
}