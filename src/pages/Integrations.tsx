import { useState } from "react";
import {
  Plug,
  Webhook,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  Zap,
  Globe,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  FileSpreadsheet,
  Code,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failed";
  lastDelivery: string;
  successRate: number;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  rateLimit: string;
  status: "active" | "revoked";
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  status: "connected" | "disconnected" | "pending";
  connectedAt?: string;
}

const webhooks: WebhookConfig[] = [
  { id: "1", name: "Deal Updates", url: "https://api.company.com/webhooks/deals", events: ["deal.created", "deal.updated", "deal.closed"], status: "active", lastDelivery: "2 min ago", successRate: 99.2 },
  { id: "2", name: "Contact Sync", url: "https://hooks.zapier.com/hooks/catch/123/abc", events: ["contact.created", "contact.updated"], status: "active", lastDelivery: "5 min ago", successRate: 97.8 },
  { id: "3", name: "Slack Notifications", url: "https://hooks.slack.com/services/T00/B00/XXX", events: ["deal.closed", "task.overdue"], status: "failed", lastDelivery: "1 hr ago", successRate: 45.3 },
];

const apiKeys: ApiKey[] = [
  { id: "1", name: "Production API", key: "nexus_live_xxxxxxxxxxxx1234", created: "Oct 15, 2024", lastUsed: "2 min ago", rateLimit: "10,000/hr", status: "active" },
  { id: "2", name: "Staging API", key: "nexus_test_xxxxxxxxxxxx5678", created: "Sep 1, 2024", lastUsed: "1 hr ago", rateLimit: "1,000/hr", status: "active" },
  { id: "3", name: "Legacy Integration", key: "nexus_legacy_xxxxxxxxxxxx9012", created: "Jan 10, 2024", lastUsed: "Never", rateLimit: "500/hr", status: "revoked" },
];

const integrations: Integration[] = [
  { id: "1", name: "Slack", description: "Send notifications and updates to Slack channels", icon: MessageSquare, category: "Communication", status: "connected", connectedAt: "Oct 10, 2024" },
  { id: "2", name: "Google Workspace", description: "Sync contacts and calendar events", icon: Calendar, category: "Productivity", status: "connected", connectedAt: "Sep 5, 2024" },
  { id: "3", name: "Salesforce", description: "Bi-directional sync with Salesforce CRM", icon: Database, category: "CRM", status: "connected", connectedAt: "Aug 20, 2024" },
  { id: "4", name: "HubSpot", description: "Import contacts and track marketing campaigns", icon: Globe, category: "Marketing", status: "disconnected" },
  { id: "5", name: "Zapier", description: "Automate workflows with 5000+ apps", icon: Zap, category: "Automation", status: "connected", connectedAt: "Jul 15, 2024" },
  { id: "6", name: "SendGrid", description: "Send transactional and marketing emails", icon: Mail, category: "Communication", status: "pending" },
  { id: "7", name: "Stripe", description: "Process payments and manage subscriptions", icon: CreditCardIcon, category: "Finance", status: "connected", connectedAt: "Jun 1, 2024" },
  { id: "8", name: "Airtable", description: "Sync data with Airtable bases", icon: FileSpreadsheet, category: "Database", status: "disconnected" },
];

function CreditCardIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

const statusColors = {
  active: "bg-success/15 text-success border-success/20",
  inactive: "bg-white/5 text-white/45 border-white/10",
  failed: "bg-app-error/15 text-app-error border-app-error/20",
  connected: "bg-success/15 text-success border-success/20",
  disconnected: "bg-white/5 text-white/45 border-white/10",
  pending: "bg-warning/15 text-warning border-warning/20",
  revoked: "bg-app-error/15 text-app-error border-app-error/20",
};

export default function Integrations() {
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-app font-bold text-white">API & Integrations</h1>
          <p className="text-sm text-white/45 mt-0.5">
            Manage webhooks, API keys, and third-party integrations
          </p>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="bg-surface border border-hairline-soft">
          <TabsTrigger value="integrations" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Plug className="w-3.5 h-3.5 mr-1.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Webhook className="w-3.5 h-3.5 mr-1.5" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Key className="w-3.5 h-3.5 mr-1.5" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="bg-surface border-hairline-soft rounded-xl">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-lg bg-surface-elevated border border-hairline-soft">
                        <Icon className="w-5 h-5 text-white/65" />
                      </div>
                      <Badge variant="outline" className={`${statusColors[integration.status]} text-xs capitalize`}>
                        {integration.status}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium text-white/85 mb-1">{integration.name}</h3>
                    <p className="text-xs text-white/45 mb-4 line-clamp-2">{integration.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/30">{integration.category}</span>
                      {integration.status === "connected" ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span className="text-xs text-white/45">{integration.connectedAt}</span>
                        </div>
                      ) : integration.status === "pending" ? (
                        <Button variant="outline" size="sm" className="border-hairline-soft text-warning hover:text-warning hover:bg-warning/10 text-xs h-7">
                          Complete Setup
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="border-hairline-soft text-white/65 hover:text-white hover:bg-white/5 text-xs h-7">
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-violet hover:bg-violet/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-surface-elevated border-hairline-soft text-white max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-app font-bold">Add Webhook</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Webhook Name</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="My Webhook" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Endpoint URL</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Events</Label>
                    <Select>
                      <SelectTrigger className="bg-surface border-hairline-soft text-white">
                        <SelectValue placeholder="Select events" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface-elevated border-hairline-soft">
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="deals">Deal Events</SelectItem>
                        <SelectItem value="contacts">Contact Events</SelectItem>
                        <SelectItem value="tasks">Task Events</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-violet hover:bg-violet/90 text-white" onClick={() => setShowAddWebhook(false)}>
                    Create Webhook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-surface border-hairline-soft rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="data-table-header text-left">
                    <th className="px-4 py-2.5 font-app font-medium">Webhook</th>
                    <th className="px-4 py-2.5 font-app font-medium">Events</th>
                    <th className="px-4 py-2.5 font-app font-medium">Status</th>
                    <th className="px-4 py-2.5 font-app font-medium">Success Rate</th>
                    <th className="px-4 py-2.5 font-app font-medium">Last Delivery</th>
                    <th className="px-4 py-2.5 font-app font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((webhook) => (
                    <tr key={webhook.id} className="data-table-row hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white/85">{webhook.name}</p>
                          <p className="text-xs text-white/30 truncate max-w-[200px]">{webhook.url}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="border-hairline-soft text-white/45 text-[10px] px-1.5">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`${statusColors[webhook.status]} text-xs capitalize`}>
                          {webhook.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={webhook.successRate} className="w-16 h-1.5 bg-white/5" />
                          <span className="text-xs text-white/65">{webhook.successRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/45">{webhook.lastDelivery}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5 h-7 text-xs">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button variant="outline" size="sm" className="border-hairline-soft text-app-error hover:text-app-error hover:bg-app-error/10 h-7 text-xs">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-violet hover:bg-violet/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-surface-elevated border-hairline-soft text-white max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-app font-bold">Generate API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Key Name</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="Production API" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Rate Limit</Label>
                    <Select>
                      <SelectTrigger className="bg-surface border-hairline-soft text-white">
                        <SelectValue placeholder="Select rate limit" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface-elevated border-hairline-soft">
                        <SelectItem value="1000">1,000/hour</SelectItem>
                        <SelectItem value="5000">5,000/hour</SelectItem>
                        <SelectItem value="10000">10,000/hour</SelectItem>
                        <SelectItem value="50000">50,000/hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-violet hover:bg-violet/90 text-white" onClick={() => setShowAddKey(false)}>
                    Generate Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-surface border-hairline-soft rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="data-table-header text-left">
                    <th className="px-4 py-2.5 font-app font-medium">Name</th>
                    <th className="px-4 py-2.5 font-app font-medium">API Key</th>
                    <th className="px-4 py-2.5 font-app font-medium">Rate Limit</th>
                    <th className="px-4 py-2.5 font-app font-medium">Status</th>
                    <th className="px-4 py-2.5 font-app font-medium">Last Used</th>
                    <th className="px-4 py-2.5 font-app font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="data-table-row hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-white/30" />
                          <span className="text-sm font-medium text-white/85">{apiKey.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-white/45 font-mono bg-surface-elevated px-2 py-1 rounded">
                            {apiKey.key}
                          </code>
                          <button
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                            className="p-1 rounded text-white/30 hover:text-white/65 hover:bg-white/5 transition-colors"
                          >
                            {copiedKey === apiKey.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-hairline-soft text-white/45 text-xs">
                          {apiKey.rateLimit}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`${statusColors[apiKey.status]} text-xs capitalize`}>
                          {apiKey.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/45">{apiKey.lastUsed}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" className="border-hairline-soft text-app-error hover:text-app-error hover:bg-app-error/10 h-7 text-xs">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* API Documentation Card */}
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-violet/10">
                  <Code className="w-5 h-5 text-violet" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white/85">API Documentation</h3>
                  <p className="text-xs text-white/45 mt-0.5">
                    Explore our REST API with OpenAPI specification
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-hairline-soft text-white/65 hover:text-white hover:bg-white/5">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  View Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
