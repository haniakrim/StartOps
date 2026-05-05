import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  Calendar,
  DollarSign,
  User,
  Building2,
  Tag,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface Deal {
  id: string;
  name: string;
  company: string;
  contact: string;
  value: number;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  expectedClose: string;
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
}

const stages = [
  { id: "lead", label: "Lead", color: "bg-white/5" },
  { id: "qualified", label: "Qualified", color: "bg-electric-blue/10" },
  { id: "proposal", label: "Proposal", color: "bg-violet/10" },
  { id: "negotiation", label: "Negotiation", color: "bg-warning/10" },
  { id: "closed_won", label: "Closed Won", color: "bg-success/10" },
  { id: "closed_lost", label: "Closed Lost", color: "bg-app-error/10" },
];

const deals: Deal[] = [
  { id: "1", name: "Enterprise License - Q4", company: "Acme Corp", contact: "Sarah Chen", value: 125000, stage: "negotiation", probability: 75, expectedClose: "Dec 15, 2024", priority: "high", tags: ["Enterprise", "Q4"] },
  { id: "2", name: "Platform Migration", company: "TechFlow Inc", contact: "Mike Ross", value: 85000, stage: "proposal", probability: 50, expectedClose: "Jan 20, 2025", priority: "medium", tags: ["Migration"] },
  { id: "3", name: "Annual Renewal", company: "CloudNine", contact: "Emily Watson", value: 45000, stage: "closed_won", probability: 100, expectedClose: "Nov 30, 2024", priority: "low", tags: ["Renewal"] },
  { id: "4", name: "DataSync Integration", company: "DataSync", contact: "David Kim", value: 200000, stage: "qualified", probability: 35, expectedClose: "Feb 15, 2025", priority: "urgent", tags: ["Integration", "Enterprise"] },
  { id: "5", name: "Vertex Systems POC", company: "Vertex Systems", contact: "Lisa Park", value: 150000, stage: "lead", probability: 15, expectedClose: "Mar 1, 2025", priority: "medium", tags: ["POC"] },
  { id: "6", name: "Nexus Dev Expansion", company: "Nexus Dev", contact: "James Wilson", value: 75000, stage: "closed_won", probability: 100, expectedClose: "Oct 15, 2024", priority: "low", tags: ["Expansion"] },
  { id: "7", name: "ScaleUp Team License", company: "ScaleUp", contact: "Anna Martinez", value: 95000, stage: "proposal", probability: 60, expectedClose: "Dec 30, 2024", priority: "high", tags: ["Team"] },
  { id: "8", name: "Innovate Co - Lost", company: "Innovate Co", contact: "Robert Taylor", value: 30000, stage: "closed_lost", probability: 0, expectedClose: "Sep 1, 2024", priority: "low", tags: ["Lost"] },
];

const priorityColors = {
  low: "bg-white/5 text-white/45 border-white/10",
  medium: "bg-electric-blue/10 text-electric-blue border-electric-blue/20",
  high: "bg-warning/10 text-warning border-warning/20",
  urgent: "bg-app-error/10 text-app-error border-app-error/20",
};

const stageLabels: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export default function Deals() {
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = deals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
  const wonValue = deals.filter(d => d.stage === "closed_won").reduce((sum, d) => sum + d.value, 0);
  const activeDeals = deals.filter(d => d.stage !== "closed_won" && d.stage !== "closed_lost").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-app font-bold text-white">Deals</h1>
          <p className="text-sm text-white/45 mt-0.5">
            Track and manage your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface rounded-md border border-hairline-soft p-0.5">
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "pipeline"
                  ? "bg-violet text-white"
                  : "text-white/45 hover:text-white/65"
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-violet text-white"
                  : "text-white/45 hover:text-white/65"
              }`}
            >
              List
            </button>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-violet hover:bg-violet/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface-elevated border-hairline-soft text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-app font-bold">Add New Deal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/65">Deal Name</Label>
                  <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="Enter deal name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Company</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="Company name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Contact</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="Primary contact" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Value</Label>
                    <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Stage</Label>
                    <Select>
                      <SelectTrigger className="bg-surface border-hairline-soft text-white">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface-elevated border-hairline-soft">
                        {stages.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full bg-violet hover:bg-violet/90 text-white" onClick={() => setShowAddDialog(false)}>
                  Create Deal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-white/45 mb-1">Total Pipeline</p>
            <p className="text-xl font-bold text-white">${(totalValue / 1000).toFixed(0)}K</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs text-success">+18.2%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-white/45 mb-1">Weighted Value</p>
            <p className="text-xl font-bold text-white">${(weightedValue / 1000).toFixed(0)}K</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs text-success">+12.5%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-white/45 mb-1">Closed Won</p>
            <p className="text-xl font-bold text-white">${(wonValue / 1000).toFixed(0)}K</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-app-error" />
              <span className="text-xs text-app-error">-2.1%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-white/45 mb-1">Active Deals</p>
            <p className="text-xl font-bold text-white">{activeDeals}</p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-warning" />
              <span className="text-xs text-warning">{deals.filter(d => d.stage === "negotiation").length} in negotiation</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === "pipeline" ? (
        /* Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            return (
              <div key={stage.id} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-app font-medium text-white/65 uppercase tracking-wider">
                      {stage.label}
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-hairline-soft text-white/45 text-[10px] px-1.5 py-0"
                    >
                      {stageDeals.length}
                    </Badge>
                  </div>
                  <span className="text-xs text-white/30">
                    ${(stageValue / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="space-y-2">
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="bg-surface-elevated border-hairline-soft rounded-lg cursor-pointer hover:border-white/10 transition-colors"
                    >
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-white/85 line-clamp-1">
                              {deal.name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3 text-white/30" />
                              <span className="text-xs text-white/45">{deal.company}</span>
                            </div>
                          </div>
                          <button className="p-1 rounded text-white/20 hover:text-white/45 hover:bg-white/5">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-white/30" />
                          <span className="text-xs text-white/45">{deal.contact}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">
                            ${(deal.value / 1000).toFixed(0)}K
                          </span>
                          <Badge
                            variant="outline"
                            className={`${priorityColors[deal.priority]} text-[10px] px-1.5 py-0`}
                          >
                            {deal.priority}
                          </Badge>
                        </div>
                        {deal.probability > 0 && deal.probability < 100 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white/30">Probability</span>
                              <span className="text-[10px] text-white/45">{deal.probability}%</span>
                            </div>
                            <Progress value={deal.probability} className="h-1 bg-white/5" />
                          </div>
                        )}
                        <div className="flex items-center gap-1 pt-1 border-t border-hairline-soft">
                          <Calendar className="w-3 h-3 text-white/30" />
                          <span className="text-[10px] text-white/30">{deal.expectedClose}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-xs text-white/20">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="bg-surface border-hairline-soft rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="data-table-header text-left">
                  <th className="px-4 py-2.5 font-app font-medium">
                    <button className="flex items-center gap-1">
                      Deal <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2.5 font-app font-medium">Company</th>
                  <th className="px-4 py-2.5 font-app font-medium">Value</th>
                  <th className="px-4 py-2.5 font-app font-medium">Stage</th>
                  <th className="px-4 py-2.5 font-app font-medium">Probability</th>
                  <th className="px-4 py-2.5 font-app font-medium">Close Date</th>
                  <th className="px-4 py-2.5 font-app font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-app font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="data-table-row hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white/85">{deal.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-white/30" />
                          <span className="text-xs text-white/30">{deal.contact}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-sm text-white/65">{deal.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-white/85">
                        ${deal.value.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="border-hairline-soft text-white/65 text-xs capitalize"
                      >
                        {stageLabels[deal.stage]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={deal.probability} className="w-16 h-1.5 bg-white/5" />
                        <span className="text-xs text-white/45">{deal.probability}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-sm text-white/45">{deal.expectedClose}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`${priorityColors[deal.priority]} text-xs capitalize`}
                      >
                        {deal.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 rounded-md text-white/30 hover:text-white/65 hover:bg-white/5 transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
