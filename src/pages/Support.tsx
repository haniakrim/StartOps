import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Ticket, Plus, Clock, AlertTriangle, CheckCircle2, MessageSquare, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  sla_target_hours: number;
}

export default function Support() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("support_tickets").insert([
        {
          subject: newTicket.subject,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
        },
      ]);

      if (error) throw error;

      toast({ title: "Ticket created successfully" });
      setShowDialog(false);
      setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
      fetchTickets();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const priorityColors: Record<string, string> = {
    low: "#8dc572",
    medium: "#5683da",
    high: "#ff8964",
    urgent: "#eb5757",
  };

  const statusColors: Record<string, string> = {
    open: "#5683da",
    in_progress: "#ff8964",
    resolved: "#8dc572",
    closed: "#61656b",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Support Portal</h1>
          <p className="text-white/60 mt-1">Enterprise SLA-backed support center</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#6452db] hover:bg-[#5645c7] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-[#303236] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="bg-[#0b0d10] border-[#303236] text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="bg-[#0b0d10] border-[#303236] text-white min-h-[100px]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18191b] border-[#303236]">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18191b] border-[#303236]">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white">
                Submit Ticket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SLA Banner */}
      <Card className="bg-[#18191b] border-[#303236]">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#6452db]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">Enterprise SLA Guarantee</h3>
              <p className="text-sm text-white/60 mt-0.5">
                Response time: 1 hour (urgent) • 4 hours (high) • 24 hours (medium) • 48 hours (low)
              </p>
            </div>
            <Badge variant="outline" className="border-[#8dc572]/40 text-[#8dc572]">
              99.9% Uptime
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Open Tickets</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {tickets.filter((t) => t.status === "open").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#5683da]/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#5683da]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">In Progress</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {tickets.filter((t) => t.status === "in_progress").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ff8964]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#ff8964]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Resolved</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {tickets.filter((t) => t.status === "resolved").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#8dc572]/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#8dc572]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Urgent</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {tickets.filter((t) => t.priority === "urgent").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#eb5757]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#eb5757]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card className="bg-[#18191b] border-[#303236]">
        <CardHeader>
          <CardTitle className="text-white text-lg">All Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#303236] hover:bg-transparent">
                <TableHead className="text-white/60">Ticket</TableHead>
                <TableHead className="text-white/60">Category</TableHead>
                <TableHead className="text-white/60">Priority</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">SLA</TableHead>
                <TableHead className="text-white/60">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/45">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/45">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="w-8 h-8 text-white/30" />
                      <p>No tickets yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-[#303236] hover:bg-[#1f2126]">
                    <TableCell>
                      <div>
                        <p className="text-white text-sm font-medium">{ticket.subject}</p>
                        <p className="text-xs text-white/45 truncate max-w-[200px]">{ticket.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-white/65 capitalize">{ticket.category}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                        style={{
                          borderColor: `${priorityColors[ticket.priority]}40`,
                          color: priorityColors[ticket.priority],
                        }}
                      >
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                        style={{
                          borderColor: `${statusColors[ticket.status]}40`,
                          color: statusColors[ticket.status],
                        }}
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-white/65">
                        <Clock className="w-3 h-3" />
                        {ticket.sla_target_hours}h
                      </div>
                    </TableCell>
                    <TableCell className="text-white/65 text-sm">
                      {new Date(ticket.created_at).toLocaleDateString()}
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
