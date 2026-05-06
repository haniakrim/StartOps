import { useState, useEffect } from "react";
import {
  Mail, Phone, MessageSquare, BrainCircuit, TrendingUp, TrendingDown,
  Minus, Search, Filter, Plus, Loader2, Send, Clock, User, Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("startops_email_templates");
      if (raw) setEmailTemplates(JSON.parse(raw));
    } catch {
      setEmailTemplates([]);
    }
  }, []);

  useEffect(() => {
    fetchCommunications();
    fetchContactsAndDeals();
  }, []);

  async function fetchCommunications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("communications")
        .select(`
          id, type, direction, subject, content, summary, sentiment, extracted_data, occurred_at,
          contacts:contact_id (first_name, last_name, company),
          deals:deal_id (name)
        `)
        .order("occurred_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const mapped = (data || []).map((d: any) => ({
        ...d,
        contacts: d.contacts?.[0] ?? null,
        deals: d.deals?.[0] ?? null,
      }));

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
      toast.error("Failed to load communications: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContactsAndDeals() {
    const { data: c } = await supabase.from("contacts").select("id, first_name, last_name").order("first_name");
    setContacts(c || []);
    const { data: d } = await supabase.from("deals").select("id, name").order("name");
    setDeals(d || []);
  }

  async function createCommunication(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Simulate AI analysis
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
    (c.subject?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.content?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.summary?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.contacts?.first_name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const emails = filtered.filter(c => c.type === "email");
  const calls = filtered.filter(c => c.type === "call");
  const meetings = filtered.filter(c => c.type === "meeting");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Communications</h1>
          <p className="text-sm text-white/50 mt-1">AI-powered conversation tracking and sentiment analysis</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />Log Communication
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
            <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
            <form onSubmit={createCommunication} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Type</Label>
                  <Select value={newComm.type} onValueChange={(v) => setNewComm(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Direction</Label>
                  <Select value={newComm.direction} onValueChange={(v) => setNewComm(p => ({ ...p, direction: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newComm.type === "email" && emailTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white/70">Template</Label>
                  <Select
                    value=""
                    onValueChange={(v) => {
                      const template = emailTemplates.find((t) => t.id === v);
                      if (template) {
                        const updated = emailTemplates.map((t) =>
                          t.id === v ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
                        );
                        setEmailTemplates(updated);
                        localStorage.setItem("startops_email_templates", JSON.stringify(updated));
                        setNewComm((p) => ({
                          ...p,
                          subject: template.subject,
                          content: template.body,
                        }));
                        toast.success(`Applied template: ${template.name}`);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      {emailTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white/70">Subject</Label>
                <Input value={newComm.subject} onChange={(e) => setNewComm(p => ({ ...p, subject: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Re: Proposal follow-up" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Content</Label>
                <textarea
                  value={newComm.content}
                  onChange={(e) => setNewComm(p => ({ ...p, content: e.target.value }))}
                  className="w-full bg-[#0b0d10] border border-white/10 rounded-md p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50 min-h-[100px] resize-y"
                  placeholder="Conversation content... AI will analyze sentiment and generate summary."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Contact</Label>
                  <Select value={newComm.contact_id} onValueChange={(v) => setNewComm(p => ({ ...p, contact_id: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue placeholder="Select contact" /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Deal (optional)</Label>
                  <Select value={newComm.deal_id} onValueChange={(v) => setNewComm(p => ({ ...p, deal_id: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue placeholder="Select deal" /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      {deals.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                <BrainCircuit className="w-4 h-4 mr-2" />Log & Analyze
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sentiment Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Mail className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">{stats.total}</p>
            <p className="text-sm text-white/50">Total Communications</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">{stats.positive}</p>
            <p className="text-sm text-white/50">Positive Sentiment</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Minus className="w-5 h-5 text-[#5683da] mb-3" />
            <p className="text-2xl font-semibold text-white">{stats.neutral}</p>
            <p className="text-sm text-white/50">Neutral</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <TrendingDown className="w-5 h-5 text-[#be6464] mb-3" />
            <p className="text-2xl font-semibold text-white">{stats.negative}</p>
            <p className="text-sm text-white/50">Negative Sentiment</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search communications..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
        </div>
        <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"><Filter className="w-4 h-4 mr-2" />Filter</Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="emails" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Mail className="w-4 h-4 mr-2" />Emails ({emails.length})</TabsTrigger>
          <TabsTrigger value="calls" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Phone className="w-4 h-4 mr-2" />Calls ({calls.length})</TabsTrigger>
          <TabsTrigger value="meetings" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><MessageSquare className="w-4 h-4 mr-2" />Meetings ({meetings.length})</TabsTrigger>
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
                    <Card key={comm.id} className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white/40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-white">{comm.subject || "No subject"}</p>
                              <Badge variant="secondary" className={`text-xs ${comm.direction === "inbound" ? "bg-[#5683da]/20 text-[#5683da]" : "bg-white/10 text-white/50"}`}>
                                {comm.direction}
                              </Badge>
                              <div className="flex items-center gap-1" style={{ color: sentiment.color }}>
                                <SentimentIcon className="w-3 h-3" />
                                <span className="text-xs">{sentiment.label}</span>
                              </div>
                            </div>
                            {comm.summary && (
                              <p className="text-xs text-white/50 mb-2">{comm.summary}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-white/30">
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
                  <p className="text-sm text-white/40 text-center py-12">No {tab} communications</p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}