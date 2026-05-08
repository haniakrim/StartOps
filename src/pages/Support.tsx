import { useState, useEffect } from "react";
import { LifeBuoy, Search, MessageSquare, Book, Mail, ChevronDown, ChevronUp, Plus, Loader2, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  sla_breach_at: string | null;
}

const faqs = [
  {
    q: "How do I invite team members?",
    a: "Go to Organization > Team Members and click 'Invite Member'. Enter their email and select a role. They'll receive an invitation link via email.",
  },
  {
    q: "Can I import contacts from a CSV file?",
    a: "Yes. Navigate to Contacts and click the Import button. Upload a CSV with columns for name, email, company, and phone. We'll map the fields automatically.",
  },
  {
    q: "How does the deal pipeline work?",
    a: "Deals move through customizable stages (e.g., Lead, Qualified, Proposal, Closed Won). Drag and drop deals between stages or click to edit details and set probabilities.",
  },
  {
    q: "Is there an API available?",
    a: "Yes. Go to API & Webhooks in the sidebar to generate an API key and configure webhooks for real-time event notifications.",
  },
  {
    q: "How do I enable SSO?",
    a: "Navigate to Security > SSO Providers. Click 'Connect' next to your identity provider (Google Workspace, Azure AD, or Okta) and follow the setup instructions.",
  },
];

const priorityColors: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-600",
  medium: "bg-yellow-500/15 text-yellow-600",
  high: "bg-orange-500/15 text-orange-600",
  urgent: "bg-red-500/15 text-red-600",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-600",
  in_progress: "bg-yellow-500/15 text-yellow-600",
  resolved: "bg-emerald-500/15 text-emerald-600",
  closed: "bg-muted text-muted-foreground",
};

export default function Support() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  useEffect(() => { fetchTickets(); }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast.error("Failed to load tickets: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("support_tickets").insert({
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        status: "open",
      });
      if (error) throw error;
      toast.success("Support ticket created");
      setDialogOpen(false);
      setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
      fetchTickets();
    } catch (error: any) {
      toast.error("Failed to create ticket: " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Support Center</h1>
          <p className="text-muted-foreground mt-1">Get help and manage support tickets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
            <form onSubmit={createTicket} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input required value={newTicket.subject} onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))} placeholder="How do I...?" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newTicket.description} onChange={(e) => setNewTicket((p) => ({ ...p, description: e.target.value }))} placeholder="Describe your issue in detail..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newTicket.category} onValueChange={(v) => setNewTicket((p) => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(v) => setNewTicket((p) => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <MessageSquare className="w-8 h-8 text-primary" />
              <span className="text-2xl font-semibold text-foreground">{tickets.filter(t => t.status === "open").length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Open Tickets</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-semibold text-foreground">{tickets.filter(t => t.status === "in_progress").length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">In Progress</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-2xl font-semibold text-foreground">{tickets.filter(t => t.status === "resolved").length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Resolved</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList>
          <TabsTrigger value="tickets"><MessageSquare className="w-4 h-4 mr-2" />My Tickets</TabsTrigger>
          <TabsTrigger value="faq"><Book className="w-4 h-4 mr-2" />FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Ticket</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Priority</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">No tickets yet.</td></tr>
                  )}
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">{ticket.description?.slice(0, 60)}...]</p>
                      </td>
                      <td className="py-3 px-4"><Badge variant="secondary" className="text-xs capitalize">{ticket.category}</Badge></td>
                      <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${priorityColors[ticket.priority]}`}>{ticket.priority}</Badge></td>
                      <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${statusColors[ticket.status]}`}>{ticket.status}</Badge></td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardContent className="p-5">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search FAQ articles..."
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{faq.q}</span>
                      {openIndex === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {openIndex === i && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </div>
                    )}
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
