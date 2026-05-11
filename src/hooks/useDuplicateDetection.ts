import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DuplicateContact {
  id: string;
  name: string;
  email: string;
  score: number;
}

export function useDuplicateDetection() {
  const [duplicates, setDuplicates] = useState<DuplicateContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const scan = useCallback(async (organizationId: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, email")
        .eq("organization_id", organizationId);

      const seen = new Map<string, { id: string; name: string; email: string }>();
      const dups: DuplicateContact[] = [];

      for (const c of data || []) {
        const key = (c.email || "").toLowerCase().trim();
        if (!key) continue;
        if (seen.has(key)) {
          const existing = seen.get(key)!;
          dups.push({
            id: `${existing.id},${c.id}`,
            name: `${existing.name} / ${c.first_name} ${c.last_name}`,
            email: key,
            score: 90,
          });
        } else {
          seen.set(key, {
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            email: key,
          });
        }
      }

      setDuplicates(dups);
      setScanned(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeDuplicate = useCallback(async (_id: string) => {
    setDuplicates((prev) => prev.filter((d) => d.id !== _id));
  }, []);

  const dismissDuplicate = useCallback((_id: string) => {
    setDuplicates((prev) => prev.filter((d) => d.id !== _id));
  }, []);

  return { duplicates, loading, scanned, scan, mergeDuplicate, dismissDuplicate };
}
