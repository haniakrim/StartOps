import { useState, useEffect } from "react";
import {
  Plus, MoreHorizontal, DollarSign, Calendar, User, Building2, Filter, Search, Loader2,
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

interface Deal {
  id: string;
  name: string;
  value: number;
  probability: number;
  stage: string;
  status: string;
  expected_close_date: string | null;
  contact_id: string | null;
  contacts?: { first_name: string; last_name: string; company: string | null } | null;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

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
    name: "", value: "", probability: "50", stage: "lead", expected_close_date: "", contact_id: "",
  });
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);

  useEffect(() => { fetchPipelineAndDeals(); fetchContactsForSelect(); }, []);

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

      const { data: dealsData, error: dealsError } = await supabase
        .from("deals").select(`*, contacts:contact_id (first_name, last_name, company)`)
        .order("created_at", { ascending: false });
      if (dealsError) throw dealsError;
      setDeals((dealsData || []).map((d: any) => ({ ...d, contacts: d.contacts?.[0] ?? null })));
    } catch (error: any) {
      toast.error("Failed to load deals: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContactsForSelect() {
    const { data } = await supabase.from("contacts").select("id, first_name, last_name").order("first_name");
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
        status: "open",
        organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Deal created successfully");
      setDialogOpen(false);
      setNewDeal({ name: "", value: "", probability: "50", stage: "lead", expected_close_date: "", contact_id: "" });
      fetchPipelineAndDeals();
    } catch (error: any) {
      toast.error("Failed to create deal: " + error.message);
    }
  }

  async function updateDealStage(dealId: string, newStage: string) {
    try {
      const { error } = await supabase.from("deals").update({ stage: newStage, updated_at: new Date().toISOString() }).eq("id", dealId);
      if (error) throw error;
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)));
      toast.success("Deal moved to " + stages.find((s) => s.id === newStage)?.name);
    } catch (error: any) {
      toast.error("Failed to update deal: " + error.message);
    }
  }

  const filteredDeals = deals.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.contacts?.company?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const getStageDeals = (stageId: string) => filteredDeals.filter((d) => d.stage === stageId);
  const stageTotal = (stageId: string) => getStageDeals(stageId).reduce((sum, d) => sum + (d.value || 0), 0);
  const formatValue = (v: number) => `$${(v || 0).toLocaleString()}`;

  const handleDragStart = (deal: Deal) => setDraggedDeal(deal);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== stageId) {
      updateDealStage(draggedDeal.id, stageId);
      setDraggedDeal(null);
    }
  };

  const openDetail = (dealId: string) => { setDetailDealId(dealId); setDetailOpen(true); };

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Deals Pipeline</h1>
          <p className="text-sm text-white/50 mt-1">Track and manage your sales pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input type="text" placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
          </div>
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"><Filter className="w-4 h-4 mr-2" />Filter</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90"><Plus className="w-4 h-4 mr-2" />New Deal</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
              <DialogHeader><DialogTitle>Create New Deal</DialogTitle></DialogHeader>
              <form onSubmit={createDeal} className="space-y-4 pt-4">
                <div className="space-y-2"><Label className="text-white/70">Deal Name</Label><Input required value={newDeal.name} onChange={(e) => setNewDeal((p) => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Enterprise License Renewal" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-white/70">Value ($)</Label><Input type="number" required value={newDeal.value} onChange={(e) => setNewDeal((p) => ({ ...p, value: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="125000" /></div>
                  <div className="space-y-2"><Label className="text-white/70">Probability (%)</Label><Input type="number" min="0" max="100" value={newDeal.probability} onChange={(e) => setNewDeal((p) => ({ ...p, probability: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Stage</Label>
                    <Select value={newDeal.stage} onValueChange={(v) => setNewDeal((p) => ({ ...p, stage: v }))}>
                      <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue placeholder="Select stage" /></SelectTrigger>
                      <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                        {stages.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label className="text-white/70">Close Date</Label><Input type="date" value={newDeal.expected_close_date} onChange={(e) => setNewDeal((p) => ({ ...p, expected_close_date: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Contact</Label>
                  <Select value={newDeal.contact_id} onValueChange={(v) => setNewDeal((p) => ({ ...p, contact_id: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue placeholder="Select contact" /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      {contacts.map((c) => (<SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Deal</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const stageDeals = getStageDeals(stage.id);
          const total = stageTotal(stage.id);
          return (
            <div key={stage.id} className="flex-shrink-0 w-80" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h3 className="text-sm font-medium text-white">{stage.name}</h3>
                  <Badge variant="secondary" className="bg-white/10 text-white/50 text-xs">{stageDeals.length}</Badge>
                </div>
                <span className="text-sm font-medium text-white/50">{formatValue(total)}</span>
              </div>
              <div className="space-y-3 min-h-[100px]">
                {stageDeals.length === 0 && <div className="text-center py-8 text-xs text-white/20 border border-dashed border-white/10 rounded-md">Drop deals here</div>}
                {stageDeals.map((deal) => (
                  <Card key={deal.id} draggable onDragStart={() => handleDragStart(deal)} onClick={() => openDetail(deal.id)} className="bg-[#18191b] border-white/10 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">{deal.name}</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/5 -mr-2 -mt-2"><MoreHorizontal className="w-3 h-3" /></Button>
                      </div>
                      <div className="flex items-center gap-2 mb-3"><Building2 className="w-3 h-3 text-white/30" /><span className="text-xs text-white/50">{deal.contacts?.company || "No company"}</span></div>
                      <div className="flex items-center justify-between mb-3"><span className="text-lg font-semibold text-white">{formatValue(deal.value)}</span></div>
                      <Progress value={deal.probability || 0} className="h-1 bg-white/10 mb-3" />
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <div className="flex items-center gap-1"><User className="w-3 h-3" /><span>{deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : "Unassigned"}</span></div>
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : "No date"}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <DealDetail dealId={detailDealId} open={detailOpen} onClose={() => setDetailOpen(false)} onUpdate={fetchPipelineAndDeals} />
    </div>
  );
}