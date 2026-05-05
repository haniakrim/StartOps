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
  low: "bg-[#8dc572]/20 text-[#8dc572]",
  medium: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  high: "bg-[#ff8964]/20 text-[#ff8964]",
  urgent: "bg-[#be6464]/20 text-[#be6464]",
};

const statusColors: Record<string, string> = {
  open: "bg-[#5683da]/20 text-[#5683da]",
  in_progress: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  resolved: "bg-[#8dc572]/20 text-[#8dc572]",
  closed: "bg-white/10 text-white/50",
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
        user_id: (await supabase.auth.getUser()).data.user?.id,
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

  async function updateTicketStatus(id: string, status: string) {
    try {
      const updates: any = { status };
      if (status === "resolved") updates.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("support_tickets").update(updates).eq("id", id);
      if (error) throw error;
      toast.success(`Ticket marked as ${status}`);
      fetchTickets();
    } catch (error: any) {
      toast.error("Failed to update ticket: " + error.message);
    }
  }

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Support</h1>
          <p className="text-white/50 mt-1">Get help and manage support tickets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
            <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
            <form onSubmit={createTicket} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Subject</Label>
                <Input required value={newTicket.subject} onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="How do I...?" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Input value={newTicket.description} onChange={(e) => setNewTicket((p) => ({ ...p, description: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Describe your issue in detail..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Category</Label>
                  <Select value={newTicket.category} onValueChange={(v) => setNewTicket((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(v) => setNewTicket((p) => ({ ...p, priority: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Submit Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#18191b] border-white/10 hover:border-[#6452db]/30 transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Book className="w-6 h-6 text-[#6452db] mb-3" />
            <p className="text-sm font-medium text-white">Documentation</p>
            <p className="text-xs text-white/40 mt-1">Read the full docs</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10 hover:border-[#6452db]/30 transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <MessageSquare className="w-6 h-6 text-[#6452db] mb-3" />
            <p className="text-sm font-medium text-white">Live Chat</p>
            <p className="text-xs text-white/40 mt-1">Talk to our team</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10 hover:border-[#6452db]/30 transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Mail className="w-6 h-6 text-[#6452db] mb-3" />
            <p className="text-sm font-medium text-white">Email Support</p>
            <p className="text-xs text-white/40 mt-1">support@startops.com</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="tickets" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <LifeBuoy className="w-4 h-4 mr-2" />My Tickets ({openTickets.length})
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <Book className="w-4 h-4 mr-2" />FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-0">
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <LifeBuoy className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-sm text-white/40">No support tickets yet.</p>
                  <p className="text-xs text-white/30 mt-1">Create your first ticket above.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{ticket.subject}</span>
                            <Badge variant="secondary" className={`text-xs ${priorityColors[ticket.priority]}`}>{ticket.priority}</Badge>
                            <Badge variant="secondary" className={`text-xs ${statusColors[ticket.status]}`}>{ticket.status}</Badge>
                          </div>
                          <p className="text-xs text-white/40 mb-2">{ticket.description}</p>
                          <div className="flex items-center gap-3 text-xs text-white/30">
                            <span className="capitalize">{ticket.category}</span>
                            <span>·</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                            {ticket.sla_breach_at && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1 text-[#f0ad4e]">
                                  <Clock className="w-3 h-3" />
                                  SLA: {new Date(ticket.sla_breach_at).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {ticket.status === "open" && (
                            <Button variant="ghost" size="sm" className="text-[#f0ad4e] hover:text-[#f0ad4e] hover:bg-[#f0ad4e]/10" onClick={() => updateTicketStatus(ticket.id, "in_progress")}>
                              <AlertCircle className="w-3.5 h-3.5 mr-1" />Start
                            </Button>
                          )}
                          {ticket.status !== "resolved" && ticket.status !== "closed" && (
                            <Button variant="ghost" size="sm" className="text-[#8dc572] hover:text-[#8dc572] hover:bg-[#8dc572]/10" onClick={() => updateTicketStatus(ticket.id, "resolved")}>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-[#6452db]" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0b0d10] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
                />
              </div>
              <div className="space-y-2">
                {filteredFaqs.map((faq, i) => (
                  <div key={i} className="border border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-white">{faq.q}</span>
                      {openIndex === i ? (
                        <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                      )}
                    </button>
                    {openIndex === i && (
                      <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed">{faq.a}</div>
                    )}
                  </div>
                ))}
                {filteredFaqs.length === 0 && (
                  <p className="text-sm text-white/40 text-center py-8">No results found for "{search}"</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}