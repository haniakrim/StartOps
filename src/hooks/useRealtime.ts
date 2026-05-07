import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeTable(
  table: string,
  onChange: () => void,
  deps: any[] = [],
  organizationId?: string | null
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-realtime-${organizationId || "global"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          if (organizationId) {
            const newRecord = payload.new as Record<string, any>;
            const oldRecord = payload.old as Record<string, any>;
            const recordOrgId = newRecord?.organization_id || oldRecord?.organization_id;
            if (recordOrgId && recordOrgId !== organizationId) {
              return;
            }
          }
          onChangeRef.current();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [table, organizationId, ...deps]);
}