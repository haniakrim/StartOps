import { useState, useCallback } from "react";

export interface EnrichmentSuggestion {
  field: string;
  value: string;
  source: string;
  confidence: number;
}

export function useContactEnrichment(_contactId?: string) {
  const [suggestions, setSuggestions] = useState<EnrichmentSuggestion[]>([]);

  const enrichContact = useCallback(() => {
    // Stub: would fetch enrichment data from an external API
    setSuggestions([]);
  }, []);

  return { suggestions, enrichContact };
}
