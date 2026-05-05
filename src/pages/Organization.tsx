import { useState } from "react";
import {
  Building2,
  Users,
  Shield,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastActive: string;
  permissions: string[];
}

interface Department {
  id: number;
  name: string;
  head: string;
  members: number;
  teams: { id: number; name: string; members: number }[];
}

const departments: Department[] = [
  {
    id: 1,
    name: "Sales",
    head: "Sarah Chen",
    members: 12,
    teams: [
      { id: 1, name: "Enterprise Sales", members: 5 },
      { id: 2, name: "Mid-Market", members: 4 },
      { id: 3, name: "SDR Team", members: 3 },
    ],
  },
  {
    id: 2,
    name: "Engineering",
    head: "James Wilson",
    members: 24,
    teams: [
      { id: 4, name: "Platform", members: 8 },
      { id: 5, name: "Frontend", members: 6 },
      { id: 6, name: "DevOps", members: 4 },
      { id: 7, name: "QA", members: 6 },
    ],
  },
  {
    id: 3,
    name: "Marketing",
    head: "Emily Brown",
    members: 8,
    teams: [
      { id: 8, name: "Content", members: 3 },
      { id: 9, name: "Growth", members: 3 },
      { id: 10, name: "Design", members: 2 },
    ],
  },
  {
    id: 4,
    name: "Customer Success",
    head: "Maria Garcia",
    members: 10,
    teams: [
      { id: 11, name: "Onboarding", members: 4 },
      { id: 12, name: "Support", members: 6 },
    ],
  },
];

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@startops.com",
    role: "Admin",
    department: "Executive",
    status: "Active",
    lastActive: "Now",
    permissions: ["Full Access", "User Management", "Billing"],
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah@startops.com",
    role: "Manager",
    department: "Sales",
    status: "Active",
    lastActive: "2 min ago",
    permissions: ["Deal Management", "Contact Management", "Reports"],
  },
  {
    id: 3,
    name: "James Wilson",
    email: "james@startops.com",
    role: "Manager",
    department: "Engineering",
    status: "Active",
    lastActive: "1 hr ago",
    permissions: ["API Access", "Integration Management"],
  },
  {
    id: 4,
    name: "Mike Ross",
    email: "mike@startops.com",
    role: "User",
    department: "Sales",
    status: "Active",
    lastActive: "5 min ago",
    permissions: ["Contact Management", "Deal View"],
  },
  {
    id: 5,
    name: "Lisa Park",
    email: "lisa@startops.com",
    role: "User",
    department: "Marketing",
    status: "Away",
    lastActive: "3 hr ago",
    permissions: ["Contact View", "Campaign Management"],
  },
  {
    id: 6,
    name: "David Kim",
    email: "david@startops.com",
    role: "Viewer",
    department: "Sales",
    status: "Inactive",
    lastActive: "2 days ago",
    permissions: ["Contact View"],
  },
];

const roles = [
  {
    name: "Admin",
    description: "Full system access and configuration",
    users: 2,
    permissions: 28,
    color: "#ff8964",
  },
  {
    name: "Manager",
    description: "Team management and reporting access",
    users: 4,
    permissions: 18,
    color: "#5683da",
  },
  {
    name: "User",
    description: "Standard CRM operations",
    users: 18,
    permissions: 12,
    color: "#6452db",
  },
  {
    name: "Viewer",
    description: "Read-only access to assigned data",
    users: 6,
    permissions: 6,
    color: "#8dc572",
  },
];

const statusColors: Record<string, string> = {
  Active: "bg-[#8dc572]/20 text-[#8dc572]",
  Away: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  Inactive: "bg-white/10 text-white/50",
};

export default function Organization() {
  const [expandedDepts, setExpandedDepts] = useState<number[]>([1]);
  const [search, setSearch] = useState("");

  const toggleDept = (id: number) => {
    setExpandedDepts((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const filteredMembers = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Organization
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Manage teams, roles, and permissions
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Email Address</Label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  className="bg-[#0b0d10] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Role</Label>
                <Select>
                  <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Department</Label>
                <Select>
                  <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="cs">Customer Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="structure" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="structure"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Structure
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Shield className="w-4 h-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="mt-6">
          <div className="space-y-3">
            {departments.map((dept) => (
              <Card
                key={dept.id}
                className="bg-[#18191b] border-white/10"
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleDept(dept.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {expandedDepts.includes(dept.id) ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-[#6452db]" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-medium text-white">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-white/40">
                        Head: {dept.head} · {dept.members} members
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-white/10 text-white/50 text-xs"
                    >
                      {dept.teams.length} teams
                    </Badge>
                  </button>

                  {expandedDepts.includes(dept.id) && (
                    <div className="px-4 pb-4 pl-12 space-y-2">
                      {dept.teams.map((team) => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between p-3 rounded-md bg-[#0b0d10] border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-white/30" />
                            <span className="text-sm text-white/70">
                              {team.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/40">
                              {team.members} members
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-white/30 hover:text-white hover:bg-white/5"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/40 hover:text-white hover:bg-white/5"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Team
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
              />
            </div>
          </div>

          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 bg-[#6452db]">
                            <AvatarFallback className="bg-[#6452db] text-white text-xs">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {member.name}
                            </p>
                            <p className="text-xs text-white/40">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className="bg-[#6452db]/20 text-[#6452db] text-xs"
                        >
                          {member.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/70">
                        {member.department}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${statusColors[member.status]}`}
                        >
                          {member.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/50">
                        {member.lastActive}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card
                key={role.name}
                className="bg-[#18191b] border-white/10"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <Shield
                        className="w-5 h-5"
                        style={{ color: role.color }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/40 hover:text-[#be6464] hover:bg-white/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {role.name}
                  </h3>
                  <p className="text-sm text-white/50 mb-4">
                    {role.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-white/30" />
                      <span className="text-white/50">
                        {role.users} users
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-white/30" />
                      <span className="text-white/50">
                        {role.permissions} permissions
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
