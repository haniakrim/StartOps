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
import { AIForecast } from "@/components/dashboard/AIForecast";
import { AnomalyDetection } from "@/components/dashboard/AnomalyDetection";
import { GettingStarted } from "@/components/dashboard/GettingStarted";
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
      color: "#007AFF",
    },
    {
      title: "Active Deals",
      value: stats.activeDeals.toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: Target,
      color: "#5856D6",
    },
    {
      title: "Contacts",
      value: stats.totalContacts.toLocaleString(),
      change: "+24.1%",
      trend: "up" as const,
      icon: Users,
      color: "#AF52DE",
    },
    {
      title: "Companies",
      value: stats.totalCompanies.toString(),
      change: "-2.4%",
      trend: "down" as const,
      icon: Building2,
      color: "#34C759",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-expo-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Welcome back. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-expo-lg p-1">
          {(["week", "month", "quarter", "year"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? "bg-expo-blue text-white hover:bg-expo-blue/90 rounded-expo-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent rounded-expo-md"
              }
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <GettingStarted />

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

      {/* AI Forecasting & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIForecast />
        <AnomalyDetection />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopDeals deals={topDeals} />
        <RecentActivity items={recentActivity} />
      </div>
    </div>
  );
}
