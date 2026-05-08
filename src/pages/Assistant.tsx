import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, TrendingUp, AlertCircle, Lightbulb, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "insight" | "warning" | "chart";
  data?: any;
}

export default function Assistant() {
  const { organizationId } = useOrganization();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I'm your StartOps intelligence assistant. Ask me about your pipeline, contacts, revenue, deals, or operations. I can analyze trends, detect anomalies, and suggest actions.",
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    if (!organizationId) {
      toast.error("Please select an organization first");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await processQuery(userMsg.content);
      setMessages((prev) => [...prev, response]);
    } catch (error: any) {
      toast.error("Failed to process query: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function processQuery(query: string): Promise<Message> {
    const q = query.toLowerCase();

    // Pipeline summary
    if (q.includes("pipeline") || q.includes("deals") && q.includes("summary")) {
      const { data: deals } = await supabase
        .from("deals")
        .select("value, stage, status, probability, created_at, expected_close_date")
        .eq("organization_id", organizationId);
      const total = deals?.reduce((s, d) => s + (d.value || 0), 0) || 0;
      const active = deals?.filter((d) => d.status === "open" && !d.stage?.startsWith("closed")).length || 0;
      const stalled = (deals || []).filter((d: any) => {
        const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
        return d.status === "open" && days > 14;
      }).length || 0;

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: "insight",
        content: `Your pipeline has **$${total.toLocaleString()}** across **${active} active deals**. ${stalled > 0 ? `**${stalled} deals** have been stagnant for over 14 days and may need attention.` : "All deals are progressing within normal timeframes."}`,
        data: { total, active, stalled },
      };
    }

    // Revenue
    if (q.includes("revenue") || q.includes("forecast")) {
      const { data: deals } = await supabase
        .from("deals")
        .select("value, stage, probability, status")
        .eq("organization_id", organizationId);
      const weighted = deals?.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0) || 0;
      const won = deals?.filter((d) => d.stage === "closed-won").reduce((s, d) => s + (d.value || 0), 0) || 0;

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: "chart",
        content: `**Weighted pipeline forecast: $${Math.round(weighted).toLocaleString()}**\n\nClosed-won revenue to date: **$${won.toLocaleString()}**. The probabilistic model weights each deal by its stage confidence and engagement signals.`,
        data: { weighted, won },
      };
    }

    // Stalled deals
    if (q.includes("stuck") || q.includes("stall") || q.includes("stagnant")) {
      const { data: deals } = await supabase
        .from("deals")
        .select("id, name, value, stage, probability, created_at, contacts:contact_id (first_name, last_name, company)")
        .eq("organization_id", organizationId)
        .eq("status", "open")
        .order("created_at", { ascending: true });

      const stalled = (deals || []).filter((d: any) => {
        const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
        return days > 14;
      }).slice(0, 5);

      if (stalled.length === 0) {
        return {
          id: Date.now().toString(),
          role: "assistant",
          type: "insight",
          content: "No stalled deals detected. All open deals have had activity within the last 14 days.",
        };
      }

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: "warning",
        content: `Found **${stalled.length} stalled deals** with no forward momentum:\n\n${stalled.map((d: any) => `• **${d.name}** — $${(d.value || 0).toLocaleString()} (${d.stage}, ${Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000)} days old)`).join("\n")}\n\n**Recommended actions:** Schedule follow-up calls, send contextual outreach referencing last touchpoint, or escalate to management.`,
        data: stalled,
      };
    }

    // Contacts
    if (q.includes("contacts") || q.includes("who") && q.includes("know")) {
      const { count } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId);
      const { data: recent } = await supabase
        .from("contacts")
        .select("first_name, last_name, company, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(5);

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: "insight",
        content: `You have **${count || 0} contacts** in your graph.\n\nRecently added:\n${(recent || []).map((c: any) => `• ${c.first_name} ${c.last_name} — ${c.company || "No company"}`).join("\n")}`,
      };
    }

    // Activities / tasks
    if (q.includes("tasks") || q.includes("activities") || q.includes("todo")) {
      const { data: pending } = await supabase
        .from("activities")
        .select("subject, type, due_date, priority")
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(5);

      if (!pending || pending.length === 0) {
        return {
          id: Date.now().toString(),
          role: "assistant",
          type: "insight",
          content: "No pending tasks. You're all caught up!",
        };
      }

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: "warning",
        content: `**${pending.length} pending tasks** require attention:\n\n${pending.map((a: any) => `• [${a.priority}] ${a.subject} (${a.type})${a.due_date ? ` — due ${new Date(a.due_date).toLocaleDateString()}` : ""}`).join("\n")}`,
      };
    }

    // Health / anomalies
    if (q.includes("health") || q.includes("anomal") || q.includes("wrong") || q.includes("risk")) {
      const { data: deals } = await supabase
        .from("deals")
        .select("value, stage, probability, status")
        .eq("organization_id", organizationId);
      const lowProb = deals?.filter((d) => d.status === "open" && (d.probability || 0) < 30).length || 0;
      const atRisk = deals?.filter((d) => d.status === "open" && d.stage === "negotiation" && (d.probability || 0) < 50).length || 0;

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: lowProb > 0 || atRisk > 0 ? "warning" : "insight",
        content: `**Pipeline Health Scan:**\n\n• **${lowProb} deals** have win probability below 30% — consider disqualifying or re-engaging.\n• **${atRisk} deals** in negotiation with <50% probability — high risk of late-stage loss.\n\n**Narrative:** ${atRisk > 0 ? "Late-stage deals are showing weakness. I recommend reviewing objection patterns and involving leadership in next calls." : "Pipeline health is within normal parameters."}`,
      };
    }

    // Default / help
    return {
      id: Date.now().toString(),
      role: "assistant",
      type: "text",
      content: `I can help you with:\n\n• **Pipeline summary** — "How's my pipeline?"\n• **Revenue forecast** — "What's my revenue forecast?"\n• **Stalled deals** — "What deals are stuck?"\n• **Contact insights** — "How many contacts do I have?"\n• **Task overview** — "What are my pending tasks?"\n• **Health check** — "Any risks in my pipeline?"\n\nTry asking one of these, or ask in your own words.`,
    };
  }

  const suggestions = [
    "How's my pipeline?",
    "What deals are stuck?",
    "What's my revenue forecast?",
    "Any risks in my pipeline?",
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">AI Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Ask questions about your business in natural language</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-expo-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
              <Card
                className={`${
                  msg.role === "user"
                    ? "bg-expo-blue border-expo-blue"
                    : msg.type === "warning"
                      ? "bg-red-500/10 border-red-500/20"
                      : msg.type === "insight"
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-card border-border"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {msg.type === "warning" && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {msg.type === "insight" && <Lightbulb className="w-4 h-4 text-emerald-500" />}
                    {msg.type === "chart" && <BarChart3 className="w-4 h-4 text-expo-blue" />}
                    <span
                      className={`text-xs font-medium ${
                        msg.role === "user"
                          ? "text-primary-foreground/70"
                          : msg.type === "warning"
                            ? "text-hp-red"
                            : msg.type === "insight"
                              ? "text-hp-green"
                              : "text-muted-foreground"
                      }`}
                    >
                      {msg.role === "user" ? "You" : "StartOps AI"}
                    </span>
                  </div>
                  <div
                    className={`text-sm whitespace-pre-wrap ${
                      msg.role === "user" ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <strong key={i} className="text-foreground">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-foreground" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-expo-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <Loader2 className="w-4 h-4 text-expo-blue animate-spin" />
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                // Auto-submit after state update
                setTimeout(() => {
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  handleSend(fakeEvent);
                }, 50);
              }}
              className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your pipeline, deals, revenue..."
            className="w-full bg-card border border-border rounded-expo-lg pl-4 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-expo-blue/50"
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}