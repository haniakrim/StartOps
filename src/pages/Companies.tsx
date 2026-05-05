import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Building2,
  Globe,
  Users,
  MapPin,
  ArrowUpDown,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const companies = [
  {
    id: 1,
    name: "Acme Corporation",
    industry: "Technology",
    size: "500-1000",
    location: "San Francisco, CA",
    website: "acme.com",
    revenue: "$50M - $100M",
    health: 85,
    trend: "up",
    deals: 3,
    contacts: 12,
    status: "Customer",
  },
  {
    id: 2,
    name: "TechStart Inc",
    industry: "SaaS",
    size: "50-200",
    location: "New York, NY",
    website: "techstart.io",
    revenue: "$5M - $10M",
    health: 72,
    trend: "up",
    deals: 2,
    contacts: 8,
    status: "Prospect",
  },
  {
    id: 3,
    name: "Global Systems",
    industry: "Enterprise Software",
    size: "1000+",
    location: "Austin, TX",
    website: "globalsys.com",
    revenue: "$500M+",
    health: 91,
    trend: "up",
    deals: 5,
    contacts: 24,
    status: "Customer",
  },
  {
    id: 4,
    name: "Apex Solutions",
    industry: "Consulting",
    size: "200-500",
    location: "Seattle, WA",
    website: "apex.com",
    revenue: "$25M - $50M",
    health: 58,
    trend: "down",
    deals: 1,
    contacts: 6,
    status: "At Risk",
  },
  {
    id: 5,
    name: "DataFlow Ltd",
    industry: "Data Analytics",
    size: "50-200",
    location: "Boston, MA",
    website: "dataflow.io",
    revenue: "$10M - $25M",
    health: 78,
    trend: "up",
    deals: 2,
    contacts: 9,
    status: "Prospect",
  },
];

const statusColors: Record<string, string> = {
  Customer: "bg-[#8dc572]/20 text-[#8dc572]",
  Prospect: "bg-[#5683da]/20 text-[#5683da]",
  "At Risk": "bg-[#be6464]/20 text-[#be6464]",
};

export default function Companies() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Companies
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Manage your accounts and organizations
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
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Company Name</Label>
                  <Input className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Industry</Label>
                    <Input className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Company Size</Label>
                    <Input className="bg-[#0b0d10] border-white/10 text-white" />
                  </div>
                </div>
                <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                  Create Company
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search companies..."
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

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <Card
            key={company.id}
            className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#6452db]" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${statusColors[company.status]}`}
                  >
                    {company.status}
                  </Badge>
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
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5">
                        Edit Company
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="text-base font-semibold text-white mb-1">
                {company.name}
              </h3>
              <p className="text-sm text-white/50 mb-4">{company.industry}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Account Health</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {company.health}%
                    </span>
                    {company.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-[#8dc572]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[#be6464]" />
                    )}
                  </div>
                </div>
                <Progress
                  value={company.health}
                  className="h-1.5 bg-white/10"
                />

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Users className="w-4 h-4" />
                    <span>{company.contacts} contacts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Globe className="w-4 h-4" />
                    <span>{company.website}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <MapPin className="w-4 h-4" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Building2 className="w-4 h-4" />
                    <span>{company.size} employees</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
