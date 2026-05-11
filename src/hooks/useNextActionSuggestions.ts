import { useState, useCallback } from "react";

export interface NextAction {
  id: string;
  title: string;
  type: "call" | "email" | "meeting" | "follow_up";
  priority: "high" | "medium" | "low";
  dueDate?: string;
}

export function useNextActionSuggestions(_dealId?: string) {
  const [actions, setActions] = useState<NextAction[]>([]);

  const generateSuggestions = useCallback(() => {
    setActions([]);
  }, []);

  return { actions, generateSuggestions };
}

export async function generateNextActions(_dealId: string): Promise<NextAction[]> {
  return [];
}
