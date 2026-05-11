import { useAuth } from "@/contexts/AuthContext";

// AuthContext already fetches organization_id during session init.
// This hook simply exposes it to avoid duplicate Supabase queries
// and the transient "null" state that causes "organization not found" flashes.
export function useOrganization() {
  const { organizationId, loading } = useAuth();
  return { organizationId, loading, error: null };
}
