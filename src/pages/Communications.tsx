import { useState, useEffect, useCallback } from "react";
import {
  Mail, Phone, MessageSquare, BrainCircuit, TrendingUp, TrendingDown,
  Minus, Search, Filter, Plus, Loader2, Clock, User, Building2, Download, Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";

interface Communication {
  id: string;
  type: string;
  direction: string;
  subject: string | null;
  content: string | null;
  summary: string | null;
  sentiment: string | null;
  extracted_data: any;
  occurred_at: string;
  contact_id: string | null;
  deal_id: string | null;
  contacts: { first_name: string; last_name: string; company: string | null } | null;
  deals: { name: string } | null;
}

const sentimentConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  positive: { icon: TrendingUp, color: "#8dc572", label: "Positive" },
  negative: { icon: TrendingDown, color: "#be6464", label: "Negative" },
  neutral: { icon: Minus, color: "#5683da", label: "Neutral" },
};

const typeIcons: Record<string, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: MessageSquare,
  note: MessageSquare,
};

export default function Communications() {
  const { organizationId } = useOrganization();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, neutral: 0 });

  const [newComm, setNewComm] = useState({
    type: "email",
    direction: "outbound",
    subject: "",
    content: "",
    contact_id: "",
    deal_id: "",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const fetchCommunications = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      setCommunications([]);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("organization_id", organizationId)
        .order("occurred_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch contacts and deals for lookup
      const [{ data: contactsData }, { data: dealsData }] = await Promise.all([
        supabase.from("contacts").select("id, first_name, last_name, company").eq("organization_id", organizationId),
        supabase.from("deals").select("id, name").eq("organization_id", organizationId),
      ]);

      const contactsMap = new Map((contactsData || []).map((c: any) => [c.id, c]));
      const dealsMap = new Map((dealsData || []).map((d: any) => [d.id, d]));

      const mapped: Communication[] = (data || []).map((d: any) => {
        const contact = d.contact_id ? contactsMap.get(d.contact_id) : null;
        const deal = d.deal_id ? dealsMap.get(d.deal_id) : null;
        return {
          ...d,
          contacts: contact ? { first_name: contact.first_name, last_name: contact.last_name, company: contact.company } : null,
          deals: deal ? { name: deal.name } : null,
        };
      });

      setCommunications(mapped);

      const sentiments = mapped.reduce((acc: any, c) => {
        acc[c.sentiment || "neutral"] = (acc[c.sentiment || "neutral"] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: mapped.length,
        positive: sentiments.positive || 0,
        negative: sentiments.negative || 0,
        neutral: sentiments.neutral || 0,
      });
    } catch (error: any) {
      console.error("[Communications] fetch error:", error);
      toast.error("Failed to load communications: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const fetchContactsAndDeals = useCallback(async () => {
    if (!organizationId) return;
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from("contacts").select("id, first_name, last_name").eq("organization_id", organizationId).order("first_name"),
      supabase.from("deals").select("id, name").eq("organization_id", organizationId).order("name"),
    ]);
    setContacts(c || []);
    setDeals(d || []);
  }, [organizationId]);

  const fetchEmailTemplates = useCallback(async () => {
    if (!organizationId) return;
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEmailTemplates(data || []);
    } catch {
      setEmailTemplates([]);
    }
  }, [organizationId]);

  // Initial data load
  useEffect(() => {
    if (organizationId) {
      fetchCommunications();
      fetchContactsAndDeals();
      fetchEmailTemplates();
    } else {
      setLoading(false);
      setCommunications([]);
    }
  }, [organizationId, fetchCommunications, fetchContactsAndDeals, fetchEmailTemplates]);

  // Polling refresh every 30s
  useEffect(() => {
    if (!organizationId) return;
    const interval = setInterval(() => {
      fetchCommunications();
    }, 30000);
    return () => clearInterval(interval);
  }, [organizationId, fetchCommunications]);

  async function createCommunication(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) {
      toast.error("Please select an organization first");
      return;
    }
    try {
      const sentiment = analyzeSentiment(newComm.content || "");
      const summary = generateSummary(newComm.content || "", newComm.type);

      const { error } = await supabase.from("communications").insert({
        type: newComm.type,
        direction: newComm.direction,
        subject: newComm.subject || null,
        content: newComm.content || null,
        summary,
        sentiment,
        contact_id: newComm.contact_id || null,
        deal_id: newComm.deal_id || null,
        organization_id: organizationId,
        occurred_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Communication logged with AI analysis");
      setDialogOpen(false);
      setNewComm({ type: "email", direction: "outbound", subject: "", content: "", contact_id: "", deal_id: "" });
      fetchCommunications();
    } catch (error: any) {
      toast.error("Failed to log communication: " + error.message);
    }
  }

  function analyzeSentiment(text: string): string {
    const positiveWords = ["happy", "great", "excellent", "love", "perfect", "thanks", "appreciate", "excited", "good", "best"];
    const negativeWords = ["angry", "terrible", "awful", "hate", "bad", "worst", "disappointed", "frustrated", "problem", "issue", "complaint"];
    const lower = text.toLowerCase();
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    if (posCount > negCount) return "positive";
    if (negCount > posCount) return "negative";
    return "neutral";
  }

  function generateSummary(text: string, type: string): string {
    if (!text) return "No content";
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return "No content";
    if (type === "email") {
      return sentences[0].trim().slice(0, 120) + (sentences[0].length > 120 ? "..." : "");
    }
    return `${sentences.length} key point${sentences.length > 1 ? "s" : ""} discussed`;
  }

  const filtered = communications.filter(c =>
    ((c.subject?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.content?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.summary?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.contacts?.first_name?.toLowerCase() || "").includes(search.toLowerCase())) &&
    (typeFilter === "all" || c.type === typeFilter) &&
    (sentimentFilter === "all" || c.sentiment === sentimentFilter)
  );

  const emails = filtered.filter(c => c.type === "email");
  const calls = filtered.filter(c => c.type === "call");
  const meetings = filtered.filter(c => c.type === "meeting");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-expo-blue animate-spin" />
        <p className="text-sm text-muted-foreground">Loading communications...</p>
        <p className="text-xs text-muted-foreground/60">orgId: {organizationId ?? "null"}</p>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Mail className="w-12 h-12 text-muted-foreground/30" />
        <h2 className="text-lg font-medium text-foreground">No Organization Found</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          You need to be a member of an organization to view communications.
          Please sign out and sign in again, or contact your administrator.
        </p>
        <Button onClick={() => fetchCommunications()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Communications</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered conversation tracking and sentiment analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchCommunications(); toast.info("Refreshing..."); }}>
            <Loader2 className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const exportData = communications.map(c => ({
              "Type": c.type,
              "Direction": c.direction,
              "Subject": c.subject || "",
              "Content": c.content || "",
              "Summary": c.summary || "",
              "Sentiment": c.sentiment || "neutral",
              "Contact": c.contacts ? `${c.contacts.first_name} ${c.contacts.last_name}` : "",
              "Deal": c.deals?.name || "",
              "Date": c.occurred_at,
            }));
            import("@/lib/export").then(({ exportToCSV }) => {
              exportToCSV(exportData, "communications");
            });
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" />Log Communication</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-card-foreground max-w-lg">
              <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
              <form onSubmit={createCommunication} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newComm.type} onValueChange={(v) => setNewComm(p => ({ ...p, type: v }))}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select value={newComm.direction} onValueChange={(v) => setNewComm(p => ({ ...p, direction: v }))}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {newComm.type === "email" && emailTemplates.length > 0 && (
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select
                      value=""
                      onValueChange={async (v) => {
                        const template = emailTemplates.find((t) => t.id === v);
                        if (template) {
                          await supabase.from("email_templates").update({ usage_count: (template.usage_count || 0) + 1 }).eq("id", template.id);
                          setNewComm((p) => ({ ...p, subject: template.subject, content: template.body }));
                          toast.success(`Applied template: ${template.name}`);
                          fetchEmailTemplates();
                        }
                      }}
                    >
                      <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Select a template" /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {emailTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={newComm.subject} onChange={(e) => setNewComm(p => ({ ...p, subject: e.target.value }))} className="bg-muted border-border" placeholder="Re: Proposal follow-up" />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <textarea
                    value={newComm.content}
                    onChange={(e) => setNewComm(p => ({ ...p, content: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-expo-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-expo-blue/50 min-h-[100px] resize-y"
                    placeholder="Conversation content... AI will analyze sentiment and generate summary."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Select value={newComm.contact_id} onValueChange={(v) => setNewComm(p => ({ ...p, contact_id: v }))}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Select contact" /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deal (optional)</Label>
                    <Select value={newComm.deal_id} onValueChange={(v) => setNewComm(p => ({ ...p, deal_id: v }))}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Select deal" /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {deals.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <BrainCircuit className="w-4 h-4 mr-2" />Log & Analyze
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sentiment Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <Mail className="w-5 h-5 text-expo-blue mb-3" />
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Communications</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-emerald-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{stats.positive}</p>
            <p className="text-sm text-muted-foreground">Positive Sentiment</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <Minus className="w-5 h-5 text-blue-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{stats.neutral}</p>
            <p className="text-sm text-muted-foreground">Neutral</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <TrendingDown className="w-5 h-5 text-red-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{stats.negative}</p>
            <p className="text-sm text-muted-foreground">Negative Sentiment</p>
          </CardContent>
        </Card>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-expo-lg bg-expo-blue/10 border border-expo-blue/20">
          <span className="text-sm text-foreground">{selected.length} selected</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8" onClick={async () => {
            try {
              const { error } = await supabase.from("communications").delete().in("id", selected);
              if (error) throw error;
              toast.success(`${selected.length} communications deleted`);
              setSelected([]);
              fetchCommunications();
            } catch (error: any) {
              toast.error("Failed to delete: " + error.message);
            }
          }}>
            <Trash2 className="w-4 h-4 mr-1" />Delete
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search communications..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-card border border-border rounded-expo-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-expo-blue/50" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-card border-border text-foreground w-36 h-9 text-xs">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="bg-card border-border text-foreground w-36 h-9 text-xs">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="emails" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"><Mail className="w-4 h-4 mr-2" />Emails ({emails.length})</TabsTrigger>
          <TabsTrigger value="calls" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"><Phone className="w-4 h-4 mr-2" />Calls ({calls.length})</TabsTrigger>
          <TabsTrigger value="meetings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"><MessageSquare className="w-4 h-4 mr-2" />Meetings ({meetings.length})</TabsTrigger>
        </TabsList>

        {(["all", "emails", "calls", "meetings"] as const).map(tab => {
          const items = tab === "all" ? filtered : tab === "emails" ? emails : tab === "calls" ? calls : meetings;
          return (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="space-y-3">
                {items.map((comm) => {
                  const Icon = typeIcons[comm.type] || Mail;
                  const sentiment = sentimentConfig[comm.sentiment || "neutral"];
                  const SentimentIcon = sentiment.icon;
                  return (
                    <Card key={comm.id} className="bg-card border-border hover:border-expo-blue/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            className="mt-2 rounded border-border bg-transparent"
                            checked={selected.includes(comm.id)}
                            onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, comm.id] : prev.filter((id) => id !== comm.id))}
                          />
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground">{comm.subject || "No subject"}</p>
                              <Badge variant="secondary" className={`text-xs ${comm.direction === "inbound" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"}`}>
                                {comm.direction}
                              </Badge>
                              <div className="flex items-center gap-1" style={{ color: sentiment.color }}>
                                <SentimentIcon className="w-3 h-3" />
                                <span className="text-xs">{sentiment.label}</span>
                              </div>
                            </div>
                            {comm.summary && (
                              <p className="text-xs text-muted-foreground mb-2">{comm.summary}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {comm.contacts && (
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{comm.contacts.first_name} {comm.contacts.last_name}</span>
                              )}
                              {comm.deals && (
                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{comm.deals.name}</span>
                              )}
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(comm.occurred_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-12">No {tab} communications</p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
