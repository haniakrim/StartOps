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
import { useOrganization } from "@/hooks/useOrganization";

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
  const { organizationId } = useOrganization();
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
        .select("id,name,url,events,is_active,last_triggered_at,created_at")
        .order("created_at", { ascending: false });
      if (whError) throw whError;
      setWebhooks(whData || []);

      const { data: keyData, error: keyError } = await supabase
        .from("api_keys")
        .select("id,name,permissions,rate_limit,last_used_at,expires_at,is_active")
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
      if (!organizationId) {
        toast.error("No organization found. Please sign out and sign in again.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        "https://dtrwtbmxvscrfkzdpsqt.supabase.co/functions/v1/manage-webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: newWebhook.name,
            url: newWebhook.url,
            events: [newWebhook.events],
            organization_id: organizationId,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(result.error || "Failed to create webhook");
        return;
      }

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

  const apiKey = apiKeys[0]?.key_prefix ? `${apiKeys[0].key_prefix}...` : null;

  const copyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-expo-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">API & Webhooks</h1>
        <p className="text-muted-foreground mt-1">Manage API keys and webhook integrations</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-expo-blue" />
            API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground font-mono">
              {apiKey ?? "No API key configured"}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyKey}
              disabled={!apiKey}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            Never share your API key in client-side code or public repositories.
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <Webhook className="w-4 h-4 text-expo-blue" />
            Webhooks
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-card-foreground">
              <DialogHeader><DialogTitle>Add Webhook</DialogTitle></DialogHeader>
              <form onSubmit={createWebhook} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required value={newWebhook.name} onChange={(e) => setNewWebhook((p) => ({ ...p, name: e.target.value }))} className="bg-muted border-border" placeholder="Production Webhook" />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input required type="url" value={newWebhook.url} onChange={(e) => setNewWebhook((p) => ({ ...p, url: e.target.value }))} className="bg-muted border-border" placeholder="https://api.yourservice.com/webhook" />
                </div>
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Input value={newWebhook.events} onChange={(e) => setNewWebhook((p) => ({ ...p, events: e.target.value }))} className="bg-muted border-border" />
                </div>
                <Button type="submit" className="w-full">Create Webhook</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            {webhooks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No webhooks configured yet.</p>
            )}
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-foreground font-mono">{wh.events?.[0] || "all"}</code>
                    <Badge
                      className={`text-xs ${
                        wh.is_active
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }`}
                    >
                      {wh.is_active ? "active" : "paused"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{wh.url}</p>
                  <p className="text-xs text-muted-foreground/70">Created {new Date(wh.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch checked={wh.is_active} onCheckedChange={() => toggleWebhook(wh.id, wh.is_active)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteWebhook(wh.id)}>
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