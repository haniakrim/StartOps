import { useState, useEffect, useRef } from "react";
import { Search, X, User, GitBranch, Building2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  type: "contact" | "deal" | "company";
  title: string;
  subtitle: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => performSearch(query), 200);
    return () => clearTimeout(timeout);
  }, [query]);

  async function performSearch(q: string) {
    try {
      setLoading(true);
      const term = `%${q}%`;

      const [contactsRes, dealsRes, companiesRes] = await Promise.all([
        supabase
          .from("contacts")
          .select("id, first_name, last_name, company, email")
          .or(`first_name.ilike.${term},last_name.ilike.${term},company.ilike.${term},email.ilike.${term}`)
          .limit(5),
        supabase
          .from("deals")
          .select("id, name, stage")
          .ilike("name", term)
          .limit(5),
        supabase
          .from("companies")
          .select("id, name, industry")
          .or(`name.ilike.${term},industry.ilike.${term}`)
          .limit(5),
      ]);

      const mapped: SearchResult[] = [
        ...(contactsRes.data || []).map((c) => ({
          id: c.id,
          type: "contact" as const,
          title: `${c.first_name} ${c.last_name}`,
          subtitle: c.company || c.email || "No company",
        })),
        ...(dealsRes.data || []).map((d) => ({
          id: d.id,
          type: "deal" as const,
          title: d.name,
          subtitle: d.stage,
        })),
        ...(companiesRes.data || []).map((c) => ({
          id: c.id,
          type: "company" as const,
          title: c.name,
          subtitle: c.industry || "No industry",
        })),
      ];

      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function navigateTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    if (result.type === "contact") navigate(`/contacts`);
    else if (result.type === "deal") navigate(`/deals`);
    else if (result.type === "company") navigate(`/companies`);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl bg-[#18191b] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts, deals, companies..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white/40 bg-white/5 border border-white/10">
              ESC
            </kbd>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && query.trim() && !loading && (
            <div className="py-8 text-center text-sm text-white/40">
              No results found for "{query}"
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, i) => {
                const Icon =
                  result.type === "contact"
                    ? User
                    : result.type === "deal"
                      ? GitBranch
                      : Building2;
                return (
                  <button
                    key={`${result.type}-${result.id}-${i}`}
                    onClick={() => navigateTo(result)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-white/40 capitalize">
                        {result.type} · {result.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20" />
                  </button>
                );
              })}
            </div>
          )}

          {query.trim() === "" && (
            <div className="py-6 px-4 text-center">
              <p className="text-sm text-white/30">
                Type to search across your workspace
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <kbd className="px-2 py-1 rounded text-[10px] text-white/40 bg-white/5 border border-white/10">
                  ⌘K
                </kbd>
                <span className="text-xs text-white/30">to toggle</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}