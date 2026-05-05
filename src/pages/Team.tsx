import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Crown,
  UserCog,
  User,
  Lock,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  team: string;
  status: "active" | "inactive" | "pending";
  permissions: string[];
  lastActive: string;
  twoFactor: boolean;
}

interface Department {
  id: string;
  name: string;
  head: string;
  memberCount: number;
  teams: { id: string; name: string; memberCount: number }[];
}

const departments: Department[] = [
  {
    id: "1",
    name: "Engineering",
    head: "David Kim",
    memberCount: 24,
    teams: [
      { id: "t1", name: "Platform", memberCount: 8 },
      { id: "t2", name: "Frontend", memberCount: 6 },
      { id: "t3", name: "DevOps", memberCount: 4 },
      { id: "t4", name: "QA", memberCount: 6 },
    ],
  },
  {
    id: "2",
    name: "Sales",
    head: "Sarah Chen",
    memberCount: 18,
    teams: [
      { id: "t5", name: "Enterprise", memberCount: 6 },
      { id: "t6", name: "SMB", memberCount: 8 },
      { id: "t7", name: "SDR", memberCount: 4 },
    ],
  },
  {
    id: "3",
    name: "Marketing",
    head: "Emily Watson",
    memberCount: 12,
    teams: [
      { id: "t8", name: "Content", memberCount: 4 },
      { id: "t9", name: "Growth", memberCount: 5 },
      { id: "t10", name: "Design", memberCount: 3 },
    ],
  },
  {
    id: "4",
    name: "Customer Success",
    head: "Lisa Park",
    memberCount: 15,
    teams: [
      { id: "t11", name: "Onboarding", memberCount: 5 },
      { id: "t12", name: "Support", memberCount: 7 },
      { id: "t13", name: "Account Management", memberCount: 3 },
    ],
  },
];

const teamMembers: TeamMember[] = [
  { id: "1", name: "Alex Grant", email: "alex@nexuscrm.io", role: "Super Admin", department: "Engineering", team: "Platform", status: "active", permissions: ["all"], lastActive: "Now", twoFactor: true },
  { id: "2", name: "Sarah Chen", email: "sarah@nexuscrm.io", role: "Admin", department: "Sales", team: "Enterprise", status: "active", permissions: ["deals", "contacts", "reports"], lastActive: "5 min ago", twoFactor: true },
  { id: "3", name: "Mike Ross", email: "mike@nexuscrm.io", role: "Manager", department: "Sales", team: "SMB", status: "active", permissions: ["deals", "contacts"], lastActive: "1 hr ago", twoFactor: false },
  { id: "4", name: "David Kim", email: "david@nexuscrm.io", role: "Manager", department: "Engineering", team: "Platform", status: "active", permissions: ["integrations", "settings"], lastActive: "2 hr ago", twoFactor: true },
  { id: "5", name: "Emily Watson", email: "emily@nexuscrm.io", role: "Manager", department: "Marketing", team: "Growth", status: "active", permissions: ["contacts", "reports"], lastActive: "30 min ago", twoFactor: true },
  { id: "6", name: "Lisa Park", email: "lisa@nexuscrm.io", role: "User", department: "Customer Success", team: "Support", status: "active", permissions: ["contacts"], lastActive: "15 min ago", twoFactor: false },
  { id: "7", name: "James Wilson", email: "james@nexuscrm.io", role: "User", department: "Engineering", team: "Frontend", status: "inactive", permissions: ["contacts"], lastActive: "3 days ago", twoFactor: false },
  { id: "8", name: "Anna Martinez", email: "anna@nexuscrm.io", role: "User", department: "Sales", team: "SDR", status: "pending", permissions: [], lastActive: "Never", twoFactor: false },
];

const roleIcons: Record<string, any> = {
  "Super Admin": Crown,
  "Admin": ShieldCheck,
  "Manager": UserCog,
  "User": User,
};

const roleColors: Record<string, string> = {
  "Super Admin": "bg-coral/15 text-coral border-coral/20",
  "Admin": "bg-violet/15 text-violet border-violet/20",
  "Manager": "bg-electric-blue/15 text-electric-blue border-electric-blue/20",
  "User": "bg-white/5 text-white/45 border-white/10",
};

const statusColors: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  inactive: "bg-white/5 text-white/45 border-white/10",
  pending: "bg-warning/15 text-warning border-warning/20",
};

export default function Team() {
  const [activeTab, setActiveTab] = useState<"members" | "hierarchy">("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDepts, setExpandedDepts] = useState<string[]>(["1"]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredMembers = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDept = (id: string) => {
    setExpandedDepts((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-app font-bold text-white">Team & Organization</h1>
          <p className="text-sm text-white/45 mt-0.5">
            Manage team members, roles, and organizational structure
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-violet hover:bg-violet/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-elevated border-hairline-soft text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-app font-bold">Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/65">Email Address</Label>
                <Input className="bg-surface border-hairline-soft text-white placeholder:text-white/30" placeholder="colleague@company.com" type="email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/65">Role</Label>
                  <Select>
                    <SelectTrigger className="bg-surface border-hairline-soft text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-elevated border-hairline-soft">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/65">Department</Label>
                  <Select>
                    <SelectTrigger className="bg-surface border-hairline-soft text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-elevated border-hairline-soft">
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full bg-violet hover:bg-violet/90 text-white" onClick={() => setShowAddDialog(false)}>
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface rounded-lg border border-hairline-soft p-1 w-fit">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "members"
              ? "bg-violet text-white"
              : "text-white/45 hover:text-white/65"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Members
        </button>
        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "hierarchy"
              ? "bg-violet text-white"
              : "text-white/45 hover:text-white/65"
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Hierarchy
        </button>
      </div>

      {activeTab === "members" ? (
        <>
          {/* Search & Filters */}
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded-md bg-canvas border border-hairline-soft text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Badge variant="outline" className="border-hairline-soft text-white/45">
                    <ShieldCheck className="w-3 h-3 mr-1 text-success" />
                    {teamMembers.filter(m => m.twoFactor).length} with 2FA
                  </Badge>
                  <Badge variant="outline" className="border-hairline-soft text-white/45">
                    <Users className="w-3 h-3 mr-1" />
                    {teamMembers.length} total
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card className="bg-surface border-hairline-soft rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="data-table-header text-left">
                    <th className="px-4 py-2.5 font-app font-medium">Member</th>
                    <th className="px-4 py-2.5 font-app font-medium">Role</th>
                    <th className="px-4 py-2.5 font-app font-medium">Department</th>
                    <th className="px-4 py-2.5 font-app font-medium">Team</th>
                    <th className="px-4 py-2.5 font-app font-medium">Status</th>
                    <th className="px-4 py-2.5 font-app font-medium">2FA</th>
                    <th className="px-4 py-2.5 font-app font-medium">Last Active</th>
                    <th className="px-4 py-2.5 font-app font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => {
                    const RoleIcon = roleIcons[member.role] || User;
                    return (
                      <tr key={member.id} className="data-table-row hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-hairline-soft">
                              <AvatarFallback className="bg-surface-elevated text-white text-xs font-app">
                                {member.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white/85">{member.name}</p>
                              <p className="text-xs text-white/30">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`${roleColors[member.role]} text-xs`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {member.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-white/65">{member.department}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-white/65">{member.team}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`${statusColors[member.status]} text-xs capitalize`}>
                            {member.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {member.twoFactor ? (
                            <ShieldCheck className="w-4 h-4 text-success" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-warning" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-white/45">{member.lastActive}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-md text-white/30 hover:text-white/65 hover:bg-white/5 transition-colors">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-surface-elevated border-hairline-soft text-white">
                              <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                                <Pencil className="w-4 h-4 mr-2" /> Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                                <Lock className="w-4 h-4 mr-2" /> Manage Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-app-error hover:bg-white/5 focus:bg-white/5 focus:text-app-error cursor-pointer">
                                <Trash2 className="w-4 h-4 mr-2" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* Hierarchy View */
        <div className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet/15 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-violet" />
                </div>
                <div>
                  <h2 className="text-lg font-app font-bold text-white">NexusCRM Inc.</h2>
                  <p className="text-sm text-white/45">{teamMembers.length} members across {departments.length} departments</p>
                </div>
              </div>

              <div className="space-y-3">
                {departments.map((dept) => {
                  const isExpanded = expandedDepts.includes(dept.id);
                  return (
                    <div key={dept.id} className="border border-hairline-soft rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDept(dept.id)}
                        className="flex items-center justify-between w-full p-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-white/45" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/45" />
                          )}
                          <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                            <Users className="w-4 h-4 text-white/45" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-white/85">{dept.name}</p>
                            <p className="text-xs text-white/30">Head: {dept.head}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-hairline-soft text-white/45 text-xs">
                            {dept.memberCount} members
                          </Badge>
                          <Badge variant="outline" className="border-hairline-soft text-white/45 text-xs">
                            {dept.teams.length} teams
                          </Badge>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-hairline-soft">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                            {dept.teams.map((team) => (
                              <Card key={team.id} className="bg-surface-elevated border-hairline-soft">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-white/85">{team.name}</p>
                                    <Users className="w-3.5 h-3.5 text-white/30" />
                                  </div>
                                  <p className="text-xs text-white/30">{team.memberCount} members</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
