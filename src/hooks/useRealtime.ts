import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeTable(
  table: string,
  onChange: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, deps);
}
