import { useState, useEffect } from "react";
import { X, DollarSign, Calendar, User, Building2, TrendingUp, Loader2, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DealDetailProps {
  dealId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function DealDetail({ dealId, open, onClose, onUpdate }: DealDetailProps) {
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    if (dealId && open) fetchDeal();
  }, [dealId, open]);

  async function fetchDeal() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("deals")
        .select(`*, contacts:contact_id (first_name, last_name, company)`)
        .eq("id", dealId)
        .single();
      if (error) throw error;
      setDeal({ ...data, contacts: data.contacts?.[0] ?? null });

      const { data: pipeline } = await supabase.from("pipelines").select("stages").limit(1).single();
      setStages(pipeline?.stages || []);
    } catch (error: any) {
      toast.error("Failed to load deal: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    try {
      const { error } = await supabase.from("deals").update({
        name: deal.name,
        value: deal.value,
        probability: deal.probability,
        stage: deal.stage,
        expected_close_date: deal.expected_close_date,
      }).eq("id", dealId);
      if (error) throw error;
      toast.success("Deal updated");
      setEditing(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error("Failed to update deal: " + error.message);
    }
  }

  async function deleteDeal() {
    try {
      const { error } = await supabase.from("deals").delete().eq("id", dealId);
      if (error) throw error;
      toast.success("Deal deleted");
      onClose();
      onUpdate?.();
    } catch (error: any) {
      toast.error("Failed to delete deal: " + error.message);
    }
  }

  const stageColors: Record<string, string> = {
    lead: "bg-[#5683da]/20 text-[#5683da]", qualified: "bg-[#6452db]/20 text-[#6452db]",
    proposal: "bg-[#ff8964]/20 text-[#ff8964]", negotiation: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
    "closed-won": "bg-[#8dc572]/20 text-[#8dc572]", "closed-lost": "bg-[#be6464]/20 text-[#be6464]",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">{loading ? "Loading..." : deal?.name || "Deal Details"}</DialogTitle>
            {!loading && deal && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => setEditing(!editing)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-[#be6464]" onClick={deleteDeal}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-[#6452db] animate-spin" /></div>
        ) : deal ? (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={`text-xs ${stageColors[deal.stage] || "bg-white/10 text-white/60"}`}>{deal.stage}</Badge>
              <span className="text-xs text-white/40">Created {new Date(deal.created_at).toLocaleDateString()}</span>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-white/70">Deal Name</Label><Input value={deal.name} onChange={(e) => setDeal({ ...deal, name: e.target.value })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-white/70">Value ($)</Label><Input type="number" value={deal.value} onChange={(e) => setDeal({ ...deal, value: parseFloat(e.target.value) || 0 })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                  <div className="space-y-2"><Label className="text-white/70">Probability (%)</Label><Input type="number" min="0" max="100" value={deal.probability} onChange={(e) => setDeal({ ...deal, probability: parseInt(e.target.value) || 0 })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Stage</Label>
                    <Select value={deal.stage} onValueChange={(v) => setDeal({ ...deal, stage: v })}>
                      <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                        {stages.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label className="text-white/70">Close Date</Label><Input type="date" value={deal.expected_close_date || ""} onChange={(e) => setDeal({ ...deal, expected_close_date: e.target.value })} className="bg-[#0b0d10] border-white/10 text-white" /></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveChanges} className="bg-[#6452db] text-white hover:bg-[#6452db]/90">Save Changes</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)} className="text-white/70 hover:text-white">Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Deal Value</p>
                    <p className="text-lg font-semibold text-white flex items-center gap-1"><DollarSign className="w-4 h-4" />{(deal.value || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Probability</p>
                    <p className="text-lg font-semibold text-white flex items-center gap-1"><TrendingUp className="w-4 h-4" />{deal.probability || 0}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span className="text-white/40">Win Probability</span><span className="text-white">{deal.probability || 0}%</span></div>
                  <Progress value={deal.probability || 0} className="h-2 bg-white/10" />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Contact Info</h4>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#6452db] flex items-center justify-center text-xs text-white font-medium">
                      {deal.contacts?.first_name?.[0]}{deal.contacts?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm text-white">{deal.contacts?.first_name} {deal.contacts?.last_name}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1"><Building2 className="w-3 h-3" />{deal.contacts?.company || "No company"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Timeline</h4>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Calendar className="w-4 h-4" />
                    <span>Expected close: {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : "Not set"}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}