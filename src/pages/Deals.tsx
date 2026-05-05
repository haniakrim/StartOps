import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, DollarSign, Calendar, TrendingUp, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  status: string;
  expected_close_date: string;
  description: string;
  contact_id: string;
  created_at: string;
}

const stages = [
  { id: "lead", name: "Lead", color: "#6452db" },
  { id: "qualified", name: "Qualified", color: "#5683da" },
  { id: "proposal", name: "Proposal", color: "#ff8964" },
  { id: "negotiation", name: "Negotiation", color: "#f0ad4e" },
  { id: "closed", name: "Closed Won", color: "#8dc572" },
];

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [newDeal, setNewDeal] = useState({
    name: "",
    value: "",
    stage: "lead",
    probability: "20",
    expected_close_date: "",
    description: "",
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("deals").insert([
        {
          name: newDeal.name,
          value: parseFloat(newDeal.value) || 0,
          stage: newDeal.stage,
          probability: parseInt(newDeal.probability),
          expected_close_date: newDeal.expected_close_date,
          description: newDeal.description,
          organization_id: (await supabase.from("organizations").select("id").limit(1)).data?.[0]?.id,
        },
      ]);

      if (error) throw error;

      toast({ title: "Deal created successfully" });
      setShowAddDialog(false);
      setNewDeal({
        name: "",
        value: "",
        stage: "lead",
        probability: "20",
        expected_close_date: "",
        description: "",
      });
      fetchDeals();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Value", "Stage", "Probability", "Status", "Expected Close"].join(","),
      ...deals.map((d) =>
        [d.name, d.value, d.stage, d.probability, d.status, d.expected_close_date].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deals.csv";
    a.click();
    toast({ title: "Deals exported to CSV" });
  };

  const filteredDeals = deals.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.stage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedValue = deals.reduce(
    (sum, d) => sum + (d.value || 0) * (d.probability || 0) / 100,
    0
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Deals</h1>
          <p className="text-white/60 mt-1">Track and manage your sales pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-[#303236] text-white/85 hover:bg-[#18191b] hover:text-white"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#6452db] hover:bg-[#5645c7] text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-[#303236] text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDeal} className="space-y-4">
                <div className="space-y-2">
                  <Label>Deal Name</Label>
                  <Input
                    value={newDeal.name}
                    onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={newDeal.value}
                      onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                      className="bg-[#0b0d10] border-[#303236] text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Probability (%)</Label>
                    <Input
                      type="number"
                      value={newDeal.probability}
                      onChange={(e) => setNewDeal({ ...newDeal, probability: e.target.value })}
                      className="bg-[#0b0d10] border-[#303236] text-white"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stage</Label>
                    <Select
                      value={newDeal.stage}
                      onValueChange={(v) => setNewDeal({ ...newDeal, stage: v })}
                    >
                      <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#18191b] border-[#303236]">
                        {stages.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Close</Label>
                    <Input
                      type="date"
                      value={newDeal.expected_close_date}
                      onChange={(e) => setNewDeal({ ...newDeal, expected_close_date: e.target.value })}
                      className="bg-[#0b0d10] border-[#303236] text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newDeal.description}
                    onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white">
                  Create Deal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Pipeline</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  ${totalValue.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#6452db]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Weighted Value</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  ${weightedValue.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ff8964]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#ff8964]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Active Deals</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {deals.filter((d) => d.status === "open").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#8dc572]/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8dc572]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
        <Input
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#18191b] border-[#303236] text-white placeholder:text-white/30"
        />
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

          return (
            <div key={stage.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium text-white/85">{stage.name}</span>
                </div>
                <span className="text-xs text-white/45">{stageDeals.length}</span>
              </div>

              <div className="space-y-2">
                {stageDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="bg-[#0b0d10] border-[#303236] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer"
                  >
                    <CardContent className="p-3 space-y-2">
                      <p className="text-sm font-medium text-white truncate">{deal.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#ff8964] font-medium">
                          ${deal.value?.toLocaleString()}
                        </span>
                        <span className="text-xs text-white/45">{deal.probability}%</span>
                      </div>
                      {deal.expected_close_date && (
                        <div className="flex items-center gap-1 text-xs text-white/45">
                          <Calendar className="w-3 h-3" />
                          {new Date(deal.expected_close_date).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="pt-2 border-t border-[#303236]">
                <p className="text-xs text-white/45">
                  ${stageValue.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
