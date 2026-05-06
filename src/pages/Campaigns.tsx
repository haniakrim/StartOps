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
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  sending: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  sent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  paused: "bg-muted text-muted-foreground",
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
        <Loader2 className="w-8 h-8 text-expo-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Email Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and track email marketing campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => {
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-card-foreground">
              <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
              <form onSubmit={createCampaign} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input required value={newCampaign.name} onChange={(e) => setNewCampaign(p => ({ ...p, name: e.target.value }))} className="bg-muted border-border" placeholder="Q1 Newsletter" />
                </div>
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input required value={newCampaign.subject} onChange={(e) => setNewCampaign(p => ({ ...p, subject: e.target.value }))} className="bg-muted border-border" placeholder="Your March Update is Here" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newCampaign.type} onValueChange={(v) => setNewCampaign(p => ({ ...p, type: v }))}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="drip">Drip Campaign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule (optional)</Label>
                    <Input type="datetime-local" value={newCampaign.scheduled_at} onChange={(e) => setNewCampaign(p => ({ ...p, scheduled_at: e.target.value }))} className="bg-muted border-border" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Campaign</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <Send className="w-5 h-5 text-expo-blue mb-3" />
            <p className="text-2xl font-semibold text-foreground">{totalSent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Emails Sent</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <Eye className="w-5 h-5 text-blue-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{avgOpenRate}%</p>
            <p className="text-sm text-muted-foreground">Avg Open Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <MousePointer className="w-5 h-5 text-orange-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{avgClickRate}%</p>
            <p className="text-sm text-muted-foreground">Avg Click Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-emerald-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{campaigns.length}</p>
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-card border border-border rounded-expo-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-expo-blue/50" />
        </div>
        <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent">
          <Filter className="w-4 h-4 mr-2" />Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-expo-blue data-[state=active]:text-white text-muted-foreground">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-expo-blue data-[state=active]:text-white text-muted-foreground">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-expo-blue data-[state=active]:text-white text-muted-foreground">Scheduled</TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-expo-blue data-[state=active]:text-white text-muted-foreground">Sent</TabsTrigger>
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
                    <Card key={campaign.id} className="bg-card border-border hover:border-expo-blue/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-foreground">{campaign.name}</h3>
                              <Badge variant="secondary" className={`text-xs ${statusColors[campaign.status]}`}>{campaign.status}</Badge>
                              <Badge variant="outline" className="text-xs border-border text-muted-foreground capitalize">{campaign.type}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{campaign.subject}</p>
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Recipients</p>
                                <p className="text-sm text-foreground">{campaign.recipient_count.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Opens</p>
                                <p className="text-sm text-blue-500">{openRate}% ({campaign.open_count})</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Clicks</p>
                                <p className="text-sm text-orange-500">{clickRate}% ({campaign.click_count})</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Bounces</p>
                                <p className="text-sm text-muted-foreground">{campaign.bounce_count || 0}</p>
                              </div>
                            </div>
                            {campaign.status === "sent" && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Engagement</span>
                                  <span className="text-muted-foreground">{openRate}%</span>
                                </div>
                                <Progress value={openRate} className="h-1 bg-muted" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            {campaign.status === "draft" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-500" onClick={() => updateStatus(campaign.id, "scheduled")}>
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            {campaign.status === "scheduled" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500" onClick={() => updateStatus(campaign.id, "paused")}>
                                <Pause className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteCampaign(campaign.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-12">No {tab} campaigns</p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
