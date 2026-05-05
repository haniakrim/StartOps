import { useState } from "react";
import {
  Webhook,
  Key,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  X,
  Clock,
  Activity,
  Globe,
  Shield,
  AlertTriangle,
  Code,
  Terminal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const apiKeys = [
  {
    id: 1,
    name: "Production API Key",
    key: "sk_live_51H8x...9zK2m",
    created: "Jan 15, 2024",
    lastUsed: "2 hours ago",
    status: "active",
    rateLimit: "10,000/hr",
  },
  {
    id: 2,
    name: "Staging API Key",
    key: "sk_test_4fJk...7mNp2",
    created: "Feb 1, 2024",
    lastUsed: "1 day ago",
    status: "active",
    rateLimit: "5,000/hr",
  },
  {
    id: 3,
    name: "Integration - Salesforce",
    key: "sk_live_8vBn...3xYz9",
    created: "Mar 10, 2024",
    lastUsed: "5 min ago",
    status: "active",
    rateLimit: "2,000/hr",
  },
];

const webhooks = [
  {
    id: 1,
    name: "Deal Status Changes",
    url: "https://api.company.com/webhooks/deals",
    events: ["deal.created", "deal.updated", "deal.won", "deal.lost"],
    status: "active",
    lastDelivery: "2 min ago",
    successRate: 99.8,
  },
  {
    id: 2,
    name: "Contact Updates",
    url: "https://api.company.com/webhooks/contacts",
    events: ["contact.created", "contact.updated", "contact.deleted"],
    status: "active",
    lastDelivery: "15 min ago",
    successRate: 100,
  },
  {
    id: 3,
    name: "Slack Notifications",
    url: "https://hooks.slack.com/services/...",
    events: ["deal.won", "meeting.scheduled"],
    status: "paused",
    lastDelivery: "2 days ago",
    successRate: 94.2,
  },
];

const rateLimits = [
  { tier: "Free", requests: "1,000/day", burst: "100/min" },
  { tier: "Starter", requests: "10,000/day", burst: "500/min" },
  { tier: "Professional", requests: "100,000/day", burst: "2,000/min" },
  { tier: "Enterprise", requests: "Unlimited", burst: "10,000/min" },
];

export default function ApiWebhooks() {
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          API & Integrations
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Manage API keys, webhooks, and third-party integrations
        </p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="api"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger
            value="webhooks"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger
            value="limits"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Activity className="w-4 h-4 mr-2" />
            Rate Limits
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Code className="w-4 h-4 mr-2" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-white">API Keys</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#18191b] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Generate New API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Key Name</Label>
                    <Input
                      placeholder="e.g., Production API"
                      className="bg-[#0b0d10] border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Rate Limit Tier</Label>
                    <Select>
                      <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                        <SelectItem value="starter">Starter (10K/day)</SelectItem>
                        <SelectItem value="pro">Professional (100K/day)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                    Generate Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <Card
                key={apiKey.id}
                className="bg-[#18191b] border-white/10"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                        <Key className="w-5 h-5 text-[#6452db]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">
                          {apiKey.name}
                        </h4>
                        <p className="text-xs text-white/40">
                          Created {apiKey.created} · Last used {apiKey.lastUsed}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/40 hover:text-[#be6464] hover:bg-[#be6464]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                    <code className="text-sm text-white/70 font-mono flex-1">
                      {showKey[apiKey.id] ? apiKey.key : "sk_••••••••••••••••••"}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/5"
                      onClick={() =>
                        setShowKey((prev) => ({
                          ...prev,
                          [apiKey.id]: !prev[apiKey.id],
                        }))
                      }
                    >
                      {showKey[apiKey.id] ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/5"
                      onClick={() => copyKey(apiKey.key)}
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-[#8dc572]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>Rate limit: {apiKey.rateLimit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Expires: Never</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-white">Webhook Endpoints</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#18191b] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Add Webhook Endpoint</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Webhook Name</Label>
                    <Input
                      placeholder="e.g., Slack Notifications"
                      className="bg-[#0b0d10] border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Endpoint URL</Label>
                    <Input
                      placeholder="https://..."
                      className="bg-[#0b0d10] border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Events</Label>
                    <Select>
                      <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                        <SelectValue placeholder="Select events" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="deals">Deal Events</SelectItem>
                        <SelectItem value="contacts">Contact Events</SelectItem>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                    Create Webhook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {webhooks.map((hook) => (
              <Card
                key={hook.id}
                className="bg-[#18191b] border-white/10"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#5683da]/20 flex items-center justify-center">
                        <Webhook className="w-5 h-5 text-[#5683da]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">
                          {hook.name}
                        </h4>
                        <p className="text-xs text-white/40 font-mono mt-0.5">
                          {hook.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={hook.status === "active"}
                        className="data-[state=checked]:bg-[#6452db]"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/40 hover:text-[#be6464] hover:bg-[#be6464]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {hook.events.map((event) => (
                      <Badge
                        key={event}
                        variant="secondary"
                        className="bg-white/5 text-white/50 text-xs border border-white/5"
                      >
                        {event}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-4">
                      <span>Last delivery: {hook.lastDelivery}</span>
                      <span
                        className={`flex items-center gap-1 ${
                          hook.successRate >= 99
                            ? "text-[#8dc572]"
                            : hook.successRate >= 95
                            ? "text-[#f0ad4e]"
                            : "text-[#be6464]"
                        }`}
                      >
                        <Activity className="w-3 h-3" />
                        {hook.successRate}% success rate
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-white/40 hover:text-white hover:bg-white/5"
                    >
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="limits" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base font-medium">
                Rate Limit Tiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rateLimits.map((tier) => (
                  <div
                    key={tier.tier}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#0b0d10] border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#6452db]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {tier.tier}
                        </p>
                        <p className="text-xs text-white/40">
                          {tier.requests} · Burst: {tier.burst}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        tier.tier === "Enterprise"
                          ? "bg-[#ff8964]/20 text-[#ff8964]"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {tier.tier === "Enterprise" ? "Current Plan" : "Available"}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-[#f0ad4e]/10 border border-[#f0ad4e]/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#f0ad4e] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Current Usage
                    </p>
                    <p className="text-sm text-white/50 mt-1">
                      You've used 7,240 out of 10,000 requests today (72.4%).
                      Rate limit resets in 4 hours.
                    </p>
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#f0ad4e]"
                        style={{ width: "72.4%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base font-medium">
                API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-[#5683da]" />
                    <span className="text-sm font-medium text-white">
                      Base URL
                    </span>
                  </div>
                  <code className="block p-3 rounded bg-[#18191b] border border-white/5 text-sm text-white/70 font-mono">
                    https://api.nexuscrm.com/v1
                  </code>
                </div>

                <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-4 h-4 text-[#ff8964]" />
                    <span className="text-sm font-medium text-white">
                      Authentication
                    </span>
                  </div>
                  <p className="text-sm text-white/50 mb-3">
                    Include your API key in the Authorization header:
                  </p>
                  <code className="block p-3 rounded bg-[#18191b] border border-white/5 text-sm text-white/70 font-mono">
                    Authorization: Bearer sk_live_...
                  </code>
                </div>

                <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Webhook className="w-4 h-4 text-[#6452db]" />
                    <span className="text-sm font-medium text-white">
                      Example Request
                    </span>
                  </div>
                  <pre className="p-3 rounded bg-[#18191b] border border-white/5 text-sm text-white/70 font-mono overflow-x-auto">
                    {`curl -X GET https://api.nexuscrm.com/v1/contacts \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    OpenAPI Spec
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    SDK Downloads
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
