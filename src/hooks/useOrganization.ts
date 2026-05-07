import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOrganization() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrg() {
      if (!user) {
        setOrganizationId(null);
        setLoading(false);
        return;
      }
      try {
        setError(null);
        // Use limit(1) instead of maybeSingle to avoid "multiple rows" warning being treated as error
        const { data, error: queryError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .limit(1);

        if (queryError) {
          console.error("[useOrganization] query error:", queryError);
          setError(queryError.message);
          setOrganizationId(null);
          return;
        }

        const orgId = data?.[0]?.organization_id || null;
        console.log("[useOrganization] found orgId:", orgId);
        setOrganizationId(orgId);
      } catch (err: any) {
        console.error("[useOrganization] catch error:", err);
        setError(err.message);
        setOrganizationId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOrg();
  }, [user]);

  return { organizationId, loading, error };
}