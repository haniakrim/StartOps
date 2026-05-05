import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Plus, Copy, Trash2, Clock, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  last_used_at: string;
  is_active: boolean;
  created_at: string;
}

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    rate_limit: "1000",
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const keyValue = `crm_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const prefix = keyValue.substring(0, 8);

      const { error } = await supabase.from("api_keys").insert([
        {
          name: formData.name,
          key_hash: keyValue,
          key_prefix: prefix,
          rate_limit: parseInt(formData.rate_limit),
          permissions: ["read", "write"],
        },
      ]);

      if (error) throw error;

      setNewKey(keyValue);
      toast({ title: "API key created" });
      setFormData({ name: "", rate_limit: "1000" });
      fetchApiKeys();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "API key deleted" });
      fetchApiKeys();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">API Keys</h1>
          <p className="text-white/60 mt-1">Manage API access with rate limiting</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#6452db] hover:bg-[#5645c7] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-[#303236] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
            </DialogHeader>
            {newKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#8dc572]/10 border border-[#8dc572]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-[#8dc572]" />
                    <span className="text-sm font-medium text-[#8dc572]">API Key Created</span>
                  </div>
                  <p className="text-sm text-white/60 mb-3">
                    Copy this key now. You won&apos;t be able to see it again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded bg-[#0b0d10] text-sm text-white/85 font-mono break-all">
                      {newKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#303236] text-white/85 hover:bg-[#1f2126]"
                      onClick={() => copyToClipboard(newKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white"
                  onClick={() => {
                    setNewKey(null);
                    setShowDialog(false);
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                    placeholder="e.g. Production API"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (requests/hour)</Label>
                  <Select
                    value={formData.rate_limit}
                    onValueChange={(v) => setFormData({ ...formData, rate_limit: v })}
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18191b] border-[#303236]">
                      <SelectItem value="100">100/hour</SelectItem>
                      <SelectItem value="1000">1,000/hour</SelectItem>
                      <SelectItem value="10000">10,000/hour</SelectItem>
                      <SelectItem value="100000">100,000/hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white">
                  Generate Key
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Rate Limit Warning */}
      <Card className="bg-[#18191b] border-[#303236]">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#f0ad4e]/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#f0ad4e]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">Rate Limiting Active</h3>
              <p className="text-sm text-white/60 mt-0.5">
                All API requests are rate-limited per key. Exceeding limits will result in 429 responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#18191b] border-[#303236]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#303236] hover:bg-transparent">
                <TableHead className="text-white/60">Name</TableHead>
                <TableHead className="text-white/60">Key</TableHead>
                <TableHead className="text-white/60">Rate Limit</TableHead>
                <TableHead className="text-white/60">Last Used</TableHead>
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
              ) : apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/45">
                    <div className="flex flex-col items-center gap-2">
                      <Key className="w-8 h-8 text-white/30" />
                      <p>No API keys yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((key) => (
                  <TableRow key={key.id} className="border-[#303236] hover:bg-[#1f2126]">
                    <TableCell>
                      <span className="text-white text-sm font-medium">{key.name}</span>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm text-white/65 font-mono">
                        {key.key_prefix}••••••••••••
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-[#303236] text-white/60">
                        {key.rate_limit.toLocaleString()}/hr
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-white/65">
                        <Clock className="w-3 h-3" />
                        {key.last_used_at
                          ? new Date(key.last_used_at).toLocaleDateString()
                          : "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          key.is_active
                            ? "border-[#8dc572]/40 text-[#8dc572]"
                            : "border-[#61656b]/40 text-[#61656b]"
                        }`}
                      >
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/45 hover:text-[#eb5757] hover:bg-[#eb5757]/10"
                        onClick={() => handleDelete(key.id)}
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
