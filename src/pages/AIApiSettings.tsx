import { useState, useEffect } from "react";
import { Brain, Plus, Trash2, Check, Copy, Loader2, Edit2, X, Save, Globe, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  isDefault: boolean;
  createdAt: string;
}

const STORAGE_KEY = "startops_ai_providers";

function generateId() {
  return crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadProviders(): AIProvider[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}

function saveProviders(providers: AIProvider[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
}

export default function AIApiSettings() {
  const [providers, setProviders] = useState<AIProvider[]>(loadProviders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    baseUrl: "",
    apiKey: "",
  });

  useEffect(() => {
    saveProviders(providers);
  }, [providers]);

  const resetForm = () => {
    setForm({ name: "", baseUrl: "", apiKey: "" });
    setEditingId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (provider: AIProvider) => {
    setForm({
      name: provider.name,
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey,
    });
    setEditingId(provider.id);
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.baseUrl.trim()) {
      toast.error("Name and Base URL are required");
      return;
    }

    if (editingId) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: form.name.trim(), baseUrl: form.baseUrl.trim(), apiKey: form.apiKey.trim() }
            : p
        )
      );
      toast.success("Provider updated");
    } else {
      const newProvider: AIProvider = {
        id: generateId(),
        name: form.name.trim(),
        baseUrl: form.baseUrl.trim(),
        apiKey: form.apiKey.trim(),
        isDefault: providers.length === 0,
        createdAt: new Date().toISOString(),
      };
      setProviders((prev) => [...prev, newProvider]);
      toast.success("Provider added");
    }

    setDialogOpen(false);
    resetForm();
  };

  const deleteProvider = (id: string) => {
    setProviders((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      // If we removed the default, set the first remaining as default
      if (filtered.length > 0 && !filtered.some((p) => p.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    toast.success("Provider removed");
  };

  const setDefault = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id }))
    );
    toast.success("Default provider set");
  };

  const copyKey = async (provider: AIProvider) => {
    await navigator.clipboard.writeText(provider.apiKey);
    setCopiedId(provider.id);
    toast.success("API key copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const testProvider = async (provider: AIProvider) => {
    setTestingId(provider.id);
    try {
      const response = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success(`${provider.name} is connected and responding`);
      } else {
        const body = await response.text().catch(() => "");
        toast.error(`Connection failed (${response.status}): ${body.slice(0, 200)}`);
      }
    } catch (error: any) {
      toast.error("Connection failed: " + (error.message || "Network error"));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">AI API Settings</h1>
        <p className="text-muted-foreground mt-1">Manage custom OpenAI-compatible providers</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              AI Providers
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Configure custom OpenAI-compatible endpoints (Ollama, vLLM, etc.)
            </CardDescription>
          </div>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {providers.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/30">
              <Brain className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No AI providers configured yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add an OpenAI-compatible provider to power AI features.
              </p>
              <Button size="sm" variant="outline" className="mt-4" onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Provider
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-muted rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {provider.name}
                      </span>
                      {provider.isDefault && (
                        <Badge className="bg-primary/15 text-primary border-0 text-[10px] px-1.5 py-0 h-4">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{provider.baseUrl}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                      <KeyRound className="w-3 h-3" />
                      <span className="font-mono truncate">
                        {provider.apiKey ? "••••••••" + provider.apiKey.slice(-4) : "No key"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!provider.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefault(provider.id)}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyKey(provider)}
                      disabled={!provider.apiKey}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Copy API key"
                    >
                      {copiedId === provider.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => testProvider(provider)}
                      disabled={testingId === provider.id}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Test connection"
                    >
                      {testingId === provider.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(provider)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Edit provider"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProvider(provider.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Delete provider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Quick Start</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Common OpenAI-compatible providers you can add
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-3">
          <button
            onClick={() => {
              setForm({ name: "Ollama Cloud", baseUrl: "https://ollama.com/v1", apiKey: "" });
              setEditingId(null);
              setDialogOpen(true);
            }}
            className="w-full text-left p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Ollama Cloud</p>
                <p className="text-xs text-muted-foreground">https://ollama.com/v1</p>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Provider" : "Add Custom OpenAI Provider"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Name</Label>
              <Input
                id="provider-name"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ollama Cloud"
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-url">Base URL</Label>
              <Input
                id="provider-url"
                required
                type="url"
                value={form.baseUrl}
                onChange={(e) => setForm((p) => ({ ...p, baseUrl: e.target.value }))}
                placeholder="https://ollama.com/v1"
                className="bg-muted border-border"
              />
              <p className="text-xs text-muted-foreground">
                Must be an OpenAI-compatible API endpoint (e.g. /chat/completions)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-key">API Key</Label>
              <Input
                id="provider-key"
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))}
                placeholder="sk-..."
                className="bg-muted border-border"
              />
              <p className="text-xs text-muted-foreground">
                Optional for local providers like Ollama. Required for cloud endpoints.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update" : "Add Provider"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
