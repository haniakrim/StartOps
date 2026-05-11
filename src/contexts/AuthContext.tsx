import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any;
  profile: any;
  organizationId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  organizationId: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchUserData = useCallback(async (userId: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const [{ data: profileData, error: profileError }, { data: membershipData, error: membershipError }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", userId)
            .limit(1),
        ]);

      if (profileError) {
        console.log("[AuthContext] profile error:", profileError);
      }
      if (membershipError) {
        console.log("[AuthContext] membership error:", membershipError);
      }

      setProfile(profileData || null);

      let orgId = membershipData?.[0]?.organization_id ?? null;

      // Auto-create a personal organization if user has none
      if (!orgId && supabase?.from) {
        try {
          const { data: newOrg, error: orgError } = await supabase
            .from("organizations")
            .insert({ name: "My Organization" })
            .select("id")
            .single();

          if (!orgError && newOrg?.id) {
            await supabase
              .from("organization_members")
              .insert({ user_id: userId, organization_id: newOrg.id, role: "admin" });
            orgId = newOrg.id;
          }
        } catch (err) {
          console.log("[AuthContext] Auto-org creation skipped:", err);
        }
      }

      setOrganizationId(orgId);
    } catch (err: any) {
      console.error("[AuthContext] Failed to fetch user data:", err);
      setProfile(null);
      setOrganizationId(null);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!supabase.auth) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchUserData(currentUser.id);
      } else {
        setProfile(null);
        setOrganizationId(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        fetchUserData(currentUser.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setOrganizationId(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, [fetchUserData]);

  const signOut = async () => {
    await supabase.auth?.signOut?.();
  };

  return (
    <AuthContext.Provider value={{ user, profile, organizationId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
