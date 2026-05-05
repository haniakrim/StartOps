import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Webhook, Plus, Trash2, Clock, CheckCircle2, XCircle, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string;
  last_response_status: number;
  created_at: string;
}

const availableEvents = [
  "contact.created",
  "contact.updated",
  "contact.deleted",
  "deal.created",
  "deal.updated",
  "deal.stage_changed",
  "activity.created",
  "note.created",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("webhooks").insert([
        {
          name: formData.name,
          url: formData.url,
          events: formData.events,
        },
      ]);

      if (error) throw error;

      toast({ title: "Webhook created" });
      setShowDialog(false);
      setFormData({ name: "", url: "", events: [] });
      fetchWebhooks();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleWebhook = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("webhooks").update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      fetchWebhooks();
      toast({ title: `Webhook ${current ? "disabled" : "enabled"}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Webhook deleted" });
      fetchWebhooks();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Webhooks</h1>
          <p className="text-white/60 mt-1">Integrate with external systems via webhooks</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#6452db] hover:bg-[#5645c7] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-[#303236] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#0b0d10] border-[#303236] text-white"
                  placeholder="e.g. Slack Integration"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-[#0b0d10] border-[#303236] text-white"
                  placeholder="https://api.example.com/webhook"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <button
                      key={event}
                      type="button"
                      onClick={() => toggleEvent(event)}
                      className={`px-3 py-2 rounded-md text-sm border transition-all ${
                        formData.events.includes(event)
                          ? "bg-[#6452db]/20 border-[#6452db]/50 text-[#6452db]"
                          : "bg-[#0b0d10] border-[#303236] text-white/60 hover:text-white/85"
                      }`}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white">
                Create Webhook
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#18191b] border-[#303236]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#303236] hover:bg-transparent">
                <TableHead className="text-white/60">Webhook</TableHead>
                <TableHead className="text-white/60">URL</TableHead>
                <TableHead className="text-white/60">Events</TableHead>
                <TableHead className="text-white/60">Last Triggered</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/45">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : webhooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/45">
                    <div className="flex flex-col items-center gap-2">
                      <Webhook className="w-8 h-8 text-white/30" />
                      <p>No webhooks configured</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                webhooks.map((hook) => (
                  <TableRow key={hook.id} className="border-[#303236] hover:bg-[#1f2126]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-[#6452db]" />
                        </div>
                        <span className="text-white text-sm font-medium">{hook.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-white/65 truncate max-w-[200px] block">
                        {hook.url}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {hook.events?.slice(0, 2).map((event) => (
                          <Badge
                            key={event}
                            variant="outline"
                            className="text-xs border-[#303236] text-white/60"
                          >
                            {event}
                          </Badge>
                        ))}
                        {hook.events && hook.events.length > 2 && (
                          <Badge variant="outline" className="text-xs border-[#303236] text-white/60">
                            +{hook.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-white/65">
                        <Clock className="w-3 h-3" />
                        {hook.last_triggered_at
                          ? new Date(hook.last_triggered_at).toLocaleDateString()
                          : "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={hook.is_active}
                          onCheckedChange={() => toggleWebhook(hook.id, hook.is_active)}
                        />
                        {hook.last_response_status ? (
                          hook.last_response_status < 400 ? (
                            <CheckCircle2 className="w-4 h-4 text-[#8dc572]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#eb5757]" />
                          )
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/45 hover:text-[#eb5757] hover:bg-[#eb5757]/10"
                        onClick={() => handleDelete(hook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
