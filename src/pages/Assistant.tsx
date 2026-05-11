import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, AlertCircle, Lightbulb, BarChart3, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";
import {
  callAI,
  buildCRMContext,
  CRM_SYSTEM_PROMPT,
  isAIConfigured,
} from "@/lib/ai";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "insight" | "warning" | "chart" | "ai";
  data?: any;
}

export default function Assistant() {
  const { organizationId } = useOrganization();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I'm your StartOps intelligence assistant. Ask me about your pipeline, contacts, revenue, deals, or operations.",
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAiAvailable(isAIConfigured());
  }, []);

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
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);
    const query = input.trim();
    setInput("");
    setLoading(true);

    try {
      if (aiAvailable) {
        const response = await processQueryWithAI(query);
        setMessages((prev) => [...prev, response]);
      } else {
        const response = await processQueryFallback(query);
        setMessages((prev) => [...prev, response]);
      }
    } catch (error: any) {
      try {
        const response = await processQueryFallback(query);
        setMessages((prev) => [...prev, { ...response, id: Date.now().toString() }]);
      } catch {
        toast.error("Failed to process query: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function processQueryWithAI(query: string): Promise<Message> {
    try {
      const context = await buildCRMContext(organizationId!);
      const response = await callAI(
        [
          { role: "system", content: CRM_SYSTEM_PROMPT },
          { role: "user", content: `Current business context:\n\n${context}\n\nUser question: ${query}` },
        ],
        { maxTokens: 1500, temperature: 0.7 }
      );

      let type: Message["type"] = "ai";
      if (response.toLowerCase().includes("risk") || response.toLowerCase().includes("warning")) {
        type = "warning";
      } else if (response.toLowerCase().includes("recommend") || response.toLowerCase().includes("suggestion")) {
        type = "insight";
      } else if (response.includes("$") && (response.toLowerCase().includes("forecast") || response.toLowerCase().includes("revenue"))) {
        type = "chart";
      }

      return { id: Date.now().toString(), role: "assistant", type, content: response };
    } catch (error: any) {
      console.error("AI processing failed:", error);
      toast.error("AI unavailable, using fallback analysis");
      throw error;
    }
  }

  async function processQueryFallback(query: string): Promise<Message> {
    const q = query.toLowerCase();

    if (q.includes("pipeline") || (q.includes("deals") && q.includes("summary"))) {
      const { data: deals } = await supabase
        .from("deals")
        .select("value, stage, status, probability")
        .eq("organization_id", organizationId);
      const total = deals?.reduce((s, d) => s + (d.value || 0), 0) || 0;
      const active = deals?.filter((d) => d.status === "open").length || 0;

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: "insight",
        content: `Your pipeline has **$${total.toLocaleString()}** across **${active} active deals**.`,
        data: { total, active },
      };
    }

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
        content: `**Weighted forecast: $${Math.round(weighted).toLocaleString()}**\n\nClosed-won: **$${won.toLocaleString()}**`,
        data: { weighted, won },
      };
    }

    if (q.includes("stuck") || q.includes("stall")) {
      const { data: deals } = await supabase
        .from("deals")
        .select("id, name, value, stage, created_at")
        .eq("organization_id", organizationId)
        .eq("status", "open");

      const stalled = (deals || []).filter((d: any) => {
        const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
        return days > 14;
      }).slice(0, 5);

      if (stalled.length === 0) {
        return { id: Date.now().toString(), role: "assistant", type: "insight", content: "No stalled deals detected." };
      }

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: "warning",
        content: `**${stalled.length} stalled deals**:\n\n${stalled.map((d: any) => `• ${d.name} — $${(d.value || 0).toLocaleString()}`).join("\n")}`,
      };
    }

    if (q.includes("health") || q.includes("risk")) {
      const { data: deals } = await supabase
        .from("deals")
        .select("value, stage, probability, status, created_at")
        .eq("organization_id", organizationId);

      const lowProb = deals?.filter((d) => d.status === "open" && (d.probability || 0) < 30).length || 0;
      const atRisk = deals?.filter((d) => d.status === "open" && d.stage === "negotiation" && (d.probability || 0) < 50).length || 0;

      return {
        id: Date.now().toString(),
        role: "assistant",
        type: lowProb > 0 || atRisk > 0 ? "warning" : "insight",
        content: `**Pipeline Health**:\n\n• ${lowProb} deals < 30% probability\n• ${atRisk} at-risk negotiation deals`,
      };
    }

    return {
      id: Date.now().toString(),
      role: "assistant",
      type: "text",
      content: `I can help with:\n\n• Pipeline summary\n• Revenue forecast\n• Stalled deals\n• Health check\n\n${aiAvailable ? "✨ AI enabled" : "Setup AI in Settings for smarter insights"}`,
    };
  }

  const suggestions = ["How's my pipeline?", "What deals are stuck?", "Revenue forecast?", "Pipeline health?"];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Assistant
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Ask questions about your business</p>
        </div>
        <Badge variant={aiAvailable ? "default" : "secondary"} className="flex items-center gap-1">
          {aiAvailable ? (
            <>
              <Sparkles className="w-3 h-3" />
              AI Enabled
            </>
          ) : (
            <>
              <Zap className="w-3 h-3" />
              <Link to="/ai-api-settings" className="hover:underline">Setup AI</Link>
            </>
          )}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                    : msg.type === "ai"
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {msg.type === "warning" && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {msg.type === "insight" && <Lightbulb className="w-4 h-4 text-emerald-500" />}
                    {msg.type === "chart" && <BarChart3 className="w-4 h-4 text-expo-blue" />}
                    {msg.type === "ai" && <Sparkles className="w-4 h-4 text-primary" />}
                    <span className={`text-xs font-medium ${
                      msg.role === "user" ? "text-primary-foreground/70" :
                      msg.type === "warning" ? "text-hp-red" :
                      msg.type === "insight" ? "text-hp-green" :
                      msg.type === "ai" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {msg.role === "user" ? "You" : "StartOps AI"}
                    </span>
                  </div>
                  <div className={`text-sm whitespace-pre-wrap ${msg.role === "user" ? "text-primary-foreground" : "text-foreground"}`}>
                    {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
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
              <CardContent className="p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-expo-blue animate-spin" />
                <span className="text-sm text-muted-foreground">{aiAvailable ? "AI thinking..." : "Analyzing..."}</span>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {messages.length === 1 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); setTimeout(() => handleSend({ preventDefault: () => {} } as React.FormEvent), 50); }}
                className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => { setInput("Draft a follow-up email for stalled deals"); setTimeout(() => handleSend({ preventDefault: () => {} } as React.FormEvent), 50); }}
              className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Draft email
            </button>
            <button
              onClick={() => { setInput("Best deal to focus on today?"); setTimeout(() => handleSend({ preventDefault: () => {} } as React.FormEvent), 50); }}
              className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" /> Priority deals
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={aiAvailable ? "Ask anything about your business..." : "Ask about pipeline, deals, revenue..."}
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
