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
import { useAuth } from "@/contexts/AuthContext";

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

interface ApiKeyItem {
  id: string;
  name: string;
  permissions: string[];
  rate_limit: number;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

function randomToken(length = 40) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, length);
}

async function sha256(input: string) {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function Api() {
  const { organizationId } = useOrganization();
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [latestPlaintextKey, setLatestPlaintextKey] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: "contact.created" });

  useEffect(() => {
    if (organizationId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [organizationId]);

  async function fetchData() {
    if (!organizationId) return;

    try {
      setLoading(true);
      const { data: whData, error: whError } = await supabase
        .from("webhooks")
        .select("id,name,url,events,is_active,last_triggered_at,created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (whError) throw whError;
      setWebhooks(whData || []);

      const { data: keyData, error: keyError } = await supabase
        .from("api_keys")
        .select("id,name,permissions,rate_limit,key_prefix,last_used_at,expires_at,is_active")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (keyError) throw keyError;
      setApiKeys((keyData || []) as ApiKeyItem[]);
    } catch (error: any) {
      toast.error("Failed to load API data: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function rotateApiKey() {
    if (!organizationId || !user) {
      toast.error("You must belong to an organization to rotate API keys.");
      return;
    }

    try {
      setRotating(true);
      const token = `sk_live_${randomToken(40)}`;
      const keyHash = await sha256(token);
      const keyPrefix = token.slice(0, 12);

      const activeKeyIds = apiKeys.filter((key) => key.is_active).map((key) => key.id);
      if (activeKeyIds.length > 0) {
        const { error: deactivateError } = await supabase
          .from("api_keys")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .in("id", activeKeyIds);

        if (deactivateError) throw deactivateError;
      }

      const { error: insertError } = await supabase.from("api_keys").insert({
        organization_id: organizationId,
        user_id: user.id,
        name: `Primary API Key ${new Date().toLocaleDateString()}`,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        permissions: ["contacts:read", "deals:read", "analytics:read"],
        rate_limit: 1000,
        is_active: true,
      });

      if (insertError) throw insertError;

      setLatestPlaintextKey(token);
      toast.success("API key rotated. Copy it now — it will not be shown again.");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to rotate API key: " + error.message);
    } finally {
      setRotating(false);
    }
  }

  async function createWebhook(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!organizationId) {
        toast.error("No organization found. Please sign out and sign in again.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("manage-webhook", {
        body: {
          name: newWebhook.name,
          url: newWebhook.url,
          events: [newWebhook.events],
          organization_id: organizationId,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

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
      const { error } = await supabase
        .from("webhooks")
        .update({ is_active: !current, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("organization_id", organizationId);

      if (error) throw error;
      setWebhooks((previous) => previous.map((webhook) => (webhook.id === id ? { ...webhook, is_active: !current } : webhook)));
      toast.success(current ? "Webhook paused" : "Webhook activated");
    } catch (error: any) {
      toast.error("Failed to update webhook: " + error.message);
    }
  }

  async function deleteWebhook(id: string) {
    try {
      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", id)
        .eq("organization_id", organizationId);

      if (error) throw error;
      toast.success("Webhook deleted");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete webhook: " + error.message);
    }
  }

  async function copyKey() {
    const valueToCopy = latestPlaintextKey || null;

    if (!valueToCopy) {
      toast.error("Generate a new key to copy its full value.");
      return;
    }

    await navigator.clipboard.writeText(valueToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("API key copied");
  }

  const activeKey = apiKeys.find((key) => key.is_active) || apiKeys[0] || null;
  const displayedKey = latestPlaintextKey || (activeKey ? `${activeKey.key_prefix}...` : null);

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
            <code className="flex-1 bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground font-mono break-all">
              {displayedKey ?? "No API key configured"}
            </code>
            <Button variant="ghost" size="icon" onClick={copyKey} disabled={!latestPlaintextKey} className="text-muted-foreground hover:text-foreground hover:bg-accent">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={rotateApiKey} disabled={rotating || !organizationId} className="text-muted-foreground hover:text-foreground hover:bg-accent">
              {rotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            {latestPlaintextKey
              ? "This full key is visible only once. Copy and store it securely now."
              : "Only the key prefix is stored. Rotate the key to generate and copy a new full token."}
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
                  <Input required value={newWebhook.name} onChange={(e) => setNewWebhook((current) => ({ ...current, name: e.target.value }))} className="bg-muted border-border" placeholder="Production Webhook" />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input required type="url" value={newWebhook.url} onChange={(e) => setNewWebhook((current) => ({ ...current, url: e.target.value }))} className="bg-muted border-border" placeholder="https://api.yourservice.com/webhook" />
                </div>
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Input value={newWebhook.events} onChange={(e) => setNewWebhook((current) => ({ ...current, events: e.target.value }))} className="bg-muted border-border" />
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
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-foreground font-mono">{webhook.events?.[0] || "all"}</code>
                    <Badge className={webhook.is_active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0" : "bg-muted text-muted-foreground border-0"}>
                      {webhook.is_active ? "active" : "paused"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{webhook.url}</p>
                  <p className="text-xs text-muted-foreground/70">Created {new Date(webhook.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch checked={webhook.is_active} onCheckedChange={() => toggleWebhook(webhook.id, webhook.is_active)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteWebhook(webhook.id)}>
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
