import { useState, useEffect } from "react";
import {
  Mail, Plus, Search, Loader2, Send, Users, Eye, MousePointer,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Calendar,
  MoreHorizontal, Filter, Copy, Trash2, Pause, Play, Download
} from "lucide-react";
import { exportToCSV } from "@/lib/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  type: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  sent_at: string | null;
  scheduled_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/50",
  scheduled: "bg-[#5683da]/20 text-[#5683da]",
  sending: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  sent: "bg-[#8dc572]/20 text-[#8dc572]",
  paused: "bg-white/10 text-white/50",
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    type: "newsletter",
    scheduled_at: "",
  });

  useEffect(() => { fetchCampaigns(); }, []);
  useRealtimeTable("campaigns", fetchCampaigns);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast.error("Failed to load campaigns: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("campaigns").insert({
        name: newCampaign.name,
        subject: newCampaign.subject,
        type: newCampaign.type,
        status: newCampaign.scheduled_at ? "scheduled" : "draft",
        scheduled_at: newCampaign.scheduled_at || null,
        recipient_count: 0,
        open_count: 0,
        click_count: 0,
      });
      if (error) throw error;
      toast.success("Campaign created");
      setDialogOpen(false);
      setNewCampaign({ name: "", subject: "", type: "newsletter", scheduled_at: "" });
      fetchCampaigns();
    } catch (error: any) {
      toast.error("Failed to create campaign: " + error.message);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success(`Campaign ${status}`);
      fetchCampaigns();
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  }

  async function deleteCampaign(id: string) {
    try {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      toast.success("Campaign deleted");
      fetchCampaigns();
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  }

  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  const totalSent = campaigns.filter(c => c.status === "sent").reduce((s, c) => s + (c.recipient_count || 0), 0);
  const totalOpens = campaigns.reduce((s, c) => s + (c.open_count || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.click_count || 0), 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;
  const avgClickRate = totalOpens > 0 ? Math.round((totalClicks / totalOpens) * 100) : 0;

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Email Campaigns</h1>
          <p className="text-sm text-white/50 mt-1">Create and track email marketing campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5" onClick={() => {
            const exportData = campaigns.map(c => ({
              "Name": c.name,
              "Subject": c.subject,
              "Type": c.type,
              "Status": c.status,
              "Recipients": c.recipient_count,
              "Opens": c.open_count,
              "Clicks": c.click_count,
              "Bounces": c.bounce_count,
              "Sent At": c.sent_at,
            }));
            exportToCSV(exportData, "campaigns");
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
                <Plus className="w-4 h-4 mr-2" />New Campaign
              </Button>
            </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
            <form onSubmit={createCampaign} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Campaign Name</Label>
                <Input required value={newCampaign.name} onChange={(e) => setNewCampaign(p => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Q1 Newsletter" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Email Subject</Label>
                <Input required value={newCampaign.subject} onChange={(e) => setNewCampaign(p => ({ ...p, subject: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Your March Update is Here" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Type</Label>
                  <Select value={newCampaign.type} onValueChange={(v) => setNewCampaign(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="drip">Drip Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Schedule (optional)</Label>
                  <Input type="datetime-local" value={newCampaign.scheduled_at} onChange={(e) => setNewCampaign(p => ({ ...p, scheduled_at: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Campaign</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Send className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">{totalSent.toLocaleString()}</p>
            <p className="text-sm text-white/50">Emails Sent</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Eye className="w-5 h-5 text-[#5683da] mb-3" />
            <p className="text-2xl font-semibold text-white">{avgOpenRate}%</p>
            <p className="text-sm text-white/50">Avg Open Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <MousePointer className="w-5 h-5 text-[#ff8964] mb-3" />
            <p className="text-2xl font-semibold text-white">{avgClickRate}%</p>
            <p className="text-sm text-white/50">Avg Click Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">{campaigns.length}</p>
            <p className="text-sm text-white/50">Total Campaigns</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
        </div>
        <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
          <Filter className="w-4 h-4 mr-2" />Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">Scheduled</TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">Sent</TabsTrigger>
        </TabsList>

        {(["all", "draft", "scheduled", "sent"] as const).map(tab => {
          const items = tab === "all" ? filtered : filtered.filter(c => c.status === tab);
          return (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="space-y-3">
                {items.map(campaign => {
                  const openRate = campaign.recipient_count > 0 ? Math.round((campaign.open_count / campaign.recipient_count) * 100) : 0;
                  const clickRate = campaign.open_count > 0 ? Math.round((campaign.click_count / campaign.open_count) * 100) : 0;
                  return (
                    <Card key={campaign.id} className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-white">{campaign.name}</h3>
                              <Badge variant="secondary" className={`text-xs ${statusColors[campaign.status]}`}>{campaign.status}</Badge>
                              <Badge variant="outline" className="text-xs border-white/10 text-white/40 capitalize">{campaign.type}</Badge>
                            </div>
                            <p className="text-xs text-white/40 mb-3">{campaign.subject}</p>
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-white/30">Recipients</p>
                                <p className="text-sm text-white">{campaign.recipient_count.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-white/30">Opens</p>
                                <p className="text-sm text-[#5683da]">{openRate}% ({campaign.open_count})</p>
                              </div>
                              <div>
                                <p className="text-xs text-white/30">Clicks</p>
                                <p className="text-sm text-[#ff8964]">{clickRate}% ({campaign.click_count})</p>
                              </div>
                              <div>
                                <p className="text-xs text-white/30">Bounces</p>
                                <p className="text-sm text-white/50">{campaign.bounce_count || 0}</p>
                              </div>
                            </div>
                            {campaign.status === "sent" && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-white/30">Engagement</span>
                                  <span className="text-white/50">{openRate}%</span>
                                </div>
                                <Progress value={openRate} className="h-1 bg-white/10" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            {campaign.status === "draft" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-[#8dc572]" onClick={() => updateStatus(campaign.id, "scheduled")}>
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            {campaign.status === "scheduled" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-[#f0ad4e]" onClick={() => updateStatus(campaign.id, "paused")}>
                                <Pause className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-[#be6464]" onClick={() => deleteCampaign(campaign.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-sm text-white/40 text-center py-12">No {tab} campaigns</p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
