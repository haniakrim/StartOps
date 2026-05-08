import { useState, useEffect } from "react";
import {
  Plus, MoreHorizontal, DollarSign, Calendar, User, Building2, Filter, Search, Loader2, Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DealDetail } from "@/components/DealDetail";
import { useOrganization } from "@/hooks/useOrganization";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Deal {
  id: string;
  name: string;
  value: number;
  probability: number;
  stage: string;
  status: string;
  expected_close_date: string | null;
  contact_id: string | null;
  source: string | null;
  contacts?: { first_name: string; last_name: string; company: string | null } | null;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

const sourceOptions = [
  "Website", "Referral", "Cold Call", "Email Campaign", "Social Media",
  "Trade Show", "Partner", "Advertisement", "Direct", "Other"
];

export default function Deals() {
  const { organizationId } = useOrganization();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [detailDealId, setDetailDealId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: "", value: "", probability: "50", stage: "lead", expected_close_date: "", contact_id: "", source: "",
  });
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);

  useEffect(() => { fetchPipelineAndDeals(); fetchContactsForSelect(); }, [organizationId]);
  useRealtimeTable("deals", fetchPipelineAndDeals);
  useRealtimeTable("contacts", fetchContactsForSelect);

  async function fetchPipelineAndDeals() {
    try {
      setLoading(true);
      const { data: pipelineData, error: pipelineError } = await supabase.from("pipelines").select("stages").limit(1);
      if (pipelineError) throw pipelineError;
      const parsedStages: PipelineStage[] = (pipelineData?.[0] as any)?.stages || [
        { id: "lead", name: "Lead", color: "#5683da", order: 1 },
        { id: "qualified", name: "Qualified", color: "#6452db", order: 2 },
        { id: "proposal", name: "Proposal", color: "#ff8964", order: 3 },
        { id: "negotiation", name: "Negotiation", color: "#f0ad4e", order: 4 },
        { id: "closed-won", name: "Closed Won", color: "#8dc572", order: 5 },
        { id: "closed-lost", name: "Closed Lost", color: "#be6464", order: 6 },
      ];
      setStages(parsedStages);

      let query = supabase
        .from("deals").select(`*, contacts:contact_id (first_name, last_name, company)`)
        .order("created_at", { ascending: false });
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      const { data: dealsData, error: dealsError } = await query;
      if (dealsError) throw dealsError;
      setDeals((dealsData || []).map((d: any) => ({ ...d, contacts: d.contacts?.[0] ?? null })));
    } catch (error: any) {
      toast.error("Failed to load deals: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContactsForSelect() {
    let query = supabase.from("contacts").select("id, first_name, last_name").order("first_name");
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }
    const { data } = await query;
    setContacts(data || []);
  }

  async function createDeal(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!organizationId) {
        toast.error("No organization found. Please sign out and sign in again.");
        return;
      }
      const { error } = await supabase.from("deals").insert({
        name: newDeal.name,
        value: parseFloat(newDeal.value) || 0,
        probability: parseInt(newDeal.probability) || 0,
        stage: newDeal.stage,
        expected_close_date: newDeal.expected_close_date || null,
        contact_id: newDeal.contact_id || null,
        source: newDeal.source || null,
        status: "open",
        organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Deal created successfully");
      setDialogOpen(false);
      setNewDeal({ name: "", value: "", probability: "50", stage: "lead", expected_close_date: "", contact_id: "", source: "" });
      fetchPipelineAndDeals();
    } catch (error: any) {
      toast.error("Failed to create deal: " + error.message);
    }
  }

  async function updateDealStage(dealId: string, newStage: string) {
    try {
      const { error } = await supabase.from("deals").update({ stage: newStage }).eq("id", dealId);
      if (error) throw error;
      toast.success("Deal moved to " + newStage);
      fetchPipelineAndDeals();
    } catch (error: any) {
      toast.error("Failed to move deal: " + error.message);
    }
  }

  async function deleteDeal(id: string) {
    try {
      const { error } = await supabase.from("deals").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deal deleted");
      fetchPipelineAndDeals();
    } catch (error: any) {
      toast.error("Failed to delete deal: " + error.message);
    }
  }

  const filtered = deals.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.contacts?.company && d.contacts.company.toLowerCase().includes(search.toLowerCase()))
  );

  const dealsByStage = stages.map(stage => ({
    ...stage,
    deals: filtered.filter(d => d.stage === stage.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Deals</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your sales pipeline</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader><DialogTitle>Add Deal</DialogTitle></DialogHeader>
            <form onSubmit={createDeal} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Deal Name</Label>
                <Input required value={newDeal.name} onChange={(e) => setNewDeal(p => ({ ...p, name: e.target.value }))} className="bg-input border-border text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Value ($)</Label>
                  <Input type="number" required value={newDeal.value} onChange={(e) => setNewDeal(p => ({ ...p, value: e.target.value }))} className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Probability (%)</Label>
                  <Input type="number" min="0" max="100" value={newDeal.probability} onChange={(e) => setNewDeal(p => ({ ...p, probability: e.target.value }))} className="bg-input border-border text-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Stage</Label>
                <Select value={newDeal.stage} onValueChange={(v) => setNewDeal(p => ({ ...p, stage: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Contact</Label>
                <Select value={newDeal.contact_id} onValueChange={(v) => setNewDeal(p => ({ ...p, contact_id: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Select contact" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Expected Close Date</Label>
                <Input type="date" value={newDeal.expected_close_date} onChange={(e) => setNewDeal(p => ({ ...p, expected_close_date: e.target.value }))} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Source</Label>
                <Select value={newDeal.source} onValueChange={(v) => setNewDeal(p => ({ ...p, source: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    {sourceOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create Deal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dealsByStage.map(stage => (
            <div
              key={stage.id}
              className="space-y-3"
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedDeal && draggedDeal.stage !== stage.id) {
                  updateDealStage(draggedDeal.id, stage.id);
                }
                setDraggedDeal(null);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm font-medium text-foreground">{stage.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">{stage.deals.length}</Badge>
              </div>
              <div className="space-y-2">
                {stage.deals.map(deal => (
                  <Card key={deal.id} className="bg-card border-border hover:border-border/80 transition-colors cursor-pointer" draggable onDragStart={() => setDraggedDeal(deal)} onClick={() => { setDetailDealId(deal.id); setDetailOpen(true); }}>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium text-foreground">{deal.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">${(deal.value || 0).toLocaleString()}</p>
                      <div className="mt-2">
                        <Progress value={deal.probability || 0} className="h-1 bg-muted" />
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{deal.probability || 0}%</span>
                          {deal.expected_close_date && <span className="text-xs text-muted-foreground">{new Date(deal.expected_close_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      {deal.contacts && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {deal.contacts.first_name} {deal.contacts.last_name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          {detailDealId && <DealDetail dealId={detailDealId} open={true} onClose={() => setDetailOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
