import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  DollarSign,
  Calendar,
  User,
  Building2,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  id: number;
  title: string;
  company: string;
  value: number;
  probability: number;
  contact: string;
  closeDate: string;
  stage: string;
  priority: string;
}

const stages = [
  { id: "lead", name: "Lead", color: "#5683da" },
  { id: "qualified", name: "Qualified", color: "#6452db" },
  { id: "proposal", name: "Proposal", color: "#ff8964" },
  { id: "negotiation", name: "Negotiation", color: "#f0ad4e" },
  { id: "closed-won", name: "Closed Won", color: "#8dc572" },
  { id: "closed-lost", name: "Closed Lost", color: "#be6464" },
];

const initialDeals: Deal[] = [
  {
    id: 1,
    title: "Enterprise License Renewal",
    company: "Acme Corporation",
    value: 125000,
    probability: 75,
    contact: "Sarah Chen",
    closeDate: "2024-03-15",
    stage: "negotiation",
    priority: "High",
  },
  {
    id: 2,
    title: "New SaaS Implementation",
    company: "TechStart Inc",
    value: 89000,
    probability: 60,
    contact: "James Wilson",
    closeDate: "2024-04-01",
    stage: "proposal",
    priority: "High",
  },
  {
    id: 3,
    title: "Data Migration Project",
    company: "Global Systems",
    value: 67500,
    probability: 45,
    contact: "Maria Garcia",
    closeDate: "2024-03-30",
    stage: "qualified",
    priority: "Medium",
  },
  {
    id: 4,
    title: "Consulting Engagement",
    company: "Apex Solutions",
    value: 45000,
    probability: 55,
    contact: "David Kim",
    closeDate: "2024-04-15",
    stage: "proposal",
    priority: "Medium",
  },
  {
    id: 5,
    title: "Platform Integration",
    company: "DataFlow Ltd",
    value: 38000,
    probability: 80,
    contact: "Emily Brown",
    closeDate: "2024-03-10",
    stage: "negotiation",
    priority: "High",
  },
  {
    id: 6,
    title: "Annual Support Contract",
    company: "MegaCorp Industries",
    value: 220000,
    probability: 90,
    contact: "Robert Taylor",
    closeDate: "2024-02-28",
    stage: "closed-won",
    priority: "High",
  },
  {
    id: 7,
    title: "Pilot Program",
    company: "StartupXYZ",
    value: 15000,
    probability: 30,
    contact: "Lisa Park",
    closeDate: "2024-05-01",
    stage: "lead",
    priority: "Low",
  },
];

const priorityColors: Record<string, string> = {
  High: "bg-[#ff8964]/20 text-[#ff8964]",
  Medium: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  Low: "bg-white/10 text-white/50",
};

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [search, setSearch] = useState("");
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

  const filteredDeals = deals.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.company.toLowerCase().includes(search.toLowerCase())
  );

  const getStageDeals = (stageId: string) =>
    filteredDeals.filter((d) => d.stage === stageId);

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== stageId) {
      setDeals((prev) =>
        prev.map((d) => (d.id === draggedDeal.id ? { ...d, stage: stageId } : d))
      );
      setDraggedDeal(null);
    }
  };

  const formatValue = (v: number) =>
    `$${v.toLocaleString()}`;

  const stageTotal = (stageId: string) =>
    getStageDeals(stageId).reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Deals Pipeline
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Track and manage your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Deal Title</Label>
                  <Input className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Value</Label>
                    <Input
                      type="number"
                      className="bg-[#0b0d10] border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Probability (%)</Label>
                    <Input
                      type="number"
                      className="bg-[#0b0d10] border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Stage</Label>
                    <Select>
                      <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                        {stages.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
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
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                  Create Deal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const stageDeals = getStageDeals(stage.id);
          const total = stageTotal(stage.id);
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="text-sm font-medium text-white">
                    {stage.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white/50 text-xs"
                  >
                    {stageDeals.length}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-white/50">
                  {formatValue(total)}
                </span>
              </div>

              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    className="bg-[#18191b] border-white/10 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">
                          {deal.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/5 -mr-2 -mt-2"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-3 h-3 text-white/30" />
                        <span className="text-xs text-white/50">
                          {deal.company}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-semibold text-white">
                          {formatValue(deal.value)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${priorityColors[deal.priority]}`}
                        >
                          {deal.priority}
                        </Badge>
                      </div>
                      <Progress
                        value={deal.probability}
                        className="h-1 bg-white/10 mb-3"
                      />
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{deal.contact}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{deal.closeDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
