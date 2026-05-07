import { createContext, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    let mounted = true;

    async function fetchUserData(userId: string) {
      try {
        const [{ data: profileData, error: profileError }, { data: membershipData, error: membershipError }] =
          await Promise.all([
            supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
            supabase
              .from("organization_members")
              .select("organization_id")
              .eq("user_id", userId)
              .maybeSingle(),
          ]);

        if (profileError) throw profileError;
        if (membershipError) throw membershipError;

        if (mounted) {
          setProfile(profileData);
          setOrganizationId(membershipData?.organization_id ?? null);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        if (mounted) {
          setProfile(null);
          setOrganizationId(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
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

      if (currentUser) {
        fetchUserData(currentUser.id);
      } else {
        setProfile(null);
        setOrganizationId(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, organizationId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}