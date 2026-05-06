import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeDeals: 0,
    totalContacts: 0,
    totalCompanies: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("value, stage, status");

      if (dealsError) throw dealsError;

      const totalRevenue =
        dealsData?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      const activeDeals =
        dealsData?.filter(
          (d) => d.status === "open" && !d.stage?.startsWith("closed")
        ).length || 0;

      const { count: contactsCount, error: contactsError } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true });

      if (contactsError) throw contactsError;

      const { data: companiesData, error: companiesError } = await supabase
        .from("contacts")
        .select("company");

      if (companiesError) throw companiesError;

      const distinctCompanies = new Set(
        (companiesData || []).map((c) => c.company).filter(Boolean)
      ).size;

      setStats({
        totalRevenue,
        activeDeals,
        totalContacts: contactsCount || 0,
        totalCompanies: distinctCompanies,
      });

      const { data: activityData, error: activityError } = await supabase
        .from("activities")
        .select(
          `
          id,
          type,
          subject,
          created_at,
          contacts:contact_id (first_name, last_name),
          deals:deal_id (name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (activityError) throw activityError;
      setRecentActivity(
        (activityData || []).map((d: any) => ({
          ...d,
          contacts: d.contacts ?? null,
          deals: d.deals ?? null,
        }))
      );

      const { data: topDealsData, error: topDealsError } = await supabase
        .from("deals")
        .select(
          `
          id,
          name,
          value,
          stage,
          probability,
          contacts:contact_id (company)
        `
        )
        .eq("status", "open")
        .order("value", { ascending: false })
        .limit(5);

      if (topDealsError) throw topDealsError;
      setTopDeals(
        (topDealsData || []).map((d: any) => ({
          ...d,
          contacts: d.contacts ?? null,
        }))
      );
    } catch (error: any) {
      toast.error("Failed to load dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return { stats, recentActivity, topDeals, loading };
}