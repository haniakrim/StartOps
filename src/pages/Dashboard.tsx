import { useState } from "react";
import { Loader2, RefreshCw, DollarSign, Target, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardData, type DashboardTimeRange } from "@/hooks/useDashboardData";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { TopDeals } from "@/components/dashboard/TopDeals";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ExecutiveBriefing } from "@/components/dashboard/ExecutiveBriefing";
import { DealHealth } from "@/components/dashboard/DealHealth";
import { AIForecast } from "@/components/dashboard/AIForecast";
import { AnomalyDetection } from "@/components/dashboard/AnomalyDetection";
import { GettingStarted } from "@/components/dashboard/GettingStarted";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>("month");
  const { stats, recentActivity, topDeals, revenueData, pipelineData, loading, refetch } = useDashboardData(timeRange);

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: `${timeRange}`,
      trend: "up" as const,
      icon: DollarSign,
      color: "#0066B1",
    },
    {
      title: "Active Deals",
      value: stats.activeDeals.toString(),
      change: `${timeRange}`,
      trend: "up" as const,
      icon: Target,
      color: "#E63946",
    },
    {
      title: "Contacts",
      value: stats.totalContacts.toLocaleString(),
      change: `${timeRange}`,
      trend: "up" as const,
      icon: Users,
      color: "#00BFFF",
    },
    {
      title: "Companies",
      value: stats.totalCompanies.toString(),
      change: `${timeRange}`,
      trend: "down" as const,
      icon: Building2,
      color: "#0066B1",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-foreground tracking-tight">Dashboard</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Live CRM performance for the selected time range.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            {(["week", "month", "quarter", "year"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={
                  timeRange === range
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                }
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
        </div>
      </div>

      <GettingStarted />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart data={revenueData} />
        <PipelineChart data={pipelineData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExecutiveBriefing />
        <DealHealth />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIForecast />
        <AnomalyDetection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopDeals deals={topDeals} />
        <RecentActivity items={recentActivity} />
      </div>
    </div>
  );
}
