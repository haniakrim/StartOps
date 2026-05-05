import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  MapPin,
  ArrowUpDown,
  Download,
  Upload,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: "active" | "inactive" | "lead" | "customer";
  location: string;
  lastContact: string;
  value: number;
  starred: boolean;
}

const contacts: Contact[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@acmecorp.com", phone: "+1 (555) 123-4567", company: "Acme Corp", title: "CTO", status: "customer", location: "San Francisco, CA", lastContact: "2 hours ago", value: 125000, starred: true },
  { id: "2", name: "Mike Ross", email: "mike@techflow.io", phone: "+1 (555) 234-5678", company: "TechFlow Inc", title: "VP Engineering", status: "lead", location: "New York, NY", lastContact: "1 day ago", value: 85000, starred: false },
  { id: "3", name: "Emily Watson", email: "emily@cloudnine.net", phone: "+1 (555) 345-6789", company: "CloudNine", title: "CEO", status: "customer", location: "Austin, TX", lastContact: "3 days ago", value: 45000, starred: true },
  { id: "4", name: "David Kim", email: "david@datasync.ai", phone: "+1 (555) 456-7890", company: "DataSync", title: "Head of Sales", status: "active", location: "Seattle, WA", lastContact: "5 hours ago", value: 200000, starred: false },
  { id: "5", name: "Lisa Park", email: "lisa@vertex.io", phone: "+1 (555) 567-8901", company: "Vertex Systems", title: "COO", status: "lead", location: "Boston, MA", lastContact: "1 week ago", value: 150000, starred: false },
  { id: "6", name: "James Wilson", email: "james@nexus.dev", phone: "+1 (555) 678-9012", company: "Nexus Dev", title: "Founder", status: "customer", location: "Denver, CO", lastContact: "2 days ago", value: 75000, starred: true },
  { id: "7", name: "Anna Martinez", email: "anna@scaleup.com", phone: "+1 (555) 789-0123", company: "ScaleUp", title: "VP Product", status: "active", location: "Miami, FL", lastContact: "4 hours ago", value: 95000, starred: false },
  { id: "8", name: "Robert Taylor", email: "robert@innovate.co", phone: "+1 (555) 890-1234", company: "Innovate Co", title: "Director", status: "inactive", location: "Chicago, IL", lastContact: "2 weeks ago", value: 30000, starred: false },
];

const statusColors: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  inactive: "bg-white/5 text-white/45 border-white/10",
  lead: "bg-electric-blue/15 text-electric-blue border-electric-blue/20",
  customer: "bg-coral/15 text-coral border-coral/20",
};

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || contact.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-app font-bold text-white">Contacts</h1>
          <p className="text-sm text-white/45 mt-0.5">
            Manage your contacts and relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-hairline-soft text-white/65 hover:text-white hover:bg-white/5"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-hairline-soft text-white/65 hover:text-white hover:bg-white/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-violet hover:bg-violet/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface-elevated border-hairline-soft text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-app font-bold">Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">First Name</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Last Name</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/65">Email</Label>
                  <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="john@company.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/65">Company</Label>
                  <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="Company Name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Status</Label>
                    <Select>
                      <SelectTrigger className="bg-surface border-hairline-soft text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface-elevated border-hairline-soft">
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Title</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="Job Title" />
                  </div>
                </div>
                <Button className="w-full bg-violet hover:bg-violet/90 text-white" onClick={() => setShowAddDialog(false)}>
                  Create Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-surface border-hairline-soft rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-md bg-canvas border border-hairline-soft text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
            </div>
            <div className="flex items-center gap-2">
              {["all", "lead", "active", "customer", "inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                    selectedStatus === status
                      ? "bg-violet text-white"
                      : "bg-white/5 text-white/45 hover:text-white/65 hover:bg-white/10"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5 ml-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card className="bg-surface border-hairline-soft rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="data-table-header text-left">
                <th className="px-4 py-2.5 font-app font-medium">
                  <button className="flex items-center gap-1">
                    Contact <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-2.5 font-app font-medium">Status</th>
                <th className="px-4 py-2.5 font-app font-medium">Company</th>
                <th className="px-4 py-2.5 font-app font-medium">Location</th>
                <th className="px-4 py-2.5 font-app font-medium">Value</th>
                <th className="px-4 py-2.5 font-app font-medium">Last Contact</th>
                <th className="px-4 py-2.5 font-app font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="data-table-row hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button className={`${contact.starred ? "text-coral" : "text-white/20"} hover:text-coral transition-colors`}>
                        <Star className="w-4 h-4" fill={contact.starred ? "currentColor" : "none"} />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-white/85">{contact.name}</p>
                        <p className="text-xs text-white/30">{contact.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`${statusColors[contact.status]} text-xs capitalize`}
                    >
                      {contact.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-sm text-white/65">{contact.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-sm text-white/65">{contact.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white/85">
                      ${contact.value.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white/45">{contact.lastContact}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md text-white/30 hover:text-white/65 hover:bg-white/5 transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md text-white/30 hover:text-white/65 hover:bg-white/5 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md text-white/30 hover:text-white/65 hover:bg-white/5 transition-colors">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-surface-elevated border-hairline-soft text-white"
                        >
                          <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                            Edit Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-app-error hover:bg-white/5 focus:bg-white/5 focus:text-app-error cursor-pointer">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-hairline-soft">
          <p className="text-xs text-white/30">
            Showing {filteredContacts.length} of {contacts.length} contacts
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5"
              disabled
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5"
              disabled
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
