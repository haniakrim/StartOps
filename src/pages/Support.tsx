import { useState } from "react";
import {
  HeadphonesIcon,
  Search,
  MessageCircle,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
  Send,
  Paperclip,
  Star,
  BookOpen,
  Video,
  FileText,
  LifeBuoy,
  Zap,
  Shield,
  Globe,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TicketItem {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  created: string;
  updated: string;
  assignee: string;
  messages: number;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
  lastUpdated: string;
}

const tickets: TicketItem[] = [
  { id: "SUP-2024-001", subject: "SSO Integration Issue with Okta", description: "Users unable to authenticate via SAML after recent update", status: "in_progress", priority: "high", category: "Authentication", created: "Dec 14, 2024", updated: "2 hours ago", assignee: "Enterprise Support", messages: 8 },
  { id: "SUP-2024-002", subject: "API Rate Limit Questions", description: "Need clarification on rate limits for bulk operations", status: "open", priority: "medium", category: "API", created: "Dec 13, 2024", updated: "1 day ago", assignee: "Unassigned", messages: 2 },
  { id: "SUP-2024-003", subject: "Custom Field Data Migration", description: "Migrating from Salesforce, need help with custom field mapping", status: "in_progress", priority: "medium", category: "Migration", created: "Dec 12, 2024", updated: "3 hours ago", assignee: "Technical Support", messages: 5 },
  { id: "SUP-2024-004", subject: "Webhook Retry Configuration", description: "Webhooks failing intermittently, need to adjust retry policy", status: "resolved", priority: "low", category: "Integrations", created: "Dec 10, 2024", updated: "2 days ago", assignee: "Technical Support", messages: 4 },
  { id: "SUP-2024-005", subject: "Enterprise SLA Clarification", description: "Questions about response times for P1 incidents", status: "open", priority: "urgent", category: "Billing", created: "Dec 15, 2024", updated: "30 min ago", assignee: "Account Manager", messages: 1 },
  { id: "SUP-2024-006", subject: "Two-Factor Auth Setup", description: "Team members having trouble with TOTP setup", status: "resolved", priority: "low", category: "Security", created: "Dec 8, 2024", updated: "5 days ago", assignee: "Technical Support", messages: 6 },
];

const articles: KnowledgeArticle[] = [
  { id: "1", title: "Setting up SAML 2.0 SSO with Okta", category: "Authentication", views: 1247, helpful: 98, lastUpdated: "Nov 15, 2024" },
  { id: "2", title: "API Rate Limits and Best Practices", category: "API", views: 892, helpful: 95, lastUpdated: "Oct 20, 2024" },
  { id: "3", title: "Migrating from Salesforce", category: "Migration", views: 756, helpful: 92, lastUpdated: "Sep 5, 2024" },
  { id: "4", title: "Webhook Configuration Guide", category: "Integrations", views: 634, helpful: 88, lastUpdated: "Nov 1, 2024" },
  { id: "5", title: "Enterprise Security Checklist", category: "Security", views: 521, helpful: 96, lastUpdated: "Dec 1, 2024" },
  { id: "6", title: "Custom Fields and Workflows", category: "Features", views: 489, helpful: 90, lastUpdated: "Oct 15, 2024" },
];

const statusColors = {
  open: "bg-electric-blue/10 text-electric-blue border-electric-blue/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-white/5 text-white/45 border-white/10",
};

const priorityColors = {
  low: "bg-white/5 text-white/45 border-white/10",
  medium: "bg-electric-blue/10 text-electric-blue border-electric-blue/20",
  high: "bg-warning/10 text-warning border-warning/20",
  urgent: "bg-app-error/10 text-app-error border-app-error/20",
};

export default function Support() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-app font-bold text-white">Support Portal</h1>
          <p className="text-sm text-white/45 mt-0.5">
            Get help, track tickets, and access resources
          </p>
        </div>
        <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-violet hover:bg-violet/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-elevated border-hairline-soft text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-app font-bold">Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs text-white/65">Subject</label>
                <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="Brief description of your issue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/65">Category</label>
                  <Select>
                    <SelectTrigger className="bg-surface border-hairline-soft text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-elevated border-hairline-soft">
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="integrations">Integrations</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/65">Priority</label>
                  <Select>
                    <SelectTrigger className="bg-surface border-hairline-soft text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-elevated border-hairline-soft">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/65">Description</label>
                <Textarea
                  className="bg-surface border-hairline-soft text-white placeholder:text-white/30 min-h-[120px] resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-hairline-soft border-dashed">
                <Paperclip className="w-4 h-4 text-white/30" />
                <span className="text-xs text-white/30">Attach files (max 10MB)</span>
              </div>
              <Button className="w-full bg-violet hover:bg-violet/90 text-white" onClick={() => setShowNewTicket(false)}>
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SLA Banner */}
      <Card className="bg-surface border-hairline-soft rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center">
            <div className="flex-1 p-5 border-r border-hairline-soft">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-coral" />
                <span className="text-xs font-medium text-coral uppercase tracking-wider">Enterprise SLA</span>
              </div>
              <h3 className="text-sm font-medium text-white/85 mb-1">Priority Support</h3>
              <p className="text-xs text-white/45">
                P1: 15 min · P2: 1 hr · P3: 4 hrs · P4: 24 hrs
              </p>
            </div>
            <div className="flex-1 p-5 border-r border-hairline-soft">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-xs font-medium text-success uppercase tracking-wider">Uptime Guarantee</span>
              </div>
              <h3 className="text-sm font-medium text-white/85 mb-1">99.99% SLA</h3>
              <p className="text-xs text-white/45">
                Monthly uptime with financial backing
              </p>
            </div>
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-2">
                <LifeBuoy className="w-4 h-4 text-electric-blue" />
                <span className="text-xs font-medium text-electric-blue uppercase tracking-wider">Dedicated Support</span>
              </div>
              <h3 className="text-sm font-medium text-white/85 mb-1">Account Team</h3>
              <p className="text-xs text-white/45">
                Dedicated CSM and technical architect
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="bg-surface border border-hairline-soft">
          <TabsTrigger value="tickets" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Ticket className="w-3.5 h-3.5 mr-1.5" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Contact Us
          </TabsTrigger>
        </TabsList>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardContent className="p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-md bg-canvas border border-hairline-soft text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-hairline-soft rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="data-table-header text-left">
                    <th className="px-4 py-2.5 font-app font-medium">Ticket</th>
                    <th className="px-4 py-2.5 font-app font-medium">Subject</th>
                    <th className="px-4 py-2.5 font-app font-medium">Status</th>
                    <th className="px-4 py-2.5 font-app font-medium">Priority</th>
                    <th className="px-4 py-2.5 font-app font-medium">Category</th>
                    <th className="px-4 py-2.5 font-app font-medium">Assignee</th>
                    <th className="px-4 py-2.5 font-app font-medium">Last Update</th>
                    <th className="px-4 py-2.5 font-app font-medium text-right">Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="data-table-row hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-white/65">{ticket.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white/85">{ticket.subject}</p>
                        <p className="text-xs text-white/30 truncate max-w-[200px]">{ticket.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`${statusColors[ticket.status]} text-xs capitalize`}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`${priorityColors[ticket.priority]} text-xs capitalize`}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/65">{ticket.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/65">{ticket.assignee}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/45">{ticket.updated}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-white/30" />
                          <span className="text-sm text-white/45">{ticket.messages}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <Card key={article.id} className="bg-surface border-hairline-soft rounded-xl hover:border-white/10 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="border-hairline-soft text-white/45 text-xs">
                      {article.category}
                    </Badge>
                    <BookOpen className="w-4 h-4 text-white/20" />
                  </div>
                  <h3 className="text-sm font-medium text-white/85 mb-2">{article.title}</h3>
                  <div className="flex items-center justify-between text-xs text-white/30">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {article.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {article.helpful}% helpful
                      </span>
                    </div>
                    <span>{article.lastUpdated}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Video Tutorials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Getting Started with NexusCRM", duration: "12:34", views: 2341 },
                { title: "Advanced Pipeline Management", duration: "18:22", views: 1876 },
                { title: "Setting up Enterprise SSO", duration: "15:45", views: 1543 },
                { title: "API Integration Workshop", duration: "24:10", views: 1234 },
              ].map((video, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-surface-elevated border border-hairline-soft hover:border-white/10 transition-colors cursor-pointer">
                  <div className="w-12 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85 truncate">{video.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-white/30">{video.duration}</span>
                      <span className="text-xs text-white/20">·</span>
                      <span className="text-xs text-white/30">{video.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-surface border-hairline-soft rounded-xl">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-violet/10 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-violet" />
                </div>
                <h3 className="text-sm font-medium text-white/85 mb-1">Live Chat</h3>
                <p className="text-xs text-white/45 mb-4">Average response: 2 minutes</p>
                <Button size="sm" className="bg-violet hover:bg-violet/90 text-white w-full">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-surface border-hairline-soft rounded-xl">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-electric-blue" />
                </div>
                <h3 className="text-sm font-medium text-white/85 mb-1">Email Support</h3>
                <p className="text-xs text-white/45 mb-4">enterprise@nexuscrm.io</p>
                <Button variant="outline" size="sm" className="border-hairline-soft text-white/65 hover:text-white hover:bg-white/5 w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-surface border-hairline-soft rounded-xl">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-coral" />
                </div>
                <h3 className="text-sm font-medium text-white/85 mb-1">Phone Support</h3>
                <p className="text-xs text-white/45 mb-4">+1 (555) 123-4567</p>
                <Button variant="outline" size="sm" className="border-hairline-soft text-white/65 hover:text-white hover:bg-white/5 w-full">
                  Call Now
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Support Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-hairline-soft">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-white/45" />
                  <div>
                    <p className="text-sm font-medium text-white/85">Global Coverage</p>
                    <p className="text-xs text-white/30">24/7/365 for Enterprise customers</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-success/20 text-success text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-surface-elevated border border-hairline-soft">
                  <p className="text-xs text-white/30 mb-1">Americas</p>
                  <p className="text-sm text-white/85">24/7 Support</p>
                  <p className="text-xs text-white/45 mt-0.5">English, Spanish, Portuguese</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-elevated border border-hairline-soft">
                  <p className="text-xs text-white/30 mb-1">EMEA</p>
                  <p className="text-sm text-white/85">24/7 Support</p>
                  <p className="text-xs text-white/45 mt-0.5">English, German, French</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-elevated border border-hairline-soft">
                  <p className="text-xs text-white/30 mb-1">APAC</p>
                  <p className="text-sm text-white/85">24/7 Support</p>
                  <p className="text-xs text-white/45 mt-0.5">English, Japanese, Mandarin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
