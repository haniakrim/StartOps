import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Phone,
  Mail,
  Calendar,
  FileText,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  User,
  Flag,
  Tag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Activity {
  id: number;
  type: "task" | "call" | "email" | "meeting" | "note";
  title: string;
  description: string;
  contact: string;
  company: string;
  dueDate: string;
  dueTime: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  assignee: string;
  createdAt: string;
}

const activities: Activity[] = [
  {
    id: 1,
    type: "task",
    title: "Follow up on Acme Corp proposal",
    description: "Send revised pricing sheet and timeline",
    contact: "Sarah Chen",
    company: "Acme Corporation",
    dueDate: "Today",
    dueTime: "3:00 PM",
    status: "pending",
    priority: "high",
    assignee: "John Doe",
    createdAt: "2 hours ago",
  },
  {
    id: 2,
    type: "call",
    title: "Discovery call with TechStart",
    description: "Initial qualification call for enterprise plan",
    contact: "James Wilson",
    company: "TechStart Inc",
    dueDate: "Today",
    dueTime: "11:00 AM",
    status: "in_progress",
    priority: "high",
    assignee: "John Doe",
    createdAt: "1 hour ago",
  },
  {
    id: 3,
    type: "email",
    title: "Send onboarding materials",
    description: "Welcome email with getting started guide",
    contact: "Maria Garcia",
    company: "Global Systems",
    dueDate: "Tomorrow",
    dueTime: "9:00 AM",
    status: "pending",
    priority: "medium",
    assignee: "Mike Ross",
    createdAt: "3 hours ago",
  },
  {
    id: 4,
    type: "meeting",
    title: "Quarterly business review",
    description: "Review Q4 performance and plan for Q1",
    contact: "Robert Taylor",
    company: "MegaCorp Industries",
    dueDate: "Dec 15",
    dueTime: "2:00 PM",
    status: "pending",
    priority: "high",
    assignee: "Sarah Chen",
    createdAt: "1 day ago",
  },
  {
    id: 5,
    type: "task",
    title: "Update deal probability",
    description: "Review pipeline and update forecast",
    contact: "Emily Brown",
    company: "DataFlow Ltd",
    dueDate: "Dec 12",
    dueTime: "5:00 PM",
    status: "overdue",
    priority: "medium",
    assignee: "John Doe",
    createdAt: "2 days ago",
  },
  {
    id: 6,
    type: "call",
    title: "Check-in with Apex Solutions",
    description: "Monthly check-in call",
    contact: "David Kim",
    company: "Apex Solutions",
    dueDate: "Dec 14",
    dueTime: "10:00 AM",
    status: "completed",
    priority: "low",
    assignee: "Mike Ross",
    createdAt: "3 days ago",
  },
  {
    id: 7,
    type: "note",
    title: "Document competitor analysis",
    description: "Research and document competitor pricing",
    contact: "-",
    company: "-",
    dueDate: "Dec 16",
    dueTime: "4:00 PM",
    status: "pending",
    priority: "low",
    assignee: "Lisa Park",
    createdAt: "4 hours ago",
  },
  {
    id: 8,
    type: "email",
    title: "Send contract to Global Systems",
    description: "Final contract for $67K deal",
    contact: "Maria Garcia",
    company: "Global Systems",
    dueDate: "Today",
    dueTime: "5:00 PM",
    status: "pending",
    priority: "high",
    assignee: "John Doe",
    createdAt: "30 min ago",
  },
];

const typeIcons: Record<string, React.ElementType> = {
  task: CheckCircle2,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
};

const typeColors: Record<string, string> = {
  task: "#6452db",
  call: "#5683da",
  email: "#ff8964",
  meeting: "#8dc572",
  note: "#f0ad4e",
};

const statusColors: Record<string, string> = {
  pending: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  in_progress: "bg-[#5683da]/20 text-[#5683da]",
  completed: "bg-[#8dc572]/20 text-[#8dc572]",
  overdue: "bg-[#be6464]/20 text-[#be6464]",
};

const priorityColors: Record<string, string> = {
  low: "bg-white/10 text-white/50",
  medium: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  high: "bg-[#ff8964]/20 text-[#ff8964]",
};

export default function Activities() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = activities.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.contact.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || a.type === filterType;
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: activities.length,
    pending: activities.filter((a) => a.status === "pending").length,
    inProgress: activities.filter((a) => a.status === "in_progress").length,
    completed: activities.filter((a) => a.status === "completed").length,
    overdue: activities.filter((a) => a.status === "overdue").length,
  };

  const completionRate = Math.round(
    (stats.completed / (stats.total - stats.overdue)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Activities
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Track tasks, calls, emails, and meetings
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Title</Label>
                <Input
                  placeholder="What needs to be done?"
                  className="bg-[#0b0d10] border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Type</Label>
                  <Select>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Due Date</Label>
                  <Input
                    type="date"
                    className="bg-[#0b0d10] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Due Time</Label>
                  <Input
                    type="time"
                    className="bg-[#0b0d10] border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Contact</Label>
                <Input
                  placeholder="Search contacts..."
                  className="bg-[#0b0d10] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Description</Label>
                <Input
                  placeholder="Add details..."
                  className="bg-[#0b0d10] border-white/10 text-white"
                />
              </div>
              <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                Create Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Pending</span>
              <Clock className="w-4 h-4 text-[#f0ad4e]" />
            </div>
            <p className="text-2xl font-semibold text-white mt-1">
              {stats.pending}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">In Progress</span>
              <Circle className="w-4 h-4 text-[#5683da]" />
            </div>
            <p className="text-2xl font-semibold text-white mt-1">
              {stats.inProgress}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-[#8dc572]" />
            </div>
            <p className="text-2xl font-semibold text-white mt-1">
              {stats.completed}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Overdue</span>
              <AlertTriangle className="w-4 h-4 text-[#be6464]" />
            </div>
            <p className="text-2xl font-semibold text-white mt-1">
              {stats.overdue}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="bg-[#18191b] border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Completion Rate</span>
            <span className="text-sm font-medium text-white">
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} className="h-2 bg-white/10" />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 bg-[#18191b] border-white/10 text-white text-sm">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1f2126] border-white/10 text-white">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 bg-[#18191b] border-white/10 text-white text-sm">
            <Flag className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1f2126] border-white/10 text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/50 hover:text-white"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Sort
        </Button>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filtered.map((activity) => {
          const Icon = typeIcons[activity.type];
          const color = typeColors[activity.type];
          return (
            <Card
              key={activity.id}
              className={`bg-[#18191b] border-white/10 hover:border-white/20 transition-colors ${
                activity.status === "overdue"
                  ? "border-l-2 border-l-[#be6464]"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-white">
                            {activity.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${statusColors[activity.status]}`}
                          >
                            {activity.status.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${priorityColors[activity.priority]}`}
                          >
                            {activity.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/50">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                          {activity.contact !== "-" && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {activity.contact}
                            </span>
                          )}
                          {activity.company !== "-" && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {activity.company}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.dueDate} at {activity.dueTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Avatar className="w-7 h-7 bg-[#6452db]">
                          <AvatarFallback className="bg-[#6452db] text-white text-[10px]">
                            {activity.assignee
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
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
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5">
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 text-[#be6464]">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No activities found</p>
          </div>
        )}
      </div>
    </div>
  );
}