import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOrganization() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrg() {
      if (!user) {
        setOrganizationId(null);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setOrganizationId(data?.organization_id || null);
      } catch {
        setOrganizationId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOrg();
  }, [user]);

  return { organizationId, loading };
}
