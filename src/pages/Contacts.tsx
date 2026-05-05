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
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const contacts = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@acme.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Corporation",
    title: "VP of Engineering",
    location: "San Francisco, CA",
    status: "Active",
    lastContact: "2 hours ago",
    starred: true,
    tags: ["Enterprise", "Decision Maker"],
  },
  {
    id: 2,
    name: "James Wilson",
    email: "j.wilson@techstart.io",
    phone: "+1 (555) 234-5678",
    company: "TechStart Inc",
    title: "CEO",
    location: "New York, NY",
    status: "Active",
    lastContact: "1 day ago",
    starred: false,
    tags: ["Startup", "Key Account"],
  },
  {
    id: 3,
    name: "Maria Garcia",
    email: "m.garcia@globalsys.com",
    phone: "+1 (555) 345-6789",
    company: "Global Systems",
    title: "CTO",
    location: "Austin, TX",
    status: "Prospect",
    lastContact: "3 days ago",
    starred: true,
    tags: ["Enterprise"],
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@apex.com",
    phone: "+1 (555) 456-7890",
    company: "Apex Solutions",
    title: "Director of Sales",
    location: "Seattle, WA",
    status: "Inactive",
    lastContact: "2 weeks ago",
    starred: false,
    tags: ["Mid-Market"],
  },
  {
    id: 5,
    name: "Emily Brown",
    email: "emily@dataflow.io",
    phone: "+1 (555) 567-8901",
    company: "DataFlow Ltd",
    title: "Product Manager",
    location: "Boston, MA",
    status: "Active",
    lastContact: "5 hours ago",
    starred: false,
    tags: ["Startup", "Champion"],
  },
  {
    id: 6,
    name: "Robert Taylor",
    email: "r.taylor@megacorp.com",
    phone: "+1 (555) 678-9012",
    company: "MegaCorp Industries",
    title: "CFO",
    location: "Chicago, IL",
    status: "Active",
    lastContact: "1 week ago",
    starred: true,
    tags: ["Enterprise", "Decision Maker"],
  },
];

const statusColors: Record<string, string> = {
  Active: "bg-[#8dc572]/20 text-[#8dc572]",
  Prospect: "bg-[#5683da]/20 text-[#5683da]",
  Inactive: "bg-white/10 text-white/50",
};

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [starredContacts, setStarredContacts] = useState<number[]>(
    contacts.filter((c) => c.starred).map((c) => c.id)
  );

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStar = (id: number) => {
    setStarredContacts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Contacts
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Manage your contacts and relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">First Name</Label>
                    <Input className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Last Name</Label>
                    <Input className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Email</Label>
                  <Input className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Company</Label>
                  <Input className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                  Create Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/50 hover:text-white"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Sort
        </Button>
      </div>

      {/* Contacts Table */}
      <Card className="bg-[#18191b] border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-transparent"
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? filtered.map((c) => c.id) : []
                        )
                      }
                      checked={
                        selected.length > 0 &&
                        selected.length === filtered.length
                      }
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded border-white/20 bg-transparent"
                        checked={selected.includes(contact.id)}
                        onChange={(e) =>
                          setSelected((prev) =>
                            e.target.checked
                              ? [...prev, contact.id]
                              : prev.filter((id) => id !== contact.id)
                          )
                        }
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleStar(contact.id)}
                          className="text-white/20 hover:text-[#ff8964] transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              starredContacts.includes(contact.id)
                                ? "fill-[#ff8964] text-[#ff8964]"
                                : ""
                            }`}
                          />
                        </button>
                        <Avatar className="w-8 h-8 bg-[#6452db]">
                          <AvatarFallback className="bg-[#6452db] text-white text-xs">
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {contact.name}
                          </p>
                          <p className="text-xs text-white/40">{contact.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-white/30" />
                        <span className="text-sm text-white/70">
                          {contact.company}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${statusColors[contact.status]}`}
                      >
                        {contact.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-white/10 text-white/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/50">
                      {contact.lastContact}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1f2126] border-white/10 text-white">
                          <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5">
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5">
                            <MapPin className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
