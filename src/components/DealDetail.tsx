import { useState, useEffect } from "react";
import { DollarSign, Calendar, User, Building2, TrendingUp, Loader2, Pencil, Trash2, GitBranch, MessageSquare, Clock, BrainCircuit, TrendingDown, Minus, History, FileText } from "lucide-react";
import { CommentsSection } from "@/components/CommentsSection";
import { QuoteBuilder } from "@/components/quotes/QuoteBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";
import { useDealScoring } from "@/hooks/useDealScoring";
import { DealScorePanel } from "@/components/deals/DealScorePanel";
import { generateNextActions } from "@/hooks/useNextActionSuggestions";
import { NextActionCard } from "@/components/deals/NextActionCard";

interface DealDetailProps {
  dealId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function DealDetail({ dealId, open, onClose, onUpdate }: DealDetailProps) {
  const { organizationId } = useOrganization();
  const { getScore } = useDealScoring();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stages, setStages] = useState<any[]>([]);
  const [stageHistory, setStageHistory] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [quoteBuilderOpen, setQuoteBuilderOpen] = useState(false);

  useEffect(() => { if (dealId && open) fetchDeal(); }, [dealId, open]);

  const nextActions = (() => {
    if (!deal) return [];
    const daysInStage = Math.floor((Date.now() - new Date(deal.updated_at || deal.created_at).getTime()) / 86400000);
    const lastActivity = activities[0];
    const daysSinceLastActivity = lastActivity
      ? Math.floor((Date.now() - new Date(lastActivity.created_at).getTime()) / 86400000)
      : daysInStage;
    const daysUntilClose = deal.expected_close_date
      ? Math.ceil((new Date(deal.expected_close_date).getTime() - Date.now()) / 86400000)
      : null;
    const scoreData = getScore(dealId || "");
    return generateNextActions({
      stage: deal.stage,
      probability: deal.probability || 0,
      daysInStage,
      daysSinceLastActivity,
      daysUntilClose,
      activityCount: activities.length,
      score: scoreData?.score ?? 50,
    });
  })();

  async function fetchDeal() {
    if (!organizationId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("deals")
        .select(`*, contacts:contact_id (first_name, last_name, company, email, phone)`)
        .eq("id", dealId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (error) throw error;
      setDeal(data ? { ...data, contacts: data.contacts?.[0] ?? null } : null);

      const [{ data: pipeline }, { data: history }, { data: comms }, { data: acts }] = await Promise.all([
        supabase.from("pipelines").select("stages").eq("organization_id", organizationId).limit(1).single(),
        supabase.from("deal_stage_history").select("*").eq("deal_id", dealId).order("occurred_at", { ascending: false }),
        supabase.from("communications").select("*").eq("deal_id", dealId).eq("organization_id", organizationId).order("occurred_at", { ascending: false }).limit(10),
        supabase.from("activities").select("*").eq("deal_id", dealId).eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(10),
      ]);

      setStages(pipeline?.stages || []);
      setStageHistory(history || []);
      setCommunications(comms || []);
      setActivities(acts || []);
    } catch (error: any) {
      toast.error("Failed to load deal: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    if (!organizationId) return;
    try {
      const { error } = await supabase.from("deals").update({
        name: deal.name, value: deal.value, probability: deal.probability,
        stage: deal.stage, expected_close_date: deal.expected_close_date,
      }).eq("id", dealId).eq("organization_id", organizationId);
      if (error) throw error;
      toast.success("Deal updated");
      setEditing(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error("Failed to update deal: " + error.message);
    }
  }

  async function deleteDeal() {
    if (!organizationId) return;
    try {
      const { error } = await supabase.from("deals").delete().eq("id", dealId).eq("organization_id", organizationId);
      if (error) throw error;
      toast.success("Deal deleted");
      onClose();
      onUpdate?.();
    } catch (error: any) {
      toast.error("Failed to delete deal: " + error.message);
    }
  }

  const stageColors: Record<string, string> = {
    lead: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    qualified: "bg-primary/15 text-primary",
    proposal: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    negotiation: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    "closed-won": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "closed-lost": "bg-red-500/15 text-red-600 dark:text-red-400",
  };

  const sentimentColors: Record<string, string> = {
    positive: "text-emerald-500", negative: "text-red-500", neutral: "text-blue-500",
  };

  const sentimentIcons: Record<string, React.ElementType> = {
    positive: TrendingUp, negative: TrendingDown, neutral: Minus,
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{loading ? "Loading..." : deal?.name || "Deal Details"}</DialogTitle>
            {!loading && deal && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => setQuoteBuilderOpen(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Quote
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditing(!editing)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={deleteDeal}><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : deal ? (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={`text-xs ${stageColors[deal.stage] || "bg-muted text-muted-foreground"}`}>{deal.stage}</Badge>
              <span className="text-xs text-muted-foreground">Created {new Date(deal.created_at).toLocaleDateString()}</span>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Deal Name</Label><Input value={deal.name} onChange={(e) => setDeal({ ...deal, name: e.target.value })} className="bg-muted border-border" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Value ($)</Label><Input type="number" value={deal.value} onChange={(e) => setDeal({ ...deal, value: parseFloat(e.target.value) || 0 })} className="bg-muted border-border" /></div>
                  <div className="space-y-2"><Label>Probability (%)</Label><Input type="number" min="0" max="100" value={deal.probability} onChange={(e) => setDeal({ ...deal, probability: parseInt(e.target.value) || 0 })} className="bg-muted border-border" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stage</Label>
                    <Select value={deal.stage} onValueChange={(v) => setDeal({ ...deal, stage: v })}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {stages.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Close Date</Label><Input type="date" value={deal.expected_close_date || ""} onChange={(e) => setDeal({ ...deal, expected_close_date: e.target.value })} className="bg-muted border-border" /></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveChanges} className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">Cancel</Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted border border-border">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Overview</TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">History</TabsTrigger>
                  <TabsTrigger value="communications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Comms</TabsTrigger>
                  <TabsTrigger value="activities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Tasks</TabsTrigger>
                  <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <DealScorePanel score={dealId ? getScore(dealId) : null} />
                  <NextActionCard
                    actions={nextActions}
                    dealId={dealId || ""}
                    contactId={deal?.contact_id}
                    onActionCreated={fetchDeal}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Deal Value</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1"><DollarSign className="w-4 h-4" />{(deal.value || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Probability</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1"><TrendingUp className="w-4 h-4" />{deal.probability || 0}%</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Win Probability</span><span className="text-foreground">{deal.probability || 0}%</span></div>
                    <Progress value={deal.probability || 0} className="h-2 bg-muted" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Contact Info</h4>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                        {deal.contacts?.first_name?.[0]}{deal.contacts?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{deal.contacts?.first_name} {deal.contacts?.last_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />{deal.contacts?.company || "No company"}</p>
                      </div>
                    </div>
                    {deal.contacts?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><User className="w-3.5 h-3.5 text-muted-foreground/50" />{deal.contacts.email}</div>
                    )}
                    {deal.contacts?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5 text-muted-foreground/50" />{deal.contacts.phone}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Expected close: {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : "Not set"}</span>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <div className="space-y-3">
                    {stageHistory.map((h, i) => (
                      <div key={h.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
                        <div className="w-8 h-8 rounded-lg bg-muted-foreground/10 flex items-center justify-center flex-shrink-0">
                          <History className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            {h.from_stage ? `${h.from_stage} → ${h.to_stage}` : `Created at ${h.to_stage}`}
                          </p>
                          {h.reason && <p className="text-xs text-muted-foreground mt-0.5">{h.reason}</p>}
                          <p className="text-xs text-muted-foreground/70 mt-1">{new Date(h.occurred_at).toLocaleString()}</p>
                        </div>
                        {h.confidence > 0 && (
                          <Badge variant="secondary" className="bg-primary/15 text-primary text-xs">
                            {h.confidence}% confidence
                          </Badge>
                        )}
                      </div>
                    ))}
                    {stageHistory.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No stage history recorded yet</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="communications" className="mt-4">
                  <div className="space-y-3">
                    {communications.map((comm) => {
                      const SentimentIcon = sentimentIcons[comm.sentiment || "neutral"] || Minus;
                      return (
                        <div key={comm.id} className="p-3 rounded-lg bg-muted border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{comm.subject || "No subject"}</span>
                            <div className={`flex items-center gap-1 ${sentimentColors[comm.sentiment || "neutral"]}`}>
                              <SentimentIcon className="w-3 h-3" />
                              <span className="text-xs capitalize">{comm.sentiment || "neutral"}</span>
                            </div>
                          </div>
                          {comm.summary && <p className="text-xs text-muted-foreground mb-2">{comm.summary}</p>}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <BrainCircuit className="w-3 h-3" />
                            <span>{comm.type} · {new Date(comm.occurred_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                    {communications.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No communications logged</p>}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-4">
                  <CommentsSection entityType="deal" entityId={dealId} />
                </TabsContent>

                <TabsContent value="activities" className="mt-4">
                  <div className="space-y-3">
                    {activities.map((act) => (
                      <div key={act.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
                        <div className="w-8 h-8 rounded-lg bg-muted-foreground/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{act.subject}</p>
                          <p className="text-xs text-muted-foreground">{act.type} · {act.status} · {new Date(act.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${act.priority === "high" ? "bg-red-500/15 text-red-600 dark:text-red-400" : act.priority === "medium" ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"}`}>
                          {act.priority}
                        </Badge>
                      </div>
                    ))}
                    {activities.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No tasks associated</p>}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>

    <QuoteBuilder
      open={quoteBuilderOpen}
      onClose={() => setQuoteBuilderOpen(false)}
      onSuccess={() => { setQuoteBuilderOpen(false); onUpdate?.(); }}
      dealId={dealId}
      contactId={deal?.contact_id}
    />
    </>
  );
}