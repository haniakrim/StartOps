import { useState, useCallback } from "react";

export const EXPENSE_CATEGORIES = [
  "software",
  "hardware",
  "office",
  "travel",
  "marketing",
  "salaries",
  "utilities",
  "other",
];

export function useExpenseCategorization() {
  const [categories, setCategories] = useState<string[]>([]);

  const categorize = useCallback((_description: string) => {
    setCategories(["uncategorized"]);
    return "uncategorized";
  }, []);

  return { categories, categorize };
}

export function suggestCategory(_description: string): string {
  return "other";
}

export async function getAISuggestion(_description: string): Promise<string> {
  return "other";
}
