import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";

export type DashboardTimeRange = "week" | "month" | "quarter" | "year";

export interface ActivityItem {
  id: string;
  type: string;
  subject: string;
  created_at: string;
  contacts: { first_name: string; last_name: string } | null;
  deals: { name: string } | null;
}

export interface TopDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  contacts: { company: string | null } | null;
}

export interface DashboardStats {
  totalRevenue: number;
  activeDeals: number;
  totalContacts: number;
  totalCompanies: number;
}

export interface DashboardChartPoint {
  name: string;
  value: number;
}

function getRangeBounds(range: DashboardTimeRange) {
  const end = new Date();
  const start = new Date();

  if (range === "week") {
    start.setDate(end.getDate() - 7);
  } else if (range === "month") {
    start.setMonth(end.getMonth() - 1);
  } else if (range === "quarter") {
    start.setMonth(end.getMonth() - 3);
  } else {
    start.setFullYear(end.getFullYear() - 1);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function buildRevenueData(
  deals: Array<{ created_at: string; value: number | null }>,
  range: DashboardTimeRange
): DashboardChartPoint[] {
  if (range === "week") {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = new Map<string, number>();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const label = dayLabels[date.getDay()];
      buckets.set(label, 0);
    }

    deals.forEach((deal) => {
      const label = dayLabels[new Date(deal.created_at).getDay()];
      buckets.set(label, (buckets.get(label) || 0) + (deal.value || 0));
    });

    return Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));
  }

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const buckets = new Map<string, number>();

  const monthsToShow = range === "month" ? 3 : range === "quarter" ? 4 : 12;
  for (let index = monthsToShow - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const label = monthLabels[date.getMonth()];
    buckets.set(label, 0);
  }

  deals.forEach((deal) => {
    const label = monthLabels[new Date(deal.created_at).getMonth()];
    if (buckets.has(label)) {
      buckets.set(label, (buckets.get(label) || 0) + (deal.value || 0));
    }
  });

  return Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));
}

function buildPipelineData(
  deals: Array<{ stage: string | null }>
): DashboardChartPoint[] {
  const orderedStages = ["lead", "qualified", "proposal", "negotiation", "closed-won"];
  const stageLabels: Record<string, string> = {
    lead: "Lead",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    "closed-won": "Closed Won",
  };

  const counts = new Map<string, number>();
  orderedStages.forEach((stage) => counts.set(stage, 0));

  deals.forEach((deal) => {
    const stage = deal.stage || "lead";
    if (counts.has(stage)) {
      counts.set(stage, (counts.get(stage) || 0) + 1);
    }
  });

  return orderedStages.map((stage) => ({
    name: stageLabels[stage],
    value: counts.get(stage) || 0,
  }));
}

export function useDashboardData(timeRange: DashboardTimeRange = "month") {
  const { organizationId } = useOrganization();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeDeals: 0,
    totalContacts: 0,
    totalCompanies: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [revenueData, setRevenueData] = useState<DashboardChartPoint[]>([]);
  const [pipelineData, setPipelineData] = useState<DashboardChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!organizationId) {
      setStats({ totalRevenue: 0, activeDeals: 0, totalContacts: 0, totalCompanies: 0 });
      setRecentActivity([]);
      setTopDeals([]);
      setRevenueData([]);
      setPipelineData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { start, end } = getRangeBounds(timeRange);

      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("id, name, value, stage, status, probability, created_at, contacts:contact_id (company)")
        .eq("organization_id", organizationId)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false });

      if (dealsError) throw dealsError;

      const normalizedDeals = (dealsData || []).map((deal: any) => ({
        ...deal,
        contacts: Array.isArray(deal.contacts) ? deal.contacts[0] ?? null : deal.contacts ?? null,
      }));

      const totalRevenue = normalizedDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const activeDeals = normalizedDeals.filter(
        (deal) => deal.status === "open" && !deal.stage?.startsWith("closed")
      ).length;

      const { count: contactsCount, error: contactsError } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .gte("created_at", start)
        .lte("created_at", end);

      if (contactsError) throw contactsError;

      const { data: companiesData, error: companiesError } = await supabase
        .from("contacts")
        .select("company")
        .eq("organization_id", organizationId)
        .gte("created_at", start)
        .lte("created_at", end)
        .not("company", "is", null);

      if (companiesError) throw companiesError;

      const distinctCompanies = new Set(
        (companiesData || []).map((company) => company.company).filter(Boolean)
      ).size;

      setStats({
        totalRevenue,
        activeDeals,
        totalContacts: contactsCount || 0,
        totalCompanies: distinctCompanies,
      });

      const { data: activityData, error: activityError } = await supabase
        .from("activities")
        .select(`
          id,
          type,
          subject,
          created_at,
          contacts:contact_id (first_name, last_name),
          deals:deal_id (name)
        `)
        .eq("organization_id", organizationId)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false })
        .limit(5);

      if (activityError) throw activityError;

      setRecentActivity(
        (activityData || []).map((activity: any) => ({
          ...activity,
          contacts: Array.isArray(activity.contacts) ? activity.contacts[0] ?? null : activity.contacts ?? null,
          deals: Array.isArray(activity.deals) ? activity.deals[0] ?? null : activity.deals ?? null,
        }))
      );

      setTopDeals(
        normalizedDeals
          .filter((deal) => deal.status === "open")
          .sort((a, b) => (b.value || 0) - (a.value || 0))
          .slice(0, 5)
      );

      setRevenueData(buildRevenueData(normalizedDeals, timeRange));
      setPipelineData(buildPipelineData(normalizedDeals));
    } catch (error: any) {
      toast.error("Failed to load dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentActivity,
    topDeals,
    revenueData,
    pipelineData,
    loading,
    refetch: fetchDashboardData,
  };
}
