import { useState } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Send,
  Paperclip,
  ChevronDown,
  ChevronRight,
  Star,
  BookOpen,
  Video,
  FileText,
  Headphones,
  Zap,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tickets = [
  {
    id: "SUP-2024-001",
    subject: "SSO Integration Issue with Okta",
    status: "open",
    priority: "high",
    category: "Technical",
    created: "2 hours ago",
    lastUpdate: "30 min ago",
    assignee: "Support Team",
    messages: 3,
  },
  {
    id: "SUP-2024-002",
    subject: "API Rate Limit Questions",
    status: "in-progress",
    priority: "medium",
    category: "API",
    created: "1 day ago",
    lastUpdate: "4 hours ago",
    assignee: "James Wilson",
    messages: 5,
  },
  {
    id: "SUP-2024-003",
    subject: "Custom Field Configuration Help",
    status: "resolved",
    priority: "low",
    category: "Configuration",
    created: "3 days ago",
    lastUpdate: "1 day ago",
    assignee: "Sarah Chen",
    messages: 8,
  },
  {
    id: "SUP-2024-004",
    subject: "Data Export Format Request",
    status: "open",
    priority: "medium",
    category: "Feature Request",
    created: "5 hours ago",
    lastUpdate: "1 hour ago",
    assignee: "Support Team",
    messages: 2,
  },
  {
    id: "SUP-2024-005",
    subject: "User Permission Audit",
    status: "in-progress",
    priority: "high",
    category: "Security",
    created: "12 hours ago",
    lastUpdate: "2 hours ago",
    assignee: "Mike Ross",
    messages: 4,
  },
];

const slaMetrics = [
  { label: "First Response", target: "< 1 hour", current: "42 min", status: "met" },
  { label: "Resolution Time", target: "< 4 hours", current: "3h 12m", status: "met" },
  { label: "Uptime Guarantee", target: "99.9%", current: "99.97%", status: "met" },
  { label: "CSAT Score", target: "> 4.5", current: "4.7", status: "met" },
];

const resources = [
  {
    title: "Getting Started Guide",
    type: "Documentation",
    icon: BookOpen,
    color: "#5683da",
    description: "Learn the basics of NexusCRM",
  },
  {
    title: "API Reference",
    type: "Documentation",
    icon: FileText,
    color: "#6452db",
    description: "Complete API documentation",
  },
  {
    title: "Video Tutorials",
    type: "Video",
    icon: Video,
    color: "#ff8964",
    description: "Step-by-step video guides",
  },
  {
    title: "Best Practices",
    type: "Guide",
    icon: Star,
    color: "#8dc572",
    description: "Enterprise implementation tips",
  },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; text: string }> = {
  open: { icon: AlertCircle, color: "#f0ad4e", bg: "bg-[#f0ad4e]/20", text: "text-[#f0ad4e]" },
  "in-progress": { icon: Clock, color: "#5683da", bg: "bg-[#5683da]/20", text: "text-[#5683da]" },
  resolved: { icon: CheckCircle2, color: "#8dc572", bg: "bg-[#8dc572]/20", text: "text-[#8dc572]" },
};

const priorityColors: Record<string, string> = {
  high: "bg-[#be6464]/20 text-[#be6464]",
  medium: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  low: "bg-white/10 text-white/50",
};

export default function Support() {
  const [search, setSearch] = useState("");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const filtered = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Support Portal
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Enterprise SLA support and help center
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Subject</Label>
                <Input
                  placeholder="Brief description of your issue"
                  className="bg-[#0b0d10] border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Category</Label>
                  <Select>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Priority</Label>
                  <Select>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Textarea
                  placeholder="Provide detailed information about your issue..."
                  className="bg-[#0b0d10] border-white/10 text-white min-h-[120px]"
                />
              </div>
              <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SLA Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {slaMetrics.map((metric) => (
          <Card key={metric.label} className="bg-[#18191b] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">{metric.label}</span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    metric.status === "met"
                      ? "bg-[#8dc572]/20 text-[#8dc572]"
                      : "bg-[#be6464]/20 text-[#be6464]"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  SLA Met
                </Badge>
              </div>
              <p className="text-xl font-semibold text-white">{metric.current}</p>
              <p className="text-xs text-white/40 mt-1">
                Target: {metric.target}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="tickets"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Tickets
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger
            value="sla"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Shield className="w-4 h-4 mr-2" />
            SLA Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
              />
            </div>
          </div>

          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="w-8"></th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                        Last Update
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ticket) => {
                      const status = statusConfig[ticket.status];
                      const StatusIcon = status.icon;
                      const isExpanded = expandedTicket === ticket.id;

                      return (
                        <>
                          <tr
                            key={ticket.id}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                            onClick={() =>
                              setExpandedTicket(isExpanded ? null : ticket.id)
                            }
                          >
                            <td className="py-3 px-4">
                              <button className="text-white/30 hover:text-white/60">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {ticket.subject}
                                </p>
                                <p className="text-xs text-white/40">
                                  {ticket.id} · {ticket.messages} messages
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${status.bg} ${status.text}`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${priorityColors[ticket.priority]}`}
                              >
                                {ticket.priority}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-white/50">
                              {ticket.category}
                            </td>
                            <td className="py-3 px-4 text-sm text-white/70">
                              {ticket.assignee}
                            </td>
                            <td className="py-3 px-4 text-sm text-white/50">
                              {ticket.lastUpdate}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-[#0b0d10]">
                              <td colSpan={7} className="py-4 px-4 pl-12">
                                <div className="space-y-3">
                                  <div className="p-3 rounded-lg border border-white/5 bg-[#18191b]">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-[#6452db] flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-medium">
                                          JD
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium text-white">
                                            John Doe
                                          </span>
                                          <span className="text-xs text-white/40">
                                            {ticket.created}
                                          </span>
                                        </div>
                                        <p className="text-sm text-white/70">
                                          I've been experiencing issues with the
                                          SSO integration. The SAML response seems
                                          to be rejected with an invalid signature
                                          error.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-lg border border-white/5 bg-[#18191b]">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-[#5683da] flex items-center justify-center flex-shrink-0">
                                        <Headphones className="w-4 h-4 text-white" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium text-white">
                                            Support Team
                                          </span>
                                          <span className="text-xs text-white/40">
                                            {ticket.lastUpdate}
                                          </span>
                                        </div>
                                        <p className="text-sm text-white/70">
                                          Thanks for reaching out. We're
                                          investigating the SAML certificate
                                          configuration. Could you please share
                                          your IdP metadata XML?
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      placeholder="Type your reply..."
                                      className="bg-[#18191b] border-white/10 text-white flex-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-white/40 hover:text-white hover:bg-white/5"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <Card
                key={resource.title}
                className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${resource.color}20` }}
                    >
                      <resource.icon
                        className="w-6 h-6"
                        style={{ color: resource.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium text-white">
                          {resource.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-white/10 text-white/50 text-xs"
                        >
                          {resource.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/50">
                        {resource.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#18191b] border-white/10 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base font-medium">
                Enterprise Support Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Headphones,
                    title: "Priority Support",
                    description: "Direct access to senior support engineers",
                    color: "#5683da",
                  },
                  {
                    icon: Zap,
                    title: "Emergency Escalation",
                    description: "24/7 critical issue response",
                    color: "#ff8964",
                  },
                  {
                    icon: Shield,
                    title: "Dedicated CSM",
                    description: "Personal customer success manager",
                    color: "#6452db",
                  },
                ].map((channel) => (
                  <div
                    key={channel.title}
                    className="p-4 rounded-lg bg-[#0b0d10] border border-white/5"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${channel.color}20` }}
                    >
                      <channel.icon
                        className="w-5 h-5"
                        style={{ color: channel.color }}
                      />
                    </div>
                    <h4 className="text-sm font-medium text-white mb-1">
                      {channel.title}
                    </h4>
                    <p className="text-xs text-white/50">
                      {channel.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <h3 className="text-base font-medium text-white mb-4">
                Enterprise SLA Agreement
              </h3>
              <div className="space-y-4">
                {[
                  {
                    tier: "Critical",
                    response: "15 minutes",
                    resolution: "2 hours",
                    availability: "99.99%",
                    channels: "Phone, Chat, Email",
                  },
                  {
                    tier: "High",
                    response: "1 hour",
                    resolution: "4 hours",
                    availability: "99.95%",
                    channels: "Chat, Email",
                  },
                  {
                    tier: "Medium",
                    response: "4 hours",
                    resolution: "24 hours",
                    availability: "99.9%",
                    channels: "Email",
                  },
                  {
                    tier: "Low",
                    response: "8 hours",
                    resolution: "72 hours",
                    availability: "99.9%",
                    channels: "Email",
                  },
                ].map((sla) => (
                  <div
                    key={sla.tier}
                    className="p-4 rounded-lg bg-[#0b0d10] border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white">
                        {sla.tier} Priority
                      </h4>
                      <Badge
                        variant="secondary"
                        className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
                      >
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-white/40">First Response</p>
                        <p className="text-sm text-white">{sla.response}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Resolution</p>
                        <p className="text-sm text-white">{sla.resolution}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Availability</p>
                        <p className="text-sm text-white">{sla.availability}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Channels</p>
                        <p className="text-sm text-white">{sla.channels}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
