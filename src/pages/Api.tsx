import { useState, useEffect } from "react";
import { Webhook, Copy, Check, RefreshCw, Key, Shield, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export default function Api() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: "contact.created" });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: whData, error: whError } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (whError) throw whError;
      setWebhooks(whData || []);

      const { data: keyData, error: keyError } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });
      if (keyError) throw keyError;
      setApiKeys(keyData || []);
    } catch (error: any) {
      toast.error("Failed to load API data: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createWebhook(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("webhooks").insert({
        name: newWebhook.name,
        url: newWebhook.url,
        events: [newWebhook.events],
        user_id: (await supabase.auth.getUser()).data.user?.id,
        organization_id: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
      toast.success("Webhook created");
      setDialogOpen(false);
      setNewWebhook({ name: "", url: "", events: "contact.created" });
      fetchData();
    } catch (error: any) {
      toast.error("Failed to create webhook: " + error.message);
    }
  }

  async function toggleWebhook(id: string, current: boolean) {
    try {
      const { error } = await supabase.from("webhooks").update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, is_active: !current } : w)));
      toast.success(current ? "Webhook paused" : "Webhook activated");
    } catch (error: any) {
      toast.error("Failed to update webhook: " + error.message);
    }
  }

  async function deleteWebhook(id: string) {
    try {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
      toast.success("Webhook deleted");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete webhook: " + error.message);
    }
  }

  const apiKey = apiKeys[0]?.key_prefix ? `${apiKeys[0].key_prefix}...` : "sk_live_51Hx9m2K3LpQr8TnW4vYz";

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">API & Webhooks</h1>
        <p className="text-white/50 mt-1">Manage API keys and webhook integrations</p>
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-[#6452db]" />
            API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-[#0b0d10] border border-white/10 rounded-md px-4 py-3 text-sm text-white/80 font-mono">
              {apiKey}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyKey}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              {copied ? <Check className="w-4 h-4 text-[#8dc572]" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Shield className="w-4 h-4" />
            Never share your API key in client-side code or public repositories.
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Webhook className="w-4 h-4 text-[#6452db]" />
            Webhooks
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
                <Plus className="w-4 h-4 mr-2" />Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-white/10 text-white">
              <DialogHeader><DialogTitle>Add Webhook</DialogTitle></DialogHeader>
              <form onSubmit={createWebhook} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Name</Label>
                  <Input required value={newWebhook.name} onChange={(e) => setNewWebhook((p) => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Production Webhook" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">URL</Label>
                  <Input required type="url" value={newWebhook.url} onChange={(e) => setNewWebhook((p) => ({ ...p, url: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="https://api.yourservice.com/webhook" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Event</Label>
                  <Input value={newWebhook.events} onChange={(e) => setNewWebhook((p) => ({ ...p, events: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Create Webhook</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            {webhooks.length === 0 && (
              <p className="text-sm text-white/40 text-center py-8">No webhooks configured yet.</p>
            )}
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex items-center justify-between p-4 bg-[#0b0d10] rounded-lg border border-white/10"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-white/80 font-mono">{wh.events?.[0] || "all"}</code>
                    <Badge
                      className={`text-xs ${
                        wh.is_active
                          ? "bg-[#8dc572]/20 text-[#8dc572] border-0"
                          : "bg-white/10 text-white/60 border-0"
                      }`}
                    >
                      {wh.is_active ? "active" : "paused"}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/40 truncate">{wh.url}</p>
                  <p className="text-xs text-white/30">Created {new Date(wh.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch checked={wh.is_active} onCheckedChange={() => toggleWebhook(wh.id, wh.is_active)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-[#be6464]" onClick={() => deleteWebhook(wh.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}