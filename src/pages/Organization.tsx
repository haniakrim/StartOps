import { useState, useEffect } from "react";
import {
  Building2, Users, Shield, ChevronRight, ChevronDown, Plus, Search, Pencil, Trash2, UserPlus, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/contexts/AuthContext";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastActive: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  members: number;
  teams: { id: string; name: string; members: number }[];
}

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Away: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  Inactive: "bg-muted text-muted-foreground",
};

export default function Organization() {
  const { organizationId } = useOrganization();
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteDept, setInviteDept] = useState("");
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  useEffect(() => { fetchOrganizationData(); }, [organizationId]);

  async function fetchOrganizationData() {
    if (!organizationId) {
      setLoading(false);
      setDepartments([]);
      setMembers([]);
      return;
    }
    try {
      setLoading(true);

      const { data: deptsData, error: deptsError } = await supabase
        .from("departments")
        .select("*")
        .eq("organization_id", organizationId)
        .order("name");
      if (deptsError) throw deptsError;

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .eq("organization_id", organizationId);
      if (teamsError) throw teamsError;

      const deptsWithTeams = (deptsData || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        head: d.manager_id ? "Assigned" : "Unassigned",
        members: 0,
        teams: (teamsData || [])
          .filter((t: any) => t.department_id === d.id)
          .map((t: any) => ({ id: t.id, name: t.name, members: 0 })),
      }));

      setDepartments(deptsWithTeams);
      if (deptsWithTeams.length > 0) setExpandedDepts([deptsWithTeams[0].id]);

      const { data: membersData, error: membersError } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", organizationId)
        .order("joined_at", { ascending: false });

      if (membersError) throw membersError;

      const userIds = [...new Set((membersData || []).map((m: any) => m.user_id).filter(Boolean))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, role")
          .in("id", userIds);
        (profilesData || []).forEach((p: any) => {
          profilesMap[p.id] = p;
        });
      }

      const mappedMembers = (membersData || []).map((m: any) => {
        const profile = profilesMap[m.user_id] || {};
        return {
          id: m.id,
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown",
          email: profile.email || "No email",
          role: m.role || "Member",
          department: deptsData?.find((d: any) => d.id === m.department_id)?.name || "Unassigned",
          status: "Active",
          lastActive: "Recently",
        };
      });

      setMembers(mappedMembers);
    } catch (error: any) {
      toast.error("Failed to load organization data: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!organizationId || !inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    try {
      // Check if user with this email already exists in auth
      const { data: existingUsers } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", inviteEmail.trim())
        .single();

      if (existingUsers) {
        // Add existing user to org
        const { error } = await supabase.from("organization_members").insert({
          organization_id: organizationId,
          user_id: existingUsers.id,
          role: inviteRole,
          department_id: inviteDept || null,
        });
        if (error) throw error;
        toast.success(`${inviteEmail} added to organization`);
      } else {
        toast.info(`Invitation would be sent to ${inviteEmail} (demo - needs email service setup)`);
      }

      setDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      setInviteDept("");
      fetchOrganizationData();
    } catch (error: any) {
      toast.error("Failed to invite: " + error.message);
    }
  }

  async function addDepartment() {
    if (!organizationId || !newDeptName.trim()) return;
    try {
      const { error } = await supabase.from("departments").insert({
        name: newDeptName.trim(),
        organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Department created");
      setAddDeptOpen(false);
      setNewDeptName("");
      fetchOrganizationData();
    } catch (error: any) {
      toast.error("Failed to create department: " + error.message);
    }
  }

  async function removeMember(memberId: string) {
    try {
      const { error } = await supabase.from("organization_members").delete().eq("id", memberId);
      if (error) throw error;
      toast.success("Member removed");
      fetchOrganizationData();
    } catch (error: any) {
      toast.error("Failed to remove member: " + error.message);
    }
  }

  const toggleDept = (id: string) => {
    setExpandedDepts((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const roles = [
    { name: "Admin", description: "Full system access and configuration", users: members.filter((m) => m.role.toLowerCase() === "admin").length, permissions: 28, color: "hsl(var(--hp-orange))" },
    { name: "Manager", description: "Team management and reporting access", users: members.filter((m) => m.role.toLowerCase() === "manager").length, permissions: 18, color: "hsl(var(--hp-blue-light))" },
    { name: "Member", description: "Standard CRM operations", users: members.filter((m) => m.role.toLowerCase() === "member" || m.role.toLowerCase() === "user").length, permissions: 12, color: "hsl(var(--primary))" },
    { name: "Viewer", description: "Read-only access to assigned data", users: members.filter((m) => m.role.toLowerCase() === "viewer").length, permissions: 6, color: "hsl(var(--hp-green))" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Organization</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage teams, roles, and permissions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={inviteDept} onValueChange={setInviteDept}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleInvite}>Send Invitation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="structure" className="w-full">
        <TabsList>
          <TabsTrigger value="structure"><Building2 className="w-4 h-4 mr-2" />Structure</TabsTrigger>
          <TabsTrigger value="members"><Users className="w-4 h-4 mr-2" />Members</TabsTrigger>
          <TabsTrigger value="roles"><Shield className="w-4 h-4 mr-2" />Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog open={addDeptOpen} onOpenChange={setAddDeptOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Department</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Engineering" />
                  </div>
                  <Button className="w-full" onClick={addDepartment}>Create Department</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardContent className="p-0">
                  <button onClick={() => toggleDept(dept.id)} className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                    {expandedDepts.includes(dept.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"><Building2 className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-medium text-foreground">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground">Head: {dept.head} · {dept.teams.length} teams</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{dept.teams.length} teams</Badge>
                  </button>
                  {expandedDepts.includes(dept.id) && (
                    <div className="px-4 pb-4 pl-12 space-y-2">
                      {dept.teams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between p-3 rounded-md bg-muted border border-border/50">
                          <div className="flex items-center gap-3"><Users className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">{team.name}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {departments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No departments configured yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{member.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                          <div><p className="text-sm font-medium text-foreground">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}</p></div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Badge variant="secondary" className="text-xs text-primary">{member.role}</Badge></td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{member.department}</td>
                      <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${statusColors[member.status]}`}>{member.status}</Badge></td>
                      <td className="py-3 px-4">
                        {member.email !== (user?.email || "") && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeMember(member.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground/50">{search ? "No members match your search" : "No members yet."}</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card key={role.name}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${role.color}20` }}>
                      <Shield className="w-5 h-5" style={{ color: role.color }} />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{role.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground/50" /><span className="text-muted-foreground">{role.users} users</span></div>
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground/50" /><span className="text-muted-foreground">{role.permissions} permissions</span></div>
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
